import { Module } from '@nestjs/common';
import { MarchesPublicsController } from './marches-publics.controller';
import { MarchesPublicsService } from './marches-publics.service';
import { SettingsModule } from '../../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [MarchesPublicsController],
  providers: [MarchesPublicsService],
  exports: [MarchesPublicsService],
})
export class MarchesPublicsModule {}
