import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { Platform, SourceType } from '@serviceit-scanner/database';

export class CreateSourceDto {
  @IsEnum(Platform)
  platform: Platform;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(SourceType)
  type?: SourceType;

  @IsOptional()
  @IsUrl()
  baseUrl?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(5)
  frequencyMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxPages?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}
