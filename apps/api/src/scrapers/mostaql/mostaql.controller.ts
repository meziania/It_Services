import { Body, Controller, Post } from '@nestjs/common';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { MostaqlService } from './mostaql.service';

class RunMostaqlDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  listingPaths?: string[];
}

@Controller('scrapers/mostaql')
export class MostaqlController {
  constructor(private readonly mostaqlService: MostaqlService) {}

  @Post('run')
  run(@Body() dto: RunMostaqlDto) {
    return this.mostaqlService.run(dto.listingPaths);
  }
}
