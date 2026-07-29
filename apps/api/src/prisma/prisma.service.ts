import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@serviceit-scanner/database';

/**
 * Thin wrapper around the shared PrismaClient (packages/database).
 *
 * Docs2/11-MODELE-DONNEES.md — golden rule: services talk to the DB
 * only through this layer; repositories/services never bypass it.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected to PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
