import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Platform } from '@serviceit-scanner/database';
import { PrismaService } from '../prisma/prisma.service';
import { RekruteService } from '../scrapers/rekrute/rekrute.service';
import { MarchesPublicsService } from '../scrapers/marches-publics/marches-publics.service';
import { MostaqlService } from '../scrapers/mostaql/mostaql.service';
import { KhamsatService } from '../scrapers/khamsat/khamsat.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';

/**
 * Docs2/10-DASHBOARD-ET-ADMIN.md "Gestion sources" (CRUD, enable/disable, run
 * now) — list configured platform_sources + trigger a manual run for
 * platforms with an implemented adapter (ReKrute, Marchés Publics, Mostaql,
 * Khamsat).
 */
@Injectable()
export class SourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rekruteService: RekruteService,
    private readonly marchesPublicsService: MarchesPublicsService,
    private readonly mostaqlService: MostaqlService,
    private readonly khamsatService: KhamsatService,
  ) {}

  async findAll() {
    const sources = await this.prisma.platformSource.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { offers: true } } },
    });

    return sources.map((source) => ({
      id: source.id,
      platform: source.platform,
      name: source.name,
      type: source.type,
      baseUrl: source.baseUrl,
      active: source.active,
      frequencyMinutes: source.frequencyMinutes,
      maxPages: source.maxPages,
      keywords: (source.config as { keywords?: string[] } | null)?.keywords ?? [],
      lastRunAt: source.lastRunAt,
      lastRunStatus: source.lastRunStatus,
      offerCount: source._count.offers,
    }));
  }

  async create(dto: CreateSourceDto) {
    const existing = await this.prisma.platformSource.findUnique({
      where: { platform_name: { platform: dto.platform, name: dto.name } },
    });
    if (existing) throw new ConflictException('A source with this platform + name already exists');

    return this.prisma.platformSource.create({
      data: {
        platform: dto.platform,
        name: dto.name,
        type: dto.type,
        baseUrl: dto.baseUrl,
        active: dto.active ?? true,
        frequencyMinutes: dto.frequencyMinutes ?? 1440,
        maxPages: dto.maxPages ?? 5,
        config: dto.keywords ? { keywords: dto.keywords } : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateSourceDto) {
    const source = await this.ensureExists(id);
    const existingConfig = (source.config as { keywords?: string[] } | null) ?? {};

    return this.prisma.platformSource.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.baseUrl !== undefined ? { baseUrl: dto.baseUrl } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        ...(dto.frequencyMinutes !== undefined ? { frequencyMinutes: dto.frequencyMinutes } : {}),
        ...(dto.maxPages !== undefined ? { maxPages: dto.maxPages } : {}),
        ...(dto.keywords !== undefined ? { config: { ...existingConfig, keywords: dto.keywords } } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.platformSource.delete({ where: { id } });
    return { ok: true };
  }

  async run(id: string) {
    const source = await this.ensureExists(id);

    switch (source.platform) {
      case Platform.REKRUTE: {
        const keywords = (source.config as { keywords?: string[] } | null)?.keywords;
        return this.rekruteService.run(keywords);
      }
      case Platform.MARCHES_PUBLICS: {
        const keywords = (source.config as { keywords?: string[] } | null)?.keywords;
        return this.marchesPublicsService.run(keywords);
      }
      case Platform.MOSTAQL: {
        const listingPaths = (source.config as { listingPaths?: string[] } | null)?.listingPaths;
        return this.mostaqlService.run(listingPaths);
      }
      case Platform.KHAMSAT:
        return this.khamsatService.run();
      case Platform.FIVERR:
      case Platform.LINKEDIN:
      case Platform.JOBMAROC:
        throw new BadRequestException(
          `Pas de scraper pour ${source.platform} — désactivez cette source ou attendez un adaptateur.`,
        );
      default:
        throw new BadRequestException(
          `No scraper adapter implemented yet for platform ${source.platform} (Docs2/16 roadmap).`,
        );
    }
  }

  private async ensureExists(id: string) {
    const source = await this.prisma.platformSource.findUnique({ where: { id } });
    if (!source) throw new NotFoundException(`Source ${id} not found`);
    return source;
  }
}
