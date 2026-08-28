import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import {
  DocumentStatus,
  ItCategory,
  OfferStatus,
  OfferType,
  Platform,
  SourceType,
} from '@serviceit-scanner/database';
import { PrismaService } from '../../prisma/prisma.service';
import { classifyItCategory } from '../../offers/classification';
import { computeMatchScore } from '../../offers/scoring';
import { extractContacts } from '../../offers/contact-extraction';
import { SettingsService } from '../../settings/settings.service';
import type { ScoringWeights } from '../../offers/scoring';

const BASE_URL = 'https://www.marchespublics.gov.ma';

// Docs2/14 "Mots-clés AO IT" — IT broadly (dev, data, cyber…).
const DEFAULT_KEYWORDS = [
  'informatique',
  'logiciel',
  'développement',
  'cybersécurité',
  'digitalisation',
  'big data',
];

/**
 * Docs2/15 "Légal": marchespublics.gov.ma is a public-transparency
 * government portal — tenders are published precisely to be consulted
 * widely, no personal data involved. Its WAF blocks unrecognized custom
 * User-Agent strings (tested: our honest ReKrute-style UA gets a 403), so
 * unlike ReKrute we send a standard browser UA here to pass that basic
 * filter. This is a deliberate, documented exception — see chat history.
 */
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

interface ParsedConsultation {
  refConsultation: string;
  orgAcronyme: string;
  reference: string;
  objet: string;
  buyer?: string;
  location?: string;
  category?: string;
  procedureType?: string;
  publishedAt?: Date;
  deadline?: Date;
  url: string;
  rawHtml: string;
}

/**
 * Fields scraped from the public detail page (Docs2/05 "Marchés publics").
 * Full DCE ZIP/PDF requires a Prado form (anonymous + CGU) — deferred;
 * the detail page already exposes budget, domaines, buyer email, DCE link.
 */
interface DetailEnrichment {
  objet?: string;
  buyer?: string;
  location?: string;
  category?: string;
  procedureType?: string;
  budgetText?: string;
  domaines?: string;
  contactEmail?: string;
  dceUrl?: string;
  detailHtml: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeUrlForHash(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}?${u.searchParams.toString()}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(normalizeUrlForHash(url)).digest('hex');
}

/** Parses "dd/mm/yyyy" optionally followed by "HH:MM" on the next line/br. */
function parseFrenchDateTime(text: string | undefined): Date | undefined {
  if (!text) return undefined;
  const match = text.trim().match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!match) return undefined;
  const [, day, month, year, hour = '0', minute = '0'] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

