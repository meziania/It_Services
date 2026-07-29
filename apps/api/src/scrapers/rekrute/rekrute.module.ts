import { Module } from '@nestjs/common';
import { RekruteController } from './rekrute.controller';
import { RekruteService } from './rekrute.service';
import { SettingsModule } from '../../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [RekruteController],
  providers: [RekruteService],
  exports: [RekruteService],
})
export class RekruteModule {}
