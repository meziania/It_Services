import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import {
  ContactType,
  DocumentStatus,
  ItCategory,
  OfferType,
  Platform,
  SourceType,
} from '@serviceit-scanner/database';
import { PrismaService } from '../../prisma/prisma.service';
import { classifyItCategory, isCoreItMission } from '../../offers/classification';
import { computeMatchScore } from '../../offers/scoring';
import { extractContacts } from '../../offers/contact-extraction';
import { SettingsService } from '../../settings/settings.service';
import type { ScoringWeights } from '../../offers/scoring';

const BASE_URL = 'https://mostaql.com';

/** Public project listing URLs — development filter + open board (classify filters). */
const DEFAULT_LISTING_PATHS = ['/projects?category=development', '/projects'];

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

interface ParsedProject {
  externalId: string;
  url: string;
  title: string;
  descriptionRaw: string;
  companyName?: string;
  budgetText?: string;
  rawHtml: string;
}

export interface MostaqlRunSummary {
  listings: string[];
  fetched: number;
  newRawDocuments: number;
  offersCreated: number;
  offersUpdated: number;
  skippedDuplicates: number;
  skippedNotIt: number;
  errors: string[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeUrlForHash(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    return `${u.origin}${u.pathname}`.toLowerCase().replace(/\/$/, '');
  } catch {
    return url.trim().toLowerCase();
  }
}

function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(normalizeUrlForHash(url)).digest('hex');
}

