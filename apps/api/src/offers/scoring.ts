import { ItCategory, OfferType } from '@serviceit-scanner/database';

/**
 * Match score vs. your own profile — Docs2/16-PROJET-PERSONNEL-SCANNER-FREELANCE.md
 * "Scoring (match avec toi)" table.
 *
 * Skills + weights are configurable via the /settings admin screen
 * (Docs2/10, Sprint 3) and passed in by the caller; these constants are only
 * the fallback used when no TeamSettings row exists yet.
 */
const DEFAULT_SKILLS = [
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

export interface ScoringWeights {
  stack: number;
  freelance: number;
  freshness: number;
  location: number;
  budget: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  stack: 40,
  freelance: 25,
  freshness: 15,
  location: 10,
  budget: 10,
};

export interface ScoringInput {
  text: string; // title + description, lowercased search haystack
  itCategory: ItCategory;
  offerType: OfferType;
  remote: boolean | null | undefined;
  budgetText: string | null | undefined;
  publishedAt: Date | null | undefined;
  location?: string | null;
  /** Docs2/16 "Localisation" — cities/regions you target; empty = don't score location. */
  targetLocations?: string[];
  skills?: string[];
  weights?: Partial<ScoringWeights>;
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

  const skills = input.skills && input.skills.length > 0 ? input.skills : DEFAULT_SKILLS;
  const weights = { ...DEFAULT_WEIGHTS, ...input.weights };

  // Weights are on a 0-100 "importance" scale (Docs2/10 Settings sliders),
  // not literal point values; scale each criterion's max contribution by
  // weight/100 so the total stays roughly bounded by the weight sum.
  let score = 0;
  const reasons: string[] = [];
  const haystack = input.text.toLowerCase();

  const isFreelanceLeaning =
    input.remote === true ||
    input.offerType === OfferType.FREELANCE ||
    input.offerType === OfferType.BUYER_REQUEST;
  if (isFreelanceLeaning) {
    const points = Math.round(weights.freelance * 0.6);
    score += points;
    reasons.push(`Freelance / remote (+${points})`);
  }

  const matchedSkills = skills.filter((skill) => haystack.includes(skill.toLowerCase()));
  if (matchedSkills.length > 0) {
    const points = Math.round(weights.stack * 0.5);
    score += points;
    reasons.push(`Stack maîtrisée: ${matchedSkills.join(', ')} (+${points})`);
  }

  if (input.budgetText && input.budgetText.trim().length > 0) {
    const points = Math.round(weights.budget * 1.0);
    score += points;
    reasons.push(`Budget mentionné (+${points})`);
  }

  if (input.publishedAt) {
    const ageMs = Date.now() - input.publishedAt.getTime();
    if (ageMs >= 0 && ageMs <= FORTY_EIGHT_HOURS_MS) {
      const points = Math.round(weights.freshness * 1.0);
      score += points;
      reasons.push(`Publiée il y a < 48h (+${points})`);
    }
  }

  if (input.targetLocations && input.targetLocations.length > 0 && input.location) {
    const normalizedLocation = input.location.toLowerCase();
    const isTargetLocation = input.targetLocations.some((loc) =>
      normalizedLocation.includes(loc.toLowerCase()),
    );
    if (isTargetLocation) {
      const points = Math.round(weights.location * 1.0);
      score += points;
      reasons.push(`Localisation ciblée: ${input.location} (+${points})`);
    }
  }

  if (input.offerType === OfferType.FULL_TIME || input.offerType === OfferType.CONTRACT) {
    score -= 30;
    reasons.push('Poste CDI/CDD, pas une mission freelance (-30)');
  }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}
