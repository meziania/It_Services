import { ItCategory, OfferType } from '@serviceit-scanner/database';

/**
 * Match score vs. your own profile — Docs2/16-PROJET-PERSONNEL-SCANNER-FREELANCE.md
 * "Scoring (match avec toi)" table.
 *
 * TODO: adjust MY_SKILLS to your real stack, or move to PlatformSource.config
 * / a dedicated settings table once the admin UI exists (Docs2/10).
 */
const MY_SKILLS = [
  'react',
  'next.js',
  'node',
  'nestjs',
  'typescript',
  'javascript',
  'laravel',
  'php',
  'wordpress',
  'react native',
];

export interface ScoringInput {
  text: string; // title + description, lowercased search haystack
  itCategory: ItCategory;
  offerType: OfferType;
  remote: boolean | null | undefined;
  budgetText: string | null | undefined;
  publishedAt: Date | null | undefined;
}

export interface ScoringResult {
  score: number;
  reasons: string[];
}

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export function computeMatchScore(input: ScoringInput): ScoringResult {
  if (input.itCategory === ItCategory.NOT_IT) {
    return { score: 0, reasons: ['Hors IT — exclu'] };
  }

  let score = 0;
  const reasons: string[] = [];
  const haystack = input.text.toLowerCase();

  const isFreelanceLeaning =
    input.remote === true ||
    input.offerType === OfferType.FREELANCE ||
    input.offerType === OfferType.BUYER_REQUEST;
  if (isFreelanceLeaning) {
    score += 15;
    reasons.push('Freelance / remote (+15)');
  }

  const matchedSkills = MY_SKILLS.filter((skill) => haystack.includes(skill));
  if (matchedSkills.length > 0) {
    score += 20;
    reasons.push(`Stack maîtrisée: ${matchedSkills.join(', ')} (+20)`);
  }

  if (input.budgetText && input.budgetText.trim().length > 0) {
    score += 10;
    reasons.push('Budget mentionné (+10)');
  }

  if (input.publishedAt) {
    const ageMs = Date.now() - input.publishedAt.getTime();
    if (ageMs >= 0 && ageMs <= FORTY_EIGHT_HOURS_MS) {
      score += 15;
      reasons.push('Publiée il y a < 48h (+15)');
    }
  }

  if (input.offerType === OfferType.FULL_TIME || input.offerType === OfferType.CONTRACT) {
    score -= 30;
    reasons.push('Poste CDI/CDD, pas une mission freelance (-30)');
  }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}
