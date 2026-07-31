import { ItCategory } from '@serviceit-scanner/database';

/**
 * IT classification from free text (title + description).
 *
 * Keyword dictionaries from Docs2/14-ADAPTATION-SIGNAUX-ET-SERVICES-IT.md
 * ("Mots-clés job boards" + AO) expanded for cyber / data / cloud.
 * Order matters: more specific categories are checked before WEB.
 */
const RULES: Array<{ category: ItCategory; pattern: RegExp }> = [
  {
    category: ItCategory.MOBILE,
    pattern: /\b(mobile|ios|android|flutter|react[\s-]?native|swift|kotlin)\b/i,
  },
  {
    category: ItCategory.CYBER,
    pattern:
      /(cyber\s*s[ée]curit|cybers[ée]curit|s[ée]curit[ée]\s+informatique|infosec|\bsoc\b|pentest|penetration\s*test|ethical\s*hack|iso\s*27001|\bsiem\b|blue\s*team|red\s*team)/i,
  },
  {
    category: ItCategory.DEVOPS,
    pattern:
      /\b(devops|kubernetes|k8s|docker|ci\/cd|sre|site reliability|terraform|ansible|cloud|aws|azure|gcp|openshift)\b/i,
  },
  {
    category: ItCategory.DATA,
    pattern:
      /\b(data\s*engineer|data\s*scientist|data\s*analyst|big\s*data|business\s*intelligence|\bbi\b|power\s*bi|etl|hadoop|spark|machine\s*learning|\bml\b|intelligence\s*artificielle|\bia\b|data\s*warehouse)\b/i,
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
    category: ItCategory.API_INTEGRATION,
    pattern: /\b(api\s*rest|graphql|int[ée]gration\s*api|webservice|micro[\s-]?services?)\b/i,
  },
  {
    category: ItCategory.FULLSTACK,
    pattern: /\bfull[\s-]?stack\b/i,
  },
  {
    category: ItCategory.DESIGN,
    pattern: /\b(ux|ui|figma|design\s*system|product\s*designer)\b/i,
  },
  {
    category: ItCategory.WEB,
    pattern:
      /\b(d[ée]veloppeur|developer|d[ée]veloppement|front-?end|back-?end|react\b|angular|vue\.?js|node\.?js|nestjs|next\.?js|laravel|symfony|django|php|java(?!script)|\.net|spring\s*boot|typescript|javascript|logiciel|application\s*web|site\s*web|portail|intranet|erp|crm)\b/i,
  },
];

/**
 * Broad "is this even IT" gate — Docs2/14 + user focus:
 * dev, big data, cyber, digital / SI in general.
 */
const IT_HINT =
  /(d[ée]veloppeur|developer|d[ée]veloppement|informatique|digital|num[ée]rique|\bit\b|logiciel|application|site\s*web|portail|\btech\b|cyber\s*s[ée]curit|cybers[ée]curit|s[ée]curit[ée]\s+informatique|big\s*data|data\s*(engineer|scientist|analyst)|devops|cloud|r[ée]seau|syst[èe]me\s*d['’]information|\bsi\b|erp|crm|h[ée]bergement|infog[ée]rance|maintenance\s*informatique)/i;

export function classifyItCategory(text: string): ItCategory {
  if (!IT_HINT.test(text)) return ItCategory.NOT_IT;

  for (const rule of RULES) {
    if (rule.pattern.test(text)) return rule.category;
  }
  // IT-hint matched but no specific bucket → keep as OTHER (still IT).
  return ItCategory.OTHER;
}
