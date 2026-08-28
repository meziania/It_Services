import { Controller, Post } from '@nestjs/common';
import { KhamsatService } from './khamsat.service';

@Controller('scrapers/khamsat')
export class KhamsatController {
  constructor(private readonly khamsatService: KhamsatService) {}

  @Post('run')
  run() {
    return this.khamsatService.run();
  }
}
