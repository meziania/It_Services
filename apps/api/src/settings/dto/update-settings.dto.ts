import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export interface ServiceEntry {
  code: string;
  label: string;
  enabled: boolean;
}

export interface ScoringWeights {
  stack: number;
  freelance: number;
  freshness: number;
  location: number;
  budget: number;
}

export interface MessageTemplate {
  subject: string;
  body: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  services?: ServiceEntry[];

  @IsOptional()
  @IsObject()
  weights?: ScoringWeights;

  @IsOptional()
  @IsObject()
  template?: MessageTemplate;
}
