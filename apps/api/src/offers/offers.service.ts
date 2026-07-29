import { Injectable, NotFoundException } from '@nestjs/common';
import { OfferStatus, Prisma } from '@serviceit-scanner/database';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: OfferStatus) {
    return this.prisma.jobOffer.findMany({
      where: status ? { status } : undefined,
      include: { contacts: true, messages: true },
      orderBy: [{ matchScore: 'desc' }, { publishedAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const offer = await this.prisma.jobOffer.findUnique({
      where: { id },
      include: { contacts: true, messages: true, source: true },
    });
    if (!offer) throw new NotFoundException(`Offer ${id} not found`);
    return offer;
  }

  create(dto: CreateOfferDto) {
    const data: Prisma.JobOfferCreateInput = {
      platform: dto.platform,
      externalId: dto.externalId,
      url: dto.url,
      title: dto.title,
      descriptionRaw: dto.descriptionRaw,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      budgetText: dto.budgetText,
      location: dto.location,
      remote: dto.remote,
      offerType: dto.offerType,
      itCategory: dto.itCategory,
    };
    return this.prisma.jobOffer.create({ data });
  }

  async update(id: string, dto: UpdateOfferDto) {
    await this.findOne(id);
    return this.prisma.jobOffer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.jobOffer.delete({ where: { id } });
    return { id, deleted: true };
  }
}
