import { Module } from '@nestjs/common';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';
import { RekruteModule } from '../scrapers/rekrute/rekrute.module';
import { MarchesPublicsModule } from '../scrapers/marches-publics/marches-publics.module';

@Module({
  imports: [RekruteModule, MarchesPublicsModule],
  controllers: [SourcesController],
  providers: [SourcesService],
})
export class SourcesModule {}
