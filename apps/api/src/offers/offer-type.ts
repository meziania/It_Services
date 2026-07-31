import { OfferType } from '@serviceit-scanner/database';

/**
 * Docs2/16 personal scanner: priority = freelance / mission / buyer request.
 * CDI/CDD job-board posts are noise for a freelance IT lead tool.
 */

const FREELANCE_HINT =
  /\b(freelance|free[\s-]?lance|ind[ée]pendant|auto[\s-]?entrepreneur|prestataire|prestation|mission\s+(freelance|ponctuelle|externe)|consultant\s+ind[ée]pendant|contrat\s+de\s+prestation|portage\s+salarial|buyer\s*request)\b/i;

/**
 * Refine a parsed contract type using title+description — ReKrute often
 * labels "CDI" even when the body mentions freelance/mission.
 */
export function refineOfferType(parsed: OfferType, text: string): OfferType {
  if (FREELANCE_HINT.test(text)) return OfferType.FREELANCE;
  if (parsed === OfferType.BUYER_REQUEST) return OfferType.BUYER_REQUEST;
  return parsed;
}

/** Keep only freelance-leaning opportunities in the dashboard. */
export function isFreelanceOpportunity(offerType: OfferType): boolean {
  return offerType === OfferType.FREELANCE || offerType === OfferType.BUYER_REQUEST;
}
