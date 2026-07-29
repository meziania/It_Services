import { Body, Controller, Post } from '@nestjs/common';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { RekruteService } from './rekrute.service';

class RunRekruteDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}

/**
 * Manual "run now" trigger (Docs2/05 acceptance criteria: "Enable/disable,
 * run manuel, schedule"). Scheduling comes later; for now this is invoked
 * by hand from the dashboard or curl/Postman.
 */
@Controller('scrapers/rekrute')
export class RekruteController {
  constructor(private readonly rekruteService: RekruteService) {}

  @Post('run')
  run(@Body() dto: RunRekruteDto) {
    return this.rekruteService.run(dto.keywords);
  }
}
