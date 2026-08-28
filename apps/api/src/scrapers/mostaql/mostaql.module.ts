import { Module } from '@nestjs/common';
import { MostaqlController } from './mostaql.controller';
import { MostaqlService } from './mostaql.service';
import { SettingsModule } from '../../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [MostaqlController],
  providers: [MostaqlService],
  exports: [MostaqlService],
})
export class MostaqlModule {}
