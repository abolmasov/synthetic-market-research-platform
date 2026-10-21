import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Run } from '../../domain/study/run';
import type { RunRepository } from '../../domain/study/run.repository';
import { RUN_REPOSITORY } from '../../common/tokens';

@Injectable()
export class GetRunUseCase {
  constructor(
    @Inject(RUN_REPOSITORY)
    private readonly runRepository: RunRepository,
  ) {}

  async execute(id: string): Promise<Run> {
    const run = await this.runRepository.findById(id);
    if (!run) {
      throw new NotFoundException(`Run with ID ${id} not found`);
    }
    return run;
  }
}
