import { Controller, Get } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { HealthService } from '../../application/health/health.service';

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    return this.healthService.checkHealth();
  }
}
