import { Inject, Injectable } from '@nestjs/common';
import type { HypothesisRepository } from '../../domain/hypothesis/hypothesis.repository';
import { HYPOTHESIS_REPOSITORY } from '../../common/tokens';

@Injectable()
export class DeleteHypothesisUseCase {
  constructor(
    @Inject(HYPOTHESIS_REPOSITORY)
    private readonly repository: HypothesisRepository,
  ) {}

  async execute(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
