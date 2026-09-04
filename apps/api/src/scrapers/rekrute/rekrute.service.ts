import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import {
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
import { isFreelanceOpportunity, refineOfferType } from '../../offers/offer-type';
import { SettingsService } from '../../settings/settings.service';
import type { ScoringWeights } from '../../offers/scoring';
import { notifyHighScoreOffer } from '../../alerts/high-score-alert';

const BASE_URL = 'https://www.rekrute.com';

// Docs2/14 + user focus: IT broadly, but search for freelance/mission first.
const DEFAULT_KEYWORDS = [
  'freelance développeur',
  'freelance informatique',
  'mission informatique',
  'consultant informatique',
  'cybersécurité',
  'big data',
];

// Identifies this as a personal, low-volume research tool rather than
// pretending to be a browser — see Docs2/15 "Légal" checklist.
const USER_AGENT =
  'Mozilla/5.0 (compatible; ServiceItScannerBot/0.1; +personal freelance-lead research tool)';

interface ParsedOffer {
  externalId: string;
  url: string;
  title: string;
  descriptionRaw: string;
  companyName?: string;
  companyUrl?: string;
  location?: string;
  publishedAt?: Date;
  deadline?: Date;
  offerType: OfferType;
  remote?: boolean;
  rawHtml: string;
}

export interface RekruteRunSummary {
  keywords: string[];
  fetched: number;
  newRawDocuments: number;
  offersCreated: number;
  offersUpdated: number;
  skippedDuplicates: number;
  skippedNotIt: number;
  skippedNotFreelance: number;
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

/** Parses "dd/mm/yyyy" as used throughout ReKrute listings. */
function parseFrenchDate(text: string | undefined): Date | undefined {
  if (!text) return undefined;
  const match = text.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function mapContractType(text: string | undefined): OfferType {
  const normalized = (text ?? '').toLowerCase();
  if (/freelance|ind[ée]pendant|prestataire|auto[\s-]?entrepreneur/.test(normalized)) {
    return OfferType.FREELANCE;
  }
  if (/cdd|int[ée]rim|stage/.test(normalized)) {
    return OfferType.CONTRACT;
  }
  // ReKrute is primarily a permanent-recruitment board (Docs2/04); default
  // to FULL_TIME so the scoring engine correctly deprioritizes it vs. real
  // freelance missions (Docs2/16 "CDI only -30").
  return OfferType.FULL_TIME;
}

@Injectable()
export class RekruteService {
  private readonly logger = new Logger(RekruteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  private async ensureSource() {
    return this.prisma.platformSource.upsert({
      where: { platform_name: { platform: Platform.REKRUTE, name: 'ReKrute' } },
      update: {},
      create: {
        platform: Platform.REKRUTE,
        name: 'ReKrute',
        type: SourceType.JOB_BOARD,
        baseUrl: BASE_URL,
        frequencyMinutes: 24 * 60, // daily, per Docs2/04 "Job boards: quotidien"
        maxPages: 1,
        config: { keywords: DEFAULT_KEYWORDS },
      },
    });
  }

  private buildSearchUrl(keyword: string): string {
    // ReKrute's live search uses `keyword` (not the legacy `motcle` param).
    return `${BASE_URL}/offres.html?s=1&keyword=${encodeURIComponent(keyword)}`;
  }

  private async fetchHtml(url: string): Promise<string> {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching ${url}`);
    }
    return res.text();
  }

  private parseListing(html: string): ParsedOffer[] {
    const $ = cheerio.load(html);
    const offers: ParsedOffer[] = [];

    $('li.post-id').each((_, el) => {
      const $card = $(el);
      const externalId = $card.attr('id')?.trim();
      const titleAnchor = $card.find('a.titreJob').first();
      const relativeUrl = titleAnchor.attr('href');
      if (!externalId || !relativeUrl) return; // malformed card, skip

      const rawTitle = titleAnchor.text().replace(/\s+/g, ' ').trim();
      const [titlePart, locationPart] = rawTitle.split('|').map((s) => s?.trim());

      const companyAnchor = $card.find('.col-sm-2 a, .col-sm-2.col-xs-12 a').first();
      const companyRelativeUrl = companyAnchor.attr('href');
      const companyName = companyAnchor.find('img').attr('alt')?.trim();

      const descriptionRaw = $card
        .find('div.info span')
        .first()
        .text()
        .replace(/\s+/g, ' ')
        .trim();

      const dateSpans = $card.find('em.date span');
      const publishedAt = parseFrenchDate(dateSpans.eq(0).text());
      const deadline = parseFrenchDate(dateSpans.eq(1).text());

      let contractTypeText: string | undefined;
      let remote: boolean | undefined;
      $card.find('ul li').each((_i, li) => {
        const liText = $(li).text().replace(/\s+/g, ' ').trim();
        if (/type de contrat propos[ée]/i.test(liText)) {
          contractTypeText = $(li).find('a').text().trim() || liText;
          const remoteMatch = liText.match(/T[ée]l[ée]travail\s*:\s*(oui|non)/i);
          if (remoteMatch) remote = remoteMatch[1].toLowerCase() === 'oui';
        }
      });

      offers.push({
        externalId,
        url: new URL(relativeUrl, BASE_URL).toString(),
        title: titlePart || rawTitle,
        descriptionRaw: descriptionRaw || rawTitle,
        companyName,
        companyUrl: companyRelativeUrl ? new URL(companyRelativeUrl, BASE_URL).toString() : undefined,
        location: locationPart,
        publishedAt,
        deadline,
        offerType: mapContractType(contractTypeText),
        remote,
        rawHtml: $.html($card),
      });
    });

    return offers;
  }

  async run(keywords: string[] = DEFAULT_KEYWORDS): Promise<RekruteRunSummary> {
    const source = await this.ensureSource();
    const settings = await this.settingsService.get();
    const skills = settings.skills;
    const weights = settings.weights as unknown as ScoringWeights;
    const summary: RekruteRunSummary = {
      keywords,
      fetched: 0,
      newRawDocuments: 0,
      offersCreated: 0,
      offersUpdated: 0,
      skippedDuplicates: 0,
      skippedNotIt: 0,
      skippedNotFreelance: 0,
      errors: [],
    };

    for (const keyword of keywords) {
      try {
        const url = this.buildSearchUrl(keyword);
        this.logger.log(`Fetching ReKrute results for "${keyword}"`);
        const html = await this.fetchHtml(url);
        summary.fetched += 1;

        const parsedOffers = this.parseListing(html);
        for (const offer of parsedOffers) {
          await this.persistOffer(source.id, offer, summary, skills, weights);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`ReKrute fetch failed for "${keyword}": ${message}`);
        summary.errors.push(`${keyword}: ${message}`);
      }

      // Politeness delay between requests (Docs2/05 retry/rate-limit spirit).
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

  private async persistOffer(
    sourceId: string,
    offer: ParsedOffer,
    summary: RekruteRunSummary,
    skills: string[],
    weights: ScoringWeights,
  ) {
    const urlHash = hashUrl(offer.url);

    const existingRawDocument = await this.prisma.rawDocument.findUnique({
      where: { urlHash },
    });
    if (existingRawDocument) {
      summary.skippedDuplicates += 1;
      return;
    }

    const searchText = `${offer.title} ${offer.descriptionRaw}`;
    const itCategory = classifyItCategory(searchText);
    const offerType = refineOfferType(offer.offerType, searchText);
    // User scope: freelance missions only + IT (dev / sécu / data / ERP / CRM).
    const keep = isCoreItMission(searchText) && isFreelanceOpportunity(offerType);

    const rawDocument = await this.prisma.rawDocument.create({
      data: {
        sourceId,
        url: offer.url,
        urlHash,
        contentType: 'text/html',
        rawContent: offer.rawHtml,
        status: keep ? DocumentStatus.PROCESSED : DocumentStatus.SKIPPED,
        processedAt: new Date(),
      },
    });
    summary.newRawDocuments += 1;

    if (!isCoreItMission(searchText) || itCategory === ItCategory.NOT_IT) {
      summary.skippedNotIt += 1;
      return;
    }
    if (!isFreelanceOpportunity(offerType)) {
      // Personal scanner = freelance / mission only (Docs2/16) — CDI/CDD skipped.
      summary.skippedNotFreelance += 1;
      return;
    }

    const { score, reasons } = computeMatchScore({
      text: searchText,
      itCategory,
      offerType,
      remote: offer.remote,
      budgetText: undefined, // ReKrute listings don't publish a budget
      publishedAt: offer.publishedAt,
      location: offer.location,
      skills,
      weights,
    });

    const result = await this.prisma.jobOffer.upsert({
      where: {
        platform_externalId: { platform: Platform.REKRUTE, externalId: offer.externalId },
      },
      update: {
        matchScore: score,
        matchReasons: reasons,
        itCategory,
        offerType,
      },
      create: {
        platform: Platform.REKRUTE,
        sourceId,
        rawDocumentId: rawDocument.id,
        externalId: offer.externalId,
        url: offer.url,
        title: offer.title,
        descriptionRaw: offer.descriptionRaw,
        companyName: offer.companyName,
        companyUrl: offer.companyUrl,
        location: offer.location,
        publishedAt: offer.publishedAt,
        deadline: offer.deadline,
        remote: offer.remote,
        offerType,
        itCategory,
        matchScore: score,
        matchReasons: reasons,
      },
    });

    // Prisma's upsert doesn't tell us which branch ran; infer from createdAt === updatedAt.
    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      summary.offersCreated += 1;
      await notifyHighScoreOffer({
        id: result.id,
        title: result.title,
        matchScore: result.matchScore,
        url: result.url,
        platform: Platform.REKRUTE,
      });
    } else {
      summary.offersUpdated += 1;
    }

    await this.persistContacts(result.id, `${offer.title} ${offer.descriptionRaw}`);
  }

  /** Docs2/16 "Trouve les contacts publics" — regex-only, IN_POST source. */
  private async persistContacts(offerId: string, text: string) {
    const extracted = extractContacts(text);
    if (extracted.length === 0) return;

    const existing = await this.prisma.offerContact.findMany({
      where: { offerId },
      select: { type: true, value: true },
    });
    const existingKeys = new Set(existing.map((c) => `${c.type}:${c.value}`));

    const toCreate = extracted.filter((c) => !existingKeys.has(`${c.type}:${c.value}`));
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
