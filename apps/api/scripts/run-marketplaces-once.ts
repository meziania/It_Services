import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MostaqlService } from '../src/scrapers/mostaql/mostaql.service';
import { KhamsatService } from '../src/scrapers/khamsat/khamsat.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const mostaql = app.get(MostaqlService);
    const khamsat = app.get(KhamsatService);

    // Development listing only for a quicker smoke test.
    const mostaqlSummary = await mostaql.run(['/projects?category=development']);
    // eslint-disable-next-line no-console
    console.log('MOSTAQL', JSON.stringify(mostaqlSummary, null, 2));

    const khamsatSummary = await khamsat.run();
    // eslint-disable-next-line no-console
    console.log('KHAMSAT', JSON.stringify(khamsatSummary, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
