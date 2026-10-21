import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { RunRepository } from '../../domain/study/run.repository';
import { RUN_REPOSITORY } from '../../common/tokens';

@Injectable()
export class DeleteRunUseCase {
  constructor(
    @Inject(RUN_REPOSITORY)
    private readonly runRepository: RunRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.runRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Run with ID ${id} not found`);
    }
  }
}
