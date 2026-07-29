import { ItCategory } from '@serviceit-scanner/database';

/**
 * IT classification from free text (title + description).
 *
 * Keyword dictionaries from Docs2/14-ADAPTATION-SIGNAUX-ET-SERVICES-IT.md
 * ("Mots-clés job boards"). Order matters: more specific categories are
 * checked before the generic WEB bucket.
 */
const RULES: Array<{ category: ItCategory; pattern: RegExp }> = [
  {
    category: ItCategory.MOBILE,
    pattern: /\b(mobile|ios|android|flutter|react[\s-]?native|swift|kotlin)\b/i,
  },
  {
    category: ItCategory.DEVOPS,
    pattern: /\b(devops|kubernetes|docker|ci\/cd|sre|site reliability|terraform)\b/i,
  },
  {
    category: ItCategory.WORDPRESS,
    pattern: /\b(wordpress|woocommerce|elementor)\b/i,
  },
  {
    category: ItCategory.ECOMMERCE,
    pattern: /\b(e-?commerce|shopify|prestashop|magento)\b/i,
  },
  {
    category: ItCategory.DATA,
    pattern: /\b(data engineer|data scientist|big data|business intelligence|\bbi\b|power ?bi|etl)\b/i,
  },
  {
    category: ItCategory.API_INTEGRATION,
    pattern: /\b(api rest|api rest\/graphql|graphql|integration api|webservice)\b/i,
  },
  {
    category: ItCategory.FULLSTACK,
    pattern: /\bfull[\s-]?stack\b/i,
  },
  {
    category: ItCategory.WEB,
    pattern:
      /\b(d[ée]veloppeur|developer|front-?end|back-?end|react\b|angular|vue\.?js|node\.?js|laravel|symfony|django|php|java(?!script)|\.net|spring boot|digital|num[ée]rique)\b/i,
  },
];

/** Generic "is this even IT" gate before running category rules. */
const IT_HINT = /\b(d[ée]veloppeur|developer|informatique|digital|it\b|logiciel|application|site web|num[ée]rique|tech)\b/i;

export function classifyItCategory(text: string): ItCategory {
  if (!IT_HINT.test(text)) return ItCategory.NOT_IT;

  for (const rule of RULES) {
    if (rule.pattern.test(text)) return rule.category;
  }
  return ItCategory.OTHER;
}