@Injectable()
export class MostaqlService {
  private readonly logger = new Logger(MostaqlService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  private async ensureSource() {
    return this.prisma.platformSource.upsert({
      where: { platform_name: { platform: Platform.MOSTAQL, name: 'Mostaql' } },
      update: {},
      create: {
        platform: Platform.MOSTAQL,
        name: 'Mostaql',
        type: SourceType.FREELANCE_MARKETPLACE,
        baseUrl: BASE_URL,
        frequencyMinutes: 6 * 60,
        maxPages: 1,
        config: { listingPaths: DEFAULT_LISTING_PATHS },
      },
    });
  }

  private async fetchHtml(url: string): Promise<string> {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'ar,en;q=0.8',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    return res.text();
  }

  private parseListing(html: string): ParsedProject[] {
    const $ = cheerio.load(html);
    const projects: ParsedProject[] = [];
    const seen = new Set<string>();

    $('.project-row').each((_, el) => {
      const $row = $(el);
      const anchor = $row
        .find('h2 a[href*="/project/"]')
        .filter((_, a) => !/create|template/.test($(a).attr('href') ?? ''))
        .first();
      const href = anchor.attr('href')?.trim();
      if (!href) return;

      const url = href.startsWith('http') ? href : new URL(href, BASE_URL).toString();
      const idMatch = url.match(/\/project\/(\d+)/);
      if (!idMatch) return;
      const externalId = idMatch[1];
      if (seen.has(externalId)) return;
      seen.add(externalId);

      const title = anchor.text().replace(/\s+/g, ' ').trim();
      if (!title) return;

      const brief = $row.find('.project__brief').text().replace(/\s+/g, ' ').trim();
      const author =
        $row.find('.project__meta a').first().text().replace(/\s+/g, ' ').trim() || undefined;

      const budgetMatch = $row.text().match(/\$[\d,.]+(?:\s*[-–]\s*\$[\d,.]+)?/);
      const budgetText = budgetMatch?.[0];

      projects.push({
        externalId,
        url,
        title,
        descriptionRaw: brief || title,
        companyName: author,
        budgetText,
        rawHtml: $.html($row),
      });
    });

    return projects;
  }

  async run(listingPaths?: string[]): Promise<MostaqlRunSummary> {
    const source = await this.ensureSource();
    const settings = await this.settingsService.get();
    const skills = settings.skills;
    const weights = settings.weights as unknown as ScoringWeights;

    const paths =
      listingPaths ??
      (source.config as { listingPaths?: string[] } | null)?.listingPaths ??
      DEFAULT_LISTING_PATHS;

    const summary: MostaqlRunSummary = {
      listings: paths,
      fetched: 0,
      newRawDocuments: 0,
      offersCreated: 0,
      offersUpdated: 0,
      skippedDuplicates: 0,
      skippedNotIt: 0,
      errors: [],
    };

    for (const path of paths) {
      const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
      try {
        this.logger.log(`Fetching Mostaql listing ${url}`);
        const html = await this.fetchHtml(url);
        summary.fetched += 1;
        const projects = this.parseListing(html);
        for (const project of projects) {
          await this.persistProject(source.id, project, summary, skills, weights);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Mostaql fetch failed for ${url}: ${message}`);
        summary.errors.push(`${url}: ${message}`);
      }
      await sleep(2000);
    }

    await this.prisma.platformSource.update({
      where: { id: source.id },
      data: {
        lastRunAt: new Date(),
        lastRunStatus: summary.errors.length > 0 ? 'PARTIAL_FAILURE' : 'OK',
      },
    });

    return summary;
  }

  private async persistProject(
    sourceId: string,
    project: ParsedProject,
    summary: MostaqlRunSummary,
    skills: string[],
    weights: ScoringWeights,
  ) {
    const urlHash = hashUrl(project.url);
    const existingRaw = await this.prisma.rawDocument.findUnique({ where: { urlHash } });
    if (existingRaw) {
      summary.skippedDuplicates += 1;
      return;
    }

    const searchText = `${project.title} ${project.descriptionRaw}`;
    // User scope: freelance IT only (dev / sécu / data / ERP / CRM) — not VA, content, design-only…
    if (!isCoreItMission(searchText)) {
      await this.prisma.rawDocument.create({
        data: {
          sourceId,
          url: project.url,
          urlHash,
          contentType: 'text/html',
          rawContent: project.rawHtml,
          status: DocumentStatus.SKIPPED,
          processedAt: new Date(),
        },
      });
      summary.newRawDocuments += 1;
      summary.skippedNotIt += 1;
      return;
    }
    const itCategory = classifyItCategory(searchText);

    const rawDocument = await this.prisma.rawDocument.create({
      data: {
        sourceId,
        url: project.url,
        urlHash,
        contentType: 'text/html',
        rawContent: project.rawHtml,
        status: DocumentStatus.PROCESSED,
        processedAt: new Date(),
      },
    });
    summary.newRawDocuments += 1;

    const { score, reasons } = computeMatchScore({
      text: searchText,
      itCategory,
      offerType: OfferType.FREELANCE,
      remote: true,
      budgetText: project.budgetText,
      publishedAt: new Date(),
      location: undefined,
      skills,
      weights,
    });

    const result = await this.prisma.jobOffer.upsert({
      where: {
        platform_externalId: { platform: Platform.MOSTAQL, externalId: project.externalId },
      },
      update: {
        matchScore: score,
        matchReasons: reasons,
        itCategory,
        descriptionRaw: project.descriptionRaw,
        budgetText: project.budgetText,
        companyName: project.companyName,
      },
      create: {
        platform: Platform.MOSTAQL,
        sourceId,
        rawDocumentId: rawDocument.id,
        externalId: project.externalId,
        url: project.url,
        title: project.title.slice(0, 250),
        descriptionRaw: project.descriptionRaw,
        descriptionClean: project.descriptionRaw,
        companyName: project.companyName,
        budgetText: project.budgetText,
        remote: true,
        offerType: OfferType.FREELANCE,
        itCategory,
        matchScore: score,
        matchReasons: reasons,
        publishedAt: new Date(),
      },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      summary.offersCreated += 1;
    } else {
      summary.offersUpdated += 1;
    }

    await this.persistContacts(result.id, searchText, project.url);
  }

  private async persistContacts(offerId: string, text: string, platformUrl: string) {
    const extracted = extractContacts(text);
    const withPlatform = [
      ...extracted,
      { type: ContactType.PLATFORM_MESSAGE, value: platformUrl, confidence: 95 },
    ];

    const existing = await this.prisma.offerContact.findMany({
      where: { offerId },
      select: { type: true, value: true },
    });
    const existingKeys = new Set(existing.map((c) => `${c.type}:${c.value}`));
    const toCreate = withPlatform.filter((c) => !existingKeys.has(`${c.type}:${c.value}`));
    if (toCreate.length === 0) return;

    await this.prisma.offerContact.createMany({
      data: toCreate.map((c) => ({
        offerId,
        type: c.type,
        value: c.value,
        confidence: c.confidence,
      })),
    });
  }
}
