import { OfferStatus } from '@serviceit-scanner/database';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateOfferDto {
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  matchScore?: number;

  @IsOptional()
  @IsString({ each: true })
  matchReasons?: string[];
}
