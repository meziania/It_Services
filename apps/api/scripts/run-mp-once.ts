import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MarchesPublicsService } from '../src/scrapers/marches-publics/marches-publics.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const svc = app.get(MarchesPublicsService);
    const summary = await svc.run(['informatique', 'cybersécurité']);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
