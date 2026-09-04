import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OfferStatus } from '@serviceit-scanner/database';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { CreateOutreachMessageDto } from './dto/create-outreach-message.dto';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  findAll(
    @Query('status') status?: OfferStatus,
    @Query('minScore') minScoreRaw?: string,
  ) {
    const minScore =
      minScoreRaw !== undefined && minScoreRaw !== ''
        ? Number(minScoreRaw)
        : undefined;
    return this.offersService.findAll(
      status,
      Number.isFinite(minScore) ? minScore : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOfferDto) {
    return this.offersService.create(dto);
  }

  @Post(':id/messages')
  createMessage(@Param('id') id: string, @Body() dto: CreateOutreachMessageDto) {
    return this.offersService.createMessage(id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return this.offersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }
}
