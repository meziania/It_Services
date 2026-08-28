import { ItCategory } from '@serviceit-scanner/database';

/**
 * IT classification for freelance missions (Docs2/16 + user focus).
 * Keep only: development, security, data, ERP/CRM (+ closely related stacks).
 * Order matters: more specific categories before WEB.
 */

/** Pure noise for a freelance IT scanner (content, VA, marketing, generic design…). */
const NON_IT_NOISE =
  /(مساعد\s*افتراضي|virtual\s*assistant|كتابة\s*محتوى|content\s*writ|ترجمة|translator|سوشيال\s*ميديا|social\s*media|تسويق(?!\s*رقمي\s*تقني)|marketing(?!\s*automation)|مونتاج\s*فيديو|video\s*edit|كانفا(?!\s*developer)|canva|تخليص\s*جمركي|لاند\s*سكيب|landscape|ديكور|ديكور\s*داخلي|interior\s*design|محاسبة\s*(?!برنامج|نظام|software)|كتالوج(?!\s*الكتروني)|appsheet|قوقل\s*شيت|google\s*sheets?|ملف\s*اكسل|\bexcel\b|وورد\s*&?\s*ا?كسل|word\s*&?\s*excel|وليس\s*مبرمج|وليس\s*مطور|مصمم\s*وليس|not\s+a?\s*developer|thinkific)/i;

const RULES: Array<{ category: ItCategory; pattern: RegExp }> = [
  {
    category: ItCategory.MOBILE,
    pattern:
      /\b(mobile|ios|android|flutter|react[\s-]?native|swift|kotlin)\b|فلاتر|أندرويد|اندرويد|تطبيق\s*(موبايل|جوال|هاتف|ios|android)|تطبيقات\s*(الموبايل|الجوال)/i,
  },
  {
    category: ItCategory.CYBER,
    pattern:
      /(cyber\s*s[ée]curit|cybers[ée]curit|s[ée]curit[ée]\s+(informatique|des\s+syst|r[ée]seau)|infosec|\bsoc\b|pentest|penetration\s*test|ethical\s*hack|iso\s*27001|\bsiem\b|blue\s*team|red\s*team|أمن\s*(معلومات|سيبراني|الشبكات)|الأمن\s*السيبراني|سيبراني|حماية\s*(معلومات|بيانات|نظام)|security\s*(audit|engineer|analyst))/i,
  },
  {
    category: ItCategory.DEVOPS,
    pattern:
      /\b(devops|kubernetes|k8s|docker|ci\/cd|sre|site reliability|terraform|ansible|aws|azure|gcp|openshift)\b|ديف\s*أوبس|استضافة\s*(سيرفر|خادم|cloud)|إدارة\s*(سيرفر|خوادم)/i,
  },
  {
    category: ItCategory.DATA,
    pattern:
      /\b(data\s*engineer|data\s*scientist|data\s*analyst|big\s*data|business\s*intelligence|\bbi\b|power\s*bi|etl|hadoop|spark|machine\s*learning|\bml\b|intelligence\s*artificielle|\bia\b|data\s*warehouse|python\s*(data|etl|ml))\b|ذكاء\s*اصطناعي|تعلم\s*آلي|تحليل\s*بيانات|بيانات\s*ضخمة|علم\s*البيانات|مستودع\s*بيانات/i,
  },
  {
    category: ItCategory.WORDPRESS,
    pattern: /\b(wordpress|woocommerce|elementor)\b|ووردبريس|وورد\s*برس/i,
  },
  {
    category: ItCategory.ECOMMERCE,
    pattern:
      /\b(e-?commerce|shopify|prestashop|magento)\b|متجر\s*إلكتروني|متجر\s*الكتروني|منصة\s*سلة|شوبيفاي/i,
  },
  {
    category: ItCategory.API_INTEGRATION,
    pattern:
      /\b(api\s*rest|graphql|int[ée]gration\s*api|webservice|micro[\s-]?services?|webhook)\b|تكامل\s*api|ربط\s*api|واجهة\s*برمجة/i,
  },
  {
    category: ItCategory.FULLSTACK,
    pattern: /\bfull[\s-]?stack\b|فل\s*ستاك|مطور\s*شامل/i,
  },
  // ERP / CRM — map to WEB bucket (no dedicated enum); strong user ask.
  {
    category: ItCategory.WEB,
    pattern:
      /\b(erp|crm|odoo|sap\b|salesforce|dynamics\s*365|hubspot)\b|نظام\s*(erp|crm)|أودو|سايلزفورس|إدارة\s*(علاقات\s*العملاء|الموارد)/i,
  },
  {
    category: ItCategory.WEB,
    pattern:
      /\b(d[ée]veloppeur|developer|d[ée]veloppement|programm(eur|ing)|front-?end|back-?end|react\b|angular|vue\.?js|node\.?js|nestjs|next\.?js|laravel|symfony|django|php|java(?!script)|\.net|spring\s*boot|typescript|javascript|logiciel|application\s*web|site\s*web|portail|intranet)\b|مطور|مبرمج|برمجة|تطوير\s*(ويب|موقع|تطبيق|نظام|برمج)|موقع\s*(ويب|إلكتروني|الكتروني)|صفحة\s*هبوط|landing\s*page|لارافيل/i,
  },
];

