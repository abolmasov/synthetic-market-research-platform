import { Inject, Injectable } from '@nestjs/common';
import type { HypothesisRepository } from '../../domain/hypothesis/hypothesis.repository';
import { Hypothesis } from '../../domain/hypothesis/hypothesis';
import { HYPOTHESIS_REPOSITORY } from '../../common/tokens';

@Injectable()
export class GetHypothesisUseCase {
  constructor(
    @Inject(HYPOTHESIS_REPOSITORY)
    private readonly repository: HypothesisRepository,
  ) {}

  async execute(id: string, workspaceId?: string): Promise<Hypothesis | null> {
    return this.repository.findById(id, workspaceId);
  }
}
