import { Module } from '@nestjs/common';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';
import { RekruteModule } from '../scrapers/rekrute/rekrute.module';

@Module({
  imports: [RekruteModule],
  controllers: [SourcesController],
  providers: [SourcesService],
})
export class SourcesModule {}
