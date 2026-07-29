import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { SourcesModule } from '../sources/sources.module';

@Module({
  imports: [ScheduleModule.forRoot(), SourcesModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
