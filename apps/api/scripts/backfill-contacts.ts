/**
 * One-off / re-runnable maintenance script — Docs2/16 "Trouve les contacts
 * publics". Re-applies extractContacts() to every existing JobOffer, useful
 * right after adding the feature (or improving the regexes later) so older
 * scraped offers aren't stuck without contacts forever.
 *
 * Usage: npx ts-node -P apps/api/tsconfig.json apps/api/scripts/backfill-contacts.ts
 */
import { PrismaClient } from '@serviceit-scanner/database';
import { extractContacts } from '../src/offers/contact-extraction';

async function main() {
  const prisma = new PrismaClient();
  const offers = await prisma.jobOffer.findMany({
    select: { id: true, title: true, descriptionRaw: true },
  });

  let created = 0;
  for (const offer of offers) {
    const extracted = extractContacts(`${offer.title} ${offer.descriptionRaw}`);
    if (extracted.length === 0) continue;

    const existing = await prisma.offerContact.findMany({
      where: { offerId: offer.id },
      select: { type: true, value: true },
    });
    const existingKeys = new Set(existing.map((c) => `${c.type}:${c.value}`));
    const toCreate = extracted.filter((c) => !existingKeys.has(`${c.type}:${c.value}`));
    if (toCreate.length === 0) continue;

    await prisma.offerContact.createMany({
      data: toCreate.map((c) => ({
        offerId: offer.id,
        type: c.type,
        value: c.value,
        confidence: c.confidence,
      })),
    });
    created += toCreate.length;
  }

  // eslint-disable-next-line no-console
  console.log(`Backfilled ${created} contact(s) across ${offers.length} offer(s).`);
  await prisma.$disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
