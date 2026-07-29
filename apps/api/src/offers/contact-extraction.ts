import { ContactType } from '@serviceit-scanner/database';

/**
 * Docs2/16 "Trouve les contacts publics" — regex-only, no external lookups.
 * Runs on the raw title+description text of a scraped offer and returns the
 * public emails/phones mentioned directly in the post (ContactSource.IN_POST
 * — see schema). Deliberately conservative: false negatives are fine (the
 * user can fall back to the platform's own message system), false positives
 * are not (don't want to email/WhatsApp the wrong number).
 */
export interface ExtractedContact {
  type: ContactType;
  value: string;
  confidence: number; // 0-100
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Moroccan mobile/landline: optional +212/00212/0 prefix, then 9 digits,
// optionally separated by spaces/dots/dashes. Mobile prefixes 6/7, landline 5.
const PHONE_REGEX = /(?:\+212|00212|0)[\s.-]?[5-7](?:[\s.-]?\d{2}){4}/g;

const GENERIC_EMAIL_DOMAINS = new Set([
  'example.com',
  'domain.com',
  'yourcompany.com',
  'company.com',
  'test.com',
]);

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[\s.-]/g, '');
  if (digits.startsWith('+212')) return digits;
  if (digits.startsWith('00212')) return `+212${digits.slice(5)}`;
  if (digits.startsWith('0')) return `+212${digits.slice(1)}`;
  return digits;
}

function isNearKeyword(text: string, index: number, keywords: string[], windowChars = 25): boolean {
  const start = Math.max(0, index - windowChars);
  const context = text.slice(start, index).toLowerCase();
  return keywords.some((kw) => context.includes(kw));
}

export function extractContacts(text: string): ExtractedContact[] {
  const results: ExtractedContact[] = [];
  const seen = new Set<string>();

  for (const match of text.matchAll(EMAIL_REGEX)) {
    const value = match[0].toLowerCase();
    const domain = value.split('@')[1];
    if (GENERIC_EMAIL_DOMAINS.has(domain)) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    results.push({ type: ContactType.EMAIL, value, confidence: 90 });
  }

  for (const match of text.matchAll(PHONE_REGEX)) {
    const normalized = normalizePhone(match[0]);
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    const isWhatsApp = isNearKeyword(text, match.index ?? 0, ['whatsapp', 'whats app', 'wtsp', 'wa:']);
    results.push({
      type: isWhatsApp ? ContactType.WHATSAPP : ContactType.PHONE,
      value: normalized,
      confidence: isWhatsApp ? 80 : 70,
    });
  }

  return results;
}
