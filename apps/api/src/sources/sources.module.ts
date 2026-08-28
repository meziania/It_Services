import { Module } from '@nestjs/common';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';
import { RekruteModule } from '../scrapers/rekrute/rekrute.module';
import { MarchesPublicsModule } from '../scrapers/marches-publics/marches-publics.module';
import { MostaqlModule } from '../scrapers/mostaql/mostaql.module';
import { KhamsatModule } from '../scrapers/khamsat/khamsat.module';

@Module({
  imports: [RekruteModule, MarchesPublicsModule, MostaqlModule, KhamsatModule],
  controllers: [SourcesController],
  providers: [SourcesService],
  exports: [SourcesService],
})
export class SourcesModule {}
