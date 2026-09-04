const { PrismaClient, Platform } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();

  const defaults = [
    {
      platform: Platform.MOSTAQL,
      name: 'Mostaql',
      type: 'FREELANCE_MARKETPLACE',
      baseUrl: 'https://mostaql.com',
      frequencyMinutes: 360,
      maxPages: 3,
    },
    {
      platform: Platform.KHAMSAT,
      name: 'Khamsat',
      type: 'FREELANCE_MARKETPLACE',
      baseUrl: 'https://khamsat.com',
      frequencyMinutes: 360,
      maxPages: 1,
    },
    {
      platform: Platform.REKRUTE,
      name: 'ReKrute',
      type: 'JOB_BOARD',
      baseUrl: 'https://www.rekrute.com',
      frequencyMinutes: 720,
      maxPages: 3,
      config: { keywords: ['développeur', 'devops', 'data', 'cyber'] },
    },
    {
      platform: Platform.MARCHES_PUBLICS,
      name: 'Marchés Publics',
      type: 'JOB_BOARD',
      baseUrl: 'https://www.marchespublics.gov.ma',
      frequencyMinutes: 1440,
      maxPages: 2,
    },
  ];

  for (const source of defaults) {
    await prisma.platformSource.upsert({
      where: {
        platform_name: { platform: source.platform, name: source.name },
      },
      update: { active: true },
      create: { ...source, active: true },
    });
  }

  const sources = await prisma.platformSource.findMany({
    select: { id: true, platform: true, name: true, active: true },
    orderBy: { name: 'asc' },
  });
  const offers = await prisma.jobOffer.count();
  console.log(JSON.stringify({ offers, sources }, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
