import { Module } from '@nestjs/common';
import { RekruteController } from './rekrute.controller';
import { RekruteService } from './rekrute.service';

@Module({
  controllers: [RekruteController],
  providers: [RekruteService],
})
export class RekruteModule {}