@Injectable()
export class MarchesPublicsService {
  private readonly logger = new Logger(MarchesPublicsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  private async ensureSource() {
    return this.prisma.platformSource.upsert({
      where: { platform_name: { platform: Platform.MARCHES_PUBLICS, name: 'Marchés Publics' } },
      update: {},
      create: {
        platform: Platform.MARCHES_PUBLICS,
        name: 'Marchés Publics',
        type: SourceType.OTHER,
        baseUrl: BASE_URL,
        frequencyMinutes: 24 * 60, // daily, per Docs2/04 "Marchés publics: quotidien"
        maxPages: 1,
        config: { keywords: DEFAULT_KEYWORDS },
      },
    });
  }

  private buildSearchUrl(keyword: string): string {
    return `${BASE_URL}/index.php?page=entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord=${encodeURIComponent(keyword)}`;
  }

  private buildDetailUrl(refConsultation: string, orgAcronyme: string): string {
    return `${BASE_URL}/index.php?page=entreprise.EntrepriseDetailConsultation&refConsultation=${refConsultation}&orgAcronyme=${orgAcronyme}`;
  }

  private buildDceRequestUrl(refConsultation: string, orgAcronyme: string): string {
    return `${BASE_URL}/index.php?page=entreprise.EntrepriseDemandeTelechargementDce&refConsultation=${refConsultation}&orgAcronyme=${orgAcronyme}`;
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

  private parseDetailPage(html: string, refConsultation: string, orgAcronyme: string): DetailEnrichment {
    const $ = cheerio.load(html);
    const text = (sel: string) => $(sel).first().text().replace(/\s+/g, ' ').trim() || undefined;

    // Domaines are often several sibling labels inside the span — join with " · "
    // so categories don't glue together ("…autresFournitures…").
    const domainesEl = $(
      '#ctl0_CONTENU_PAGE_idEntrepriseConsultationSummary_domainesActivite, span[id$="_domainesActivite"]',
    ).first();
    const domaineParts = domainesEl
      .children()
      .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
      .get()
      .filter(Boolean);
    const domaines =
      domaineParts.length > 0
        ? [...new Set(domaineParts)].join(' · ')
        : domainesEl.text().replace(/\s+/g, ' ').trim();

    const dceHref = $('a[id$="_linkDownloadDce"]').first().attr('href');
    const dceUrl = dceHref
      ? new URL(dceHref, BASE_URL).toString()
      : this.buildDceRequestUrl(refConsultation, orgAcronyme);

    return {
      objet: text('#ctl0_CONTENU_PAGE_idEntrepriseConsultationSummary_objet'),
      buyer: text('#ctl0_CONTENU_PAGE_idEntrepriseConsultationSummary_entiteAchat'),
      location: text('#ctl0_CONTENU_PAGE_idEntrepriseConsultationSummary_lieuxExecutions'),
      category: text('#ctl0_CONTENU_PAGE_idEntrepriseConsultationSummary_categoriePrincipale'),
      procedureType: text('#ctl0_CONTENU_PAGE_idEntrepriseConsultationSummary_typeProcedure'),
      budgetText: text(
        '#ctl0_CONTENU_PAGE_idEntrepriseConsultationSummary_idReferentielZoneText_RepeaterReferentielZoneText_ctl0_labelReferentielZoneText',
      ),
      domaines: domaines || undefined,
      contactEmail: text('#ctl0_CONTENU_PAGE_idEntrepriseConsultationSummary_email, span[id$="_email"]'),
      dceUrl,
      detailHtml: html,
    };
  }

  private async fetchDetail(
    refConsultation: string,
    orgAcronyme: string,
  ): Promise<DetailEnrichment | null> {
    try {
      const html = await this.fetchHtml(this.buildDetailUrl(refConsultation, orgAcronyme));
      return this.parseDetailPage(html, refConsultation, orgAcronyme);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Detail fetch failed for ${orgAcronyme}/${refConsultation}: ${message}`);
      return null;
    }
  }

  private parseListing(html: string): ParsedConsultation[] {
    const $ = cheerio.load(html);
    const consultations: ParsedConsultation[] = [];

    $('table.table-results tr').each((_, el) => {
      const $row = $(el);
      const refInput = $row.find('input[id$="_refCons"]').first();
      const orgInput = $row.find('input[id$="_orgCons"]').first();
      const refConsultation = refInput.attr('value')?.trim();
      const orgAcronyme = orgInput.attr('value')?.trim();
      if (!refConsultation || !orgAcronyme) return; // header row or malformed, skip

      const reference = $row.find('span[id$="_reference"]').first().text().replace(/\s+/g, ' ').trim();

      // panelBlocObjet/panelBlocLieuxExec each embed a hidden hover-tooltip
      // (.info-bulle / .bloc-info-bulle) that repeats the same text — strip
      // it before reading .text() or the value ends up duplicated ("X ... X").
      const objetEl = $row.find('div[id$="_panelBlocObjet"]').first().clone();
      objetEl.find('.info-bulle, .info-suite').remove();
      const objet = objetEl.text().replace(/Objet\s*:/i, '').replace(/\s+/g, ' ').trim();

      const buyer = $row
        .find('div[id$="_panelBlocDenomination"]')
        .first()
        .text()
        .replace(/Acheteur public\s*:/i, '')
        .replace(/\s+/g, ' ')
        .trim();

      const locationEl = $row.find('div[id$="_panelBlocLieuxExec"]').first().clone();
      locationEl.find('.info-bulle, .bloc-info-bulle, .info-suite').remove();
      const location = locationEl.text().replace(/\s+/g, ' ').trim();
      const category = $row.find('div[id$="_panelBlocCategorie"]').first().text().replace(/\s+/g, ' ').trim();
      const procedureType = $row
        .find('div[id*="_type_procedure"]')
        .first()
        .text()
        .replace(/\s+/g, ' ')
        .trim();

      // "Publié le" is the last plain <div> child of the "cons_ref" cell —
      // it has no id/class, unlike its siblings (line-info-bulle,
      // panelBlocTypesProc, panelBlocCategorie), so `> div` + last() finds it.
      const publishedAtText = $row.find('td[headers="cons_ref"]').first().children('div').last().text();
      const publishedAt = parseFrenchDateTime(publishedAtText);

      const deadline = parseFrenchDateTime($row.find('.cloture-line').first().text());

      consultations.push({
        refConsultation,
        orgAcronyme,
        reference: reference || refConsultation,
        objet: objet || reference || 'Consultation sans objet renseigné',
        buyer: buyer || undefined,
        location: location || undefined,
        category: category || undefined,
        procedureType: procedureType || undefined,
        publishedAt,
        deadline,
        url: this.buildDetailUrl(refConsultation, orgAcronyme),
        rawHtml: $.html($row),
      });
    });

    return consultations;
  }

  async run(keywords: string[] = DEFAULT_KEYWORDS): Promise<{
    keywords: string[];
    fetched: number;
    newRawDocuments: number;
    offersCreated: number;
    offersUpdated: number;
    skippedDuplicates: number;
    skippedExpired: number;
    skippedNotIt: number;
    errors: string[];
  }> {
    const source = await this.ensureSource();
    const settings = await this.settingsService.get();
    const skills = settings.skills;
    const weights = settings.weights as unknown as ScoringWeights;

    const summary = {
      keywords,
      fetched: 0,
      newRawDocuments: 0,
      offersCreated: 0,
      offersUpdated: 0,
      skippedDuplicates: 0,
      skippedExpired: 0,
      skippedNotIt: 0,
      errors: [] as string[],
    };

    for (const keyword of keywords) {
      try {
        const url = this.buildSearchUrl(keyword);
        this.logger.log(`Fetching Marchés Publics results for "${keyword}"`);
        const html = await this.fetchHtml(url);
        summary.fetched += 1;

        const consultations = this.parseListing(html);
        for (const consultation of consultations) {
          await this.persistConsultation(source.id, consultation, summary, skills, weights);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Marchés Publics fetch failed for "${keyword}": ${message}`);
        summary.errors.push(`${keyword}: ${message}`);
      }

      // Politeness delay between requests (Docs2/05 retry/rate-limit spirit).
      await sleep(2000);
    }

    // Backfill detail enrichment for AO already in DB (listing-only rows).
    await this.enrichExistingOffers(skills, weights);

    await this.prisma.platformSource.update({
      where: { id: source.id },
      data: {
        lastRunAt: new Date(),
        lastRunStatus: summary.errors.length > 0 ? 'PARTIAL_FAILURE' : 'OK',
      },
    });

    return summary;
  }

