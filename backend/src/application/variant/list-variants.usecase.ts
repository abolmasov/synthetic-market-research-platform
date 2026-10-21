import { Inject, Injectable } from '@nestjs/common';
import type { HypothesisRepository } from '../../domain/hypothesis/hypothesis.repository';
import type { VariantRepository } from '../../domain/hypothesis/variant.repository';
import { Variant } from '../../domain/hypothesis/variant';
import { HYPOTHESIS_REPOSITORY, VARIANT_REPOSITORY } from '../../common/tokens';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';

@Injectable()
export class ListVariantsUseCase {
  constructor(
    @Inject(HYPOTHESIS_REPOSITORY)
    private readonly hypothesisRepository: HypothesisRepository,
    @Inject(VARIANT_REPOSITORY)
    private readonly variantRepository: VariantRepository,
  ) {}

  execute(hypothesisId: string): Promise<Variant[] | null>;
  execute(
    hypothesisId: string,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Variant> | null>;
  async execute(
    hypothesisId: string,
    pagination?: PaginationOptions,
  ): Promise<Variant[] | PaginatedResult<Variant> | null> {
    const hypothesis = await this.hypothesisRepository.findById(hypothesisId);
    if (!hypothesis) {
      return null;
    }

    if (pagination) {
      return this.variantRepository.findAllByHypothesisPaginated(
        hypothesisId,
        pagination,
      );
    }
    return this.variantRepository.findAllByHypothesis(hypothesisId);
  }
}
