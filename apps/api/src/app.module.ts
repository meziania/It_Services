import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { OffersModule } from './offers/offers.module';
import { RekruteModule } from './scrapers/rekrute/rekrute.module';
import { MarchesPublicsModule } from './scrapers/marches-publics/marches-publics.module';
import { MostaqlModule } from './scrapers/mostaql/mostaql.module';
import { KhamsatModule } from './scrapers/khamsat/khamsat.module';
import { SourcesModule } from './sources/sources.module';
import { AuthModule } from './auth/auth.module';
import { SettingsModule } from './settings/settings.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Monorepo: Nest runs from apps/api, shared secrets live at repo root.
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
    OffersModule,
    RekruteModule,
    MarchesPublicsModule,
    MostaqlModule,
    KhamsatModule,
    SourcesModule,
    SettingsModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
