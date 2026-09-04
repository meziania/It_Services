import { Injectable, NotFoundException } from '@nestjs/common';
import { OfferStatus, OutreachStatus, Prisma } from '@serviceit-scanner/database';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { CreateOutreachMessageDto } from './dto/create-outreach-message.dto';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: OfferStatus, minScore?: number) {
    return this.prisma.jobOffer.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(minScore !== undefined ? { matchScore: { gte: minScore } } : {}),
      },
      include: {
        contacts: true,
        messages: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: [{ matchScore: 'desc' }, { publishedAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const offer = await this.prisma.jobOffer.findUnique({
      where: { id },
      include: {
        contacts: true,
        messages: { orderBy: { createdAt: 'desc' } },
        source: true,
      },
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

  /**
   * Docs2/16 outreach: persist draft / sent proposal. Opening mailto or
   * WhatsApp marks SENT and, if the offer is still NEW, advances status to
   * CONTACTED so the pipeline board stays in sync without a second click.
   */
  async createMessage(offerId: string, dto: CreateOutreachMessageDto) {
    const offer = await this.findOne(offerId);
    const status = dto.status ?? OutreachStatus.DRAFT;
    const isSent = status === OutreachStatus.SENT;

    const message = await this.prisma.outreachMessage.create({
      data: {
        offerId,
        channel: dto.channel,
        subject: dto.subject,
        body: dto.body,
        status,
        sentAt: isSent ? new Date() : null,
      },
    });

    if (isSent && offer.status === OfferStatus.NEW) {
      await this.prisma.jobOffer.update({
        where: { id: offerId },
        data: { status: OfferStatus.CONTACTED },
      });
    }

    return message;
  }
}