/**
 * Gate: must look like real IT work (dev / sécu / data / ERP / CRM).
 * Deliberately excludes bare "تصميم", Excel-only, VA, content, etc.
 */
const IT_HINT =
  /(d[ée]veloppeur|developer|d[ée]veloppement|programm(eur|ing)|informatique|logiciel|application\s*web|site\s*web|portail|intranet|\berp\b|\bcrm\b|odoo|sap\b|salesforce|cyber\s*s[ée]curit|cybers[ée]curit|s[ée]curit[ée]\s+(informatique|des\s+syst)|infosec|pentest|big\s*data|data\s*(engineer|scientist|analyst)|business\s*intelligence|machine\s*learning|intelligence\s*artificielle|devops|kubernetes|docker|aws|azure|cloud\s*(engineer|architect)|syst[èe]me\s*d['’]information|\bsi\b|h[ée]bergement|infog[ée]rance|wordpress|laravel|flutter|fullstack|full[\s-]?stack|frontend|backend|react|next\.?js|node\.?js|nestjs|angular|vue|typescript|javascript|\bphp\b|\bpython\b|django|symfony|\.net|spring|api\s*rest|graphql|مطور|مبرمج|برمجة|تطوير\s*(ويب|موقع|تطبيق|نظام|برمج)|موقع\s*(ويب|إلكتروني|الكتروني)|تطبيق\s*(موبايل|جوال|ويب|ios|android)|ووردبريس|لارافيل|فلاتر|ذكاء\s*اصطناعي|تعلم\s*آلي|تحليل\s*بيانات|أمن\s*(معلومات|سيبراني)|سيبراني|نظام\s*(erp|crm)|أودو|متجر\s*إلكتروني|متجر\s*الكتروني|صفحة\s*هبوط|landing\s*page)/i;

const CODE_OR_SYSTEM_HINT =
  /(?<!وليس\s)(?<!not\s)(مطور|مبرمج|برمجة|laravel|react|flutter|wordpress|api|تطوير\s*(ويب|تطبيق|نظام)|developer|programm|\berp\b|\bcrm\b|odoo|أمن|سيبراني|ذكاء\s*اصطناعي)/i;

/** UI/UX-only (no code / no ERP) → not a core IT mission for this scanner. */
const DESIGN_SURFACE =
  /\b(ui\s*\/?\s*ux|ux\s*\/?\s*ui|figma)\b|مصمم\s*(واجهات|ui|ux)|تصميم\s*(واجهات|واجهة|ui|ux|لوحة\s*تحكم)|فيجما/i;

export function classifyItCategory(text: string): ItCategory {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return ItCategory.NOT_IT;
  if (NON_IT_NOISE.test(normalized)) return ItCategory.NOT_IT;
  if (!IT_HINT.test(normalized)) return ItCategory.NOT_IT;
  // Design-only briefs without code/ERP/security/data → skip.
  if (DESIGN_SURFACE.test(normalized) && !CODE_OR_SYSTEM_HINT.test(normalized)) {
    return ItCategory.NOT_IT;
  }

  for (const rule of RULES) {
    if (rule.pattern.test(normalized)) return rule.category;
  }

  // Matched IT gate but no specific bucket — still IT (e.g. ERP keyword only).
  return ItCategory.OTHER;
}

/** True when the offer is in the user's target IT mission scope. */
export function isCoreItMission(text: string): boolean {
  return classifyItCategory(text) !== ItCategory.NOT_IT;
}
