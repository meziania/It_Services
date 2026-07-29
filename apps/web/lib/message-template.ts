import type { Offer } from "./types";

/**
 * Client-side draft generator (Docs2/16 "Génération proposition" template).
 * No AI / backend persistence yet — this is a starting point the user edits
 * before sending; nothing is auto-sent (Docs2/16 "1 clic = 1 envoi validé").
 */
export function buildDraftMessage(offer: Offer): { subject: string; body: string } {
  const company = offer.companyName ? ` chez ${offer.companyName}` : "";
  const subject = `${offer.title} — proposition de collaboration`;

  const body = `Bonjour,

J'ai vu votre annonce "${offer.title}"${company} sur ${offer.platform}.
Je peux vous proposer :
- Une prise en charge complète de votre besoin (analyse, développement, livraison)
- Un point technique rapide pour cadrer le périmètre et le délai
- Disponibilité pour un court échange cette semaine

Délai indicatif : à confirmer selon le cahier des charges.

Cordialement,
[Votre nom] — [votre portfolio]`;

  return { subject, body };
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digitsOnly = phone.replace(/[^\d+]/g, "").replace(/^00/, "+");
  return `https://wa.me/${digitsOnly.replace("+", "")}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoUrl(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
