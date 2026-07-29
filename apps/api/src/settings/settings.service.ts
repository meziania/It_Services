import { Injectable } from '@nestjs/common';
import type { Prisma } from '@serviceit-scanner/database';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SETTINGS_ID = 'singleton';

const DEFAULT_SKILLS = [
  'React',
  'Next.js',
  'Node.js',
  'NestJS',
  'TypeScript',
  'Laravel',
  'PHP',
  'WordPress',
];

const DEFAULT_SERVICES = [
  { code: 'SVC_WEB_VITRINE', label: 'Développement Web', enabled: true },
  { code: 'SVC_MOBILE', label: 'Développement Mobile', enabled: true },
  { code: 'SVC_API', label: 'API & Intégrations', enabled: true },
  { code: 'SVC_MAINTENANCE', label: 'DevOps & Cloud', enabled: false },
];

const DEFAULT_WEIGHTS = {
  stack: 40,
  freelance: 25,
  freshness: 15,
  location: 10,
  budget: 10,
};

const DEFAULT_TEMPLATE = {
  subject: '{titre} — proposition de collaboration',
  body: `Bonjour,

J'ai vu votre annonce "{titre}"{entreprise} sur {plateforme}.
Je peux vous proposer :
- ...
- Délai indicatif : ...
- Disponible pour un court échange cette semaine.

Cordialement,
{votre_nom} — {portfolio}`,
};

/**
 * Docs2/10-DASHBOARD-ET-ADMIN.md "Settings" — one shared row for the whole
 * team profile (skills/services/weights/template) consumed by the scoring
 * engine (see offers/scoring.ts). Auto-created with defaults on first read.
 */
@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const existing = await this.prisma.teamSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (existing) return existing;

    return this.prisma.teamSettings.create({
      data: {
        id: SETTINGS_ID,
        skills: DEFAULT_SKILLS,
        services: DEFAULT_SERVICES,
        weights: DEFAULT_WEIGHTS,
        template: DEFAULT_TEMPLATE,
      },
    });
  }

  async update(dto: UpdateSettingsDto) {
    await this.get(); // ensure the row exists before updating

    const data: Prisma.TeamSettingsUpdateInput = {
      ...(dto.skills !== undefined ? { skills: dto.skills } : {}),
      ...(dto.services !== undefined ? { services: dto.services as unknown as Prisma.InputJsonValue } : {}),
      ...(dto.weights !== undefined ? { weights: dto.weights as unknown as Prisma.InputJsonValue } : {}),
      ...(dto.template !== undefined ? { template: dto.template as unknown as Prisma.InputJsonValue } : {}),
    };

    return this.prisma.teamSettings.update({ where: { id: SETTINGS_ID }, data });
  }
}
