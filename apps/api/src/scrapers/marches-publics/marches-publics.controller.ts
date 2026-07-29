import { Body, Controller, Post } from '@nestjs/common';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { MarchesPublicsService } from './marches-publics.service';

class RunMarchesPublicsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}

/** Manual "run now" trigger — see rekrute.controller.ts for the same pattern. */
@Controller('scrapers/marches-publics')
export class MarchesPublicsController {
  constructor(private readonly marchesPublicsService: MarchesPublicsService) {}

  @Post('run')
  run(@Body() dto: RunMarchesPublicsDto) {
    return this.marchesPublicsService.run(dto.keywords);
  }
}
