import { Inject, Injectable } from '@nestjs/common';
import type { HypothesisRepository } from '../../domain/hypothesis/hypothesis.repository';
import type { VariantRepository } from '../../domain/hypothesis/variant.repository';
import { Variant, VariantStatus } from '../../domain/hypothesis/variant';
import { HYPOTHESIS_REPOSITORY, VARIANT_REPOSITORY } from '../../common/tokens';

export type CreateVariantInput = {
  hypothesisId: string;
  name: string;
  description?: string | null;
  pricePoint?: number | null;
  positioning?: string | null;
  claims?: string[] | null;
  changeSummary: string;
  content: string;
  status?: VariantStatus;
  expectedUplift?: number | null;
  successMetric?: string | null;
  risk?: string | null;
  notes?: string | null;
};

@Injectable()
export class CreateVariantUseCase {
  constructor(
    @Inject(HYPOTHESIS_REPOSITORY)
    private readonly hypothesisRepository: HypothesisRepository,
    @Inject(VARIANT_REPOSITORY)
    private readonly variantRepository: VariantRepository,
  ) {}

  async execute(input: CreateVariantInput): Promise<Variant | null> {
    const hypothesis = await this.hypothesisRepository.findById(
      input.hypothesisId,
    );
    if (!hypothesis) {
      return null;
    }

    const version = await this.variantRepository.getNextVersion(
      input.hypothesisId,
      input.name,
    );

    const variant = Variant.create({
      hypothesisId: input.hypothesisId,
      name: input.name,
      description: input.description ?? null,
      pricePoint: input.pricePoint ?? null,
      positioning: input.positioning ?? null,
      claims: input.claims ?? null,
      changeSummary: input.changeSummary,
      content: input.content,
      version,
      status: input.status ?? 'draft',
      expectedUplift: input.expectedUplift ?? null,
      successMetric: input.successMetric ?? null,
      risk: input.risk ?? null,
      notes: input.notes ?? null,
    });

    return this.variantRepository.create(variant);
  }
}