  /**
   * Docs2/05 — enrich open AO that still lack descriptionClean (detail page).
   * Caps at 10 per run to stay polite with the government portal.
   */
  private parseExternalIds(offer: { externalId: string; url: string }): {
    orgAcronyme: string;
    refConsultation: string;
  } | null {
    try {
      const u = new URL(offer.url);
      const refConsultation = u.searchParams.get('refConsultation');
      const orgAcronyme = u.searchParams.get('orgAcronyme');
      if (refConsultation && orgAcronyme) return { orgAcronyme, refConsultation };
    } catch {
      // fall through to externalId parse
    }
    const match = offer.externalId.match(/^([^-]+)-(.+)$/);
    if (!match) return null;
    return { orgAcronyme: match[1], refConsultation: match[2] };
  }

  private async enrichExistingOffers(skills: string[], weights: ScoringWeights) {
    const pending = await this.prisma.jobOffer.findMany({
      where: {
        platform: Platform.MARCHES_PUBLICS,
        descriptionClean: null,
        status: { not: OfferStatus.SKIP },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    if (pending.length === 0) return;
    this.logger.log(`Enriching detail pages for ${pending.length} existing AO…`);

    for (const offer of pending) {
      const ids = this.parseExternalIds(offer);
      if (!ids) continue;
      const detail = await this.fetchDetail(ids.refConsultation, ids.orgAcronyme);
      if (!detail) continue;
      await this.applyDetailToOffer(offer.id, offer.title, detail, skills, weights);
      await sleep(1500);
    }
  }

  private async applyDetailToOffer(
    offerId: string,
    title: string,
    detail: DetailEnrichment,
    skills: string[],
    weights: ScoringWeights,
  ) {
    const searchText = [
      detail.objet,
      detail.category,
      detail.domaines,
      detail.procedureType,
      title,
    ]
      .filter(Boolean)
      .join(' ');

    const itCategory = classifyItCategory(searchText);
    const { score, reasons } = computeMatchScore({
      text: searchText,
      itCategory,
      offerType: OfferType.BUYER_REQUEST,
      remote: undefined,
      budgetText: detail.budgetText,
      publishedAt: undefined,
      location: detail.location,
      skills,
      weights,
    });

    const descriptionClean = [
      detail.objet,
      detail.procedureType ? `Type de procédure : ${detail.procedureType}` : null,
      detail.category ? `Catégorie : ${detail.category}` : null,
      detail.domaines ? `Domaines d'activité : ${detail.domaines}` : null,
      detail.budgetText ? `Estimation : ${detail.budgetText} Dhs TTC` : null,
      detail.dceUrl ? `Dossier de consultation (DCE) : ${detail.dceUrl}` : null,
      'Note : le téléchargement du ZIP/PDF DCE nécessite le formulaire anonyme du portail.',
    ]
      .filter(Boolean)
      .join('\n');

    await this.prisma.jobOffer.update({
      where: { id: offerId },
      data: {
        descriptionClean,
        descriptionRaw: detail.objet ?? undefined,
        companyName: detail.buyer,
        location: detail.location,
        budgetText: detail.budgetText,
        itCategory,
        matchScore: score,
        matchReasons: reasons,
      },
    });

    const contactHaystack = [detail.contactEmail, detail.objet, detail.buyer].filter(Boolean).join(' ');
    await this.persistContacts(offerId, contactHaystack);
  }

  private async persistConsultation(
    sourceId: string,
    consultation: ParsedConsultation,
    summary: {
      newRawDocuments: number;
      offersCreated: number;
      offersUpdated: number;
      skippedDuplicates: number;
      skippedExpired: number;
      skippedNotIt: number;
    },
    skills: string[],
    weights: ScoringWeights,
  ) {
    // Consultations past their submission deadline aren't actionable leads.
    if (consultation.deadline && consultation.deadline.getTime() < Date.now()) {
      summary.skippedExpired += 1;
      return;
    }

    const urlHash = hashUrl(consultation.url);
    const existingRawDocument = await this.prisma.rawDocument.findUnique({ where: { urlHash } });
    if (existingRawDocument) {
      summary.skippedDuplicates += 1;
      return;
    }

    // Detail page has budget / domaines / buyer email (Docs2/05 extract).
    const detail = await this.fetchDetail(consultation.refConsultation, consultation.orgAcronyme);
    await sleep(1500);

    const objet = detail?.objet ?? consultation.objet;
    const category = detail?.category ?? consultation.category;
    const domaines = detail?.domaines;
    const searchText = `${objet} ${category ?? ''} ${domaines ?? ''}`;
    const itCategory = classifyItCategory(searchText);

    const rawDocument = await this.prisma.rawDocument.create({
      data: {
        sourceId,
        url: consultation.url,
        urlHash,
        contentType: 'text/html',
        rawContent: detail?.detailHtml ?? consultation.rawHtml,
        status: itCategory === ItCategory.NOT_IT ? DocumentStatus.SKIPPED : DocumentStatus.PROCESSED,
        processedAt: new Date(),
      },
    });
    summary.newRawDocuments += 1;

    if (itCategory === ItCategory.NOT_IT) {
      summary.skippedNotIt += 1;
      return;
    }

    const budgetText = detail?.budgetText;
    const { score, reasons } = computeMatchScore({
      text: searchText,
      itCategory,
      // An AO is a procurement request for a contractor, not a job offer —
      // closest existing OfferType is BUYER_REQUEST (Docs2/16 categories).
      offerType: OfferType.BUYER_REQUEST,
      remote: undefined,
      budgetText,
      publishedAt: consultation.publishedAt,
      location: detail?.location ?? consultation.location,
      skills,
      weights,
    });

    const externalId = `${consultation.orgAcronyme}-${consultation.refConsultation}`;
    const descriptionClean = [
      objet,
      (detail?.procedureType ?? consultation.procedureType)
        ? `Type de procédure : ${detail?.procedureType ?? consultation.procedureType}`
        : null,
      category ? `Catégorie : ${category}` : null,
      domaines ? `Domaines d'activité : ${domaines}` : null,
      budgetText ? `Estimation : ${budgetText} Dhs TTC` : null,
      detail?.dceUrl ? `Dossier de consultation (DCE) : ${detail.dceUrl}` : null,
      'Note : le téléchargement du ZIP/PDF DCE nécessite le formulaire anonyme du portail.',
    ]
      .filter(Boolean)
      .join('\n');

    const result = await this.prisma.jobOffer.upsert({
      where: {
        platform_externalId: { platform: Platform.MARCHES_PUBLICS, externalId },
      },
      update: {
        matchScore: score,
        matchReasons: reasons,
        itCategory,
        descriptionClean,
        budgetText,
        companyName: detail?.buyer ?? consultation.buyer,
        location: detail?.location ?? consultation.location,
      },
      create: {
        platform: Platform.MARCHES_PUBLICS,
        sourceId,
        rawDocumentId: rawDocument.id,
        externalId,
        url: consultation.url,
        title: `${consultation.reference} — ${objet}`.slice(0, 250),
        descriptionRaw: objet,
        descriptionClean,
        companyName: detail?.buyer ?? consultation.buyer,
        location: detail?.location ?? consultation.location,
        publishedAt: consultation.publishedAt,
        deadline: consultation.deadline,
        budgetText,
        offerType: OfferType.BUYER_REQUEST,
        itCategory,
        matchScore: score,
        matchReasons: reasons,
      },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      summary.offersCreated += 1;
    } else {
      summary.offersUpdated += 1;
    }

    const contactHaystack = [
      detail?.contactEmail,
      objet,
      detail?.buyer ?? consultation.buyer,
    ]
      .filter(Boolean)
      .join(' ');
    await this.persistContacts(result.id, contactHaystack);
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
      data: toCreate.map((c) => ({ offerId, type: c.type, value: c.value, confidence: c.confidence })),
    });
  }
}
