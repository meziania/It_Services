import { ItCategory, OfferType, Platform } from '@serviceit-scanner/database';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * Manual offer creation (roadmap MVP perso, step 1 in Docs2/16):
 * lets you test the UI (scoring, message generation, WhatsApp/email
 * actions) before any scraper exists.
 */
export class CreateOfferDto {
  @IsEnum(Platform)
  platform: Platform;

  @IsString()
  @MinLength(1)
  externalId: string;

  @IsString()
  url: string;

  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  descriptionRaw: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsString()
  budgetText?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @IsOptional()
  @IsEnum(OfferType)
  offerType?: OfferType;

  @IsOptional()
  @IsEnum(ItCategory)
  itCategory?: ItCategory;
}
