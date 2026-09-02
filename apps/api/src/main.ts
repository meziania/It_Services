import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Comma-separated so a single deployment can serve the Vercel production
  // domain plus preview/localhost origins.
  const origins = (process.env.API_CORS_ORIGIN ?? 'http://localhost:3020')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  app.enableCors({ origin: origins.includes('*') ? true : origins });

  // Hosting platforms (Railway, Render, Fly, ...) inject PORT and require
  // binding to 0.0.0.0 for the healthcheck to reach the container.
  const port = process.env.PORT ?? process.env.API_PORT ?? 3011;
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`ServiceIt-scanner API listening on port ${port}`);
}
bootstrap();
