import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SeedService } from '../../infrastructure/persistence/seed/seed.service';
import type {
  ClearAllResult,
  ClearStats,
  SeedOptions,
  SeedStats,
} from '../../infrastructure/persistence/seed/seed.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles, RolesGuard } from './guards/roles.guard';

@ApiTags('Seed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('personas')
  async seedPersonas(@Body() body?: SeedOptions): Promise<SeedStats> {
    return this.seedService.seedPersonas(body ?? {});
  }

  @Post('segments')
  async seedSegments(@Body() body?: SeedOptions): Promise<SeedStats> {
    return this.seedService.seedSegments(body ?? {});
  }

  @Post('hypotheses')
  async seedHypotheses(@Body() body?: SeedOptions): Promise<SeedStats> {
    return this.seedService.seedHypotheses(body ?? {});
  }

  @Post('simulations')
  async seedSimulations(@Body() body?: SeedOptions): Promise<SeedStats> {
    return this.seedService.seedSimulations(body ?? {});
  }

  @Post('all')
  async seedAll() {
    return this.seedService.seedAll();
  }

  @Post('rag-documents')
  async seedRagDocuments() {
    return this.seedService.seedRagDocuments();
  }

  @Post('clear/personas')
  async clearPersonas(): Promise<ClearStats> {
    return this.seedService.clearPersonas();
  }

  @Post('clear/segments')
  async clearSegments(): Promise<ClearStats> {
    return this.seedService.clearSegments();
  }

  @Post('clear/hypotheses')
  async clearHypotheses(): Promise<ClearStats> {
    return this.seedService.clearHypotheses();
  }

  @Post('clear/simulations')
  async clearSimulations(): Promise<ClearStats> {
    return this.seedService.clearSimulations();
  }

  @Post('clear/all')
  async clearAll(): Promise<ClearAllResult> {
    return this.seedService.clearAll();
  }
}
