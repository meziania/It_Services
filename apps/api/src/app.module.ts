import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { OffersModule } from './offers/offers.module';
import { RekruteModule } from './scrapers/rekrute/rekrute.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    OffersModule,
    RekruteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
