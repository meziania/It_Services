import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SourcesService } from '../sources/sources.service';

/**
 * Docs2/05 "Critères d'acceptation framework": "Enable/disable, run manuel,
 * schedule". Each PlatformSource already carries `active` + `frequencyMinutes`
 * (Docs2/05 "Configuration d'une source"); this service is the missing piece
 * that actually triggers a run once a source is "due", so the user no longer
 * has to click "Lancer" by hand every day.
 *
 * Deliberately simple for a solo personal tool (Docs2/12 solo-dev shortcut):
 * a single in-process cron tick, sequential per-source runs, no RabbitMQ
 * queue (that's Sprint 6's internal pipeline, a different concern). If this
 * ever needs to scale to many sources/instances, that's when to introduce
 * the queue-based scheduler instead.
 */
@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);
  private isTicking = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sourcesService: SourcesService,
  ) {}

  onModuleInit() {
    this.logger.log('Scheduler ready — checking active sources every 5 minutes for due runs.');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleTick() {
    // Overlap guard: if a previous tick's runs are still in flight (e.g. a
    // slow scraper) skip this one rather than running the same source twice.
    if (this.isTicking) {
      this.logger.warn('Previous scheduler tick still running — skipping this one.');
      return;
    }

    this.isTicking = true;
    try {
      const dueSources = await this.findDueSources();
      if (dueSources.length === 0) return;

      this.logger.log(`${dueSources.length} source(s) due for a scheduled run.`);
      for (const source of dueSources) {
        await this.runOne(source.id, source.name);
      }
    } finally {
      this.isTicking = false;
    }
  }

  private async findDueSources() {
    const now = Date.now();
    const sources = await this.prisma.platformSource.findMany({ where: { active: true } });

    return sources.filter((source) => {
      if (!source.lastRunAt) return true;
      const dueAt = source.lastRunAt.getTime() + source.frequencyMinutes * 60_000;
      return now >= dueAt;
    });
  }

  private async runOne(id: string, name: string) {
    try {
      this.logger.log(`Scheduled run starting: ${name}`);
      const summary = await this.sourcesService.run(id);
      this.logger.log(`Scheduled run finished: ${name} — ${JSON.stringify(summary)}`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        // No adapter implemented yet for this platform (Docs2/16 roadmap) —
        // expected for placeholder sources, not worth an error-level log.
        this.logger.warn(`Skipped scheduled run for "${name}": ${error.message}`);
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Scheduled run failed for "${name}": ${message}`);
    }
  }
}
