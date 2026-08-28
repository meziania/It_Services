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

const BASE_URL = 'https://khamsat.com';
const REQUESTS_URL = `${BASE_URL}/community/requests`;

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

interface ParsedRequest {
  externalId: string;
  url: string;
  title: string;
  companyName?: string;
  descriptionRaw: string;
  rawHtml: string;
}

export interface KhamsatRunSummary {
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
export class KhamsatService {
  private readonly logger = new Logger(KhamsatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  private async ensureSource() {
    return this.prisma.platformSource.upsert({
      where: { platform_name: { platform: Platform.KHAMSAT, name: 'Khamsat' } },
      update: {},
      create: {
        platform: Platform.KHAMSAT,
        name: 'Khamsat',
        type: SourceType.FREELANCE_MARKETPLACE,
        baseUrl: BASE_URL,
        frequencyMinutes: 6 * 60,
        maxPages: 1,
        config: {},
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

  private parseListing(html: string): ParsedRequest[] {
    const $ = cheerio.load(html);
    const requests: ParsedRequest[] = [];
    const seen = new Set<string>();

    $('tr.forum_post').each((_, el) => {
      const $row = $(el);
      const anchor = $row.find('a[href*="/community/requests/"]').first();
      const href = anchor.attr('href')?.trim();
      if (!href || href.endsWith('/requests') || href.includes('/new')) return;

      const url = href.startsWith('http') ? href : new URL(href, BASE_URL).toString();
      const idMatch = url.match(/\/community\/requests\/(\d+)/);
      if (!idMatch) return;
      const externalId = idMatch[1];
      if (seen.has(externalId)) return;
      seen.add(externalId);

      const title = anchor.text().replace(/\s+/g, ' ').trim();
      if (!title) return;

      const authorHref = $row.find('a[href^="/user/"]').first().attr('href');
      const companyName = authorHref
        ? authorHref.replace(/^\/user\//, '')
        : undefined;

      requests.push({
        externalId,
        url,
        title,
        companyName,
        descriptionRaw: title,
        rawHtml: $.html($row),
      });
    });

    return requests;
  }

  /**
   * Detail page may require login; when public HTML is available we enrich
   * description. Failures are soft — listing title is enough for MVP.
   */
  private async tryEnrichDetail(request: ParsedRequest): Promise<ParsedRequest> {
    try {
      const html = await this.fetchHtml(request.url);
      const $ = cheerio.load(html);
      const body = $(
        '.post-content, .topic-body, .forum-post-body, article .content, .details-body',
      )
        .first()
        .text()
        .replace(/\s+/g, ' ')
        .trim();
      if (body && body.length > request.title.length) {
        return { ...request, descriptionRaw: body.slice(0, 4000), rawHtml: html };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Khamsat detail skip ${request.externalId}: ${message}`);
    }
    return request;
  }

  async run(): Promise<KhamsatRunSummary> {
    const source = await this.ensureSource();
    const settings = await this.settingsService.get();
    const skills = settings.skills;
    const weights = settings.weights as unknown as ScoringWeights;

    const summary: KhamsatRunSummary = {
      fetched: 0,
      newRawDocuments: 0,
      offersCreated: 0,
      offersUpdated: 0,
      skippedDuplicates: 0,
      skippedNotIt: 0,
      errors: [],
    };

    try {
      this.logger.log(`Fetching Khamsat requests ${REQUESTS_URL}`);
      const html = await this.fetchHtml(REQUESTS_URL);
      summary.fetched += 1;

      let requests = this.parseListing(html);
      // Cap detail enrichment to stay polite (Docs2/15 rate limits).
      const toEnrich = requests.slice(0, 15);
      const rest = requests.slice(15);
      const enriched: ParsedRequest[] = [];
      for (const req of toEnrich) {
        enriched.push(await this.tryEnrichDetail(req));
        await sleep(1500);
      }
      requests = [...enriched, ...rest];

      for (const request of requests) {
        await this.persistRequest(source.id, request, summary, skills, weights);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Khamsat run failed: ${message}`);
      summary.errors.push(message);
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

  private async persistRequest(
    sourceId: string,
    request: ParsedRequest,
    summary: KhamsatRunSummary,
    skills: string[],
    weights: ScoringWeights,
  ) {
    const urlHash = hashUrl(request.url);
    const existingRaw = await this.prisma.rawDocument.findUnique({ where: { urlHash } });
    if (existingRaw) {
      summary.skippedDuplicates += 1;
      return;
    }

    const searchText = `${request.title} ${request.descriptionRaw}`;
    // User scope: freelance IT only (dev / sécu / data / ERP / CRM).
    if (!isCoreItMission(searchText)) {
      await this.prisma.rawDocument.create({
        data: {
          sourceId,
          url: request.url,
          urlHash,
          contentType: 'text/html',
          rawContent: request.rawHtml,
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
        url: request.url,
        urlHash,
        contentType: 'text/html',
        rawContent: request.rawHtml,
        status: DocumentStatus.PROCESSED,
        processedAt: new Date(),
      },
    });
    summary.newRawDocuments += 1;

    const { score, reasons } = computeMatchScore({
      text: searchText,
      itCategory,
      offerType: OfferType.BUYER_REQUEST,
      remote: true,
      budgetText: undefined,
      publishedAt: new Date(),
      location: undefined,
      skills,
      weights,
    });

    const result = await this.prisma.jobOffer.upsert({
      where: {
        platform_externalId: { platform: Platform.KHAMSAT, externalId: request.externalId },
      },
      update: {
        matchScore: score,
        matchReasons: reasons,
        itCategory,
        descriptionRaw: request.descriptionRaw,
        descriptionClean: request.descriptionRaw,
        companyName: request.companyName,
      },
      create: {
        platform: Platform.KHAMSAT,
        sourceId,
        rawDocumentId: rawDocument.id,
        externalId: request.externalId,
        url: request.url,
        title: request.title.slice(0, 250),
        descriptionRaw: request.descriptionRaw,
        descriptionClean: request.descriptionRaw,
        companyName: request.companyName,
        remote: true,
        offerType: OfferType.BUYER_REQUEST,
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

    await this.persistContacts(result.id, searchText, request.url);
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
