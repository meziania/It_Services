import { Module } from '@nestjs/common';
import { KhamsatController } from './khamsat.controller';
import { KhamsatService } from './khamsat.service';
import { SettingsModule } from '../../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [KhamsatController],
  providers: [KhamsatService],
  exports: [KhamsatService],
})
export class KhamsatModule {}
