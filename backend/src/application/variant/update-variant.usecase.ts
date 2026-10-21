import { Inject, Injectable } from '@nestjs/common';
import type { VariantRepository } from '../../domain/hypothesis/variant.repository';
import { Variant, VariantStatus } from '../../domain/hypothesis/variant';
import { VARIANT_REPOSITORY } from '../../common/tokens';

export type UpdateVariantInput = {
  name?: string;
  description?: string | null;
  pricePoint?: number | null;
  positioning?: string | null;
  claims?: string[] | null;
  changeSummary?: string;
  content?: string;
  status?: VariantStatus;
  expectedUplift?: number | null;
  successMetric?: string | null;
  risk?: string | null;
  notes?: string | null;
};

@Injectable()
export class UpdateVariantUseCase {
  constructor(
    @Inject(VARIANT_REPOSITORY)
    private readonly repository: VariantRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateVariantInput,
  ): Promise<Variant | null> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }

    const updated = Variant.rehydrate({
      id: existing.id ?? id,
      createdAt: existing.createdAt ?? new Date(),
      hypothesisId: existing.hypothesisId,
      name: input.name ?? existing.name,
      description:
        input.description !== undefined
          ? input.description
          : (existing.description ?? null),
      pricePoint:
        input.pricePoint !== undefined
          ? input.pricePoint
          : (existing.pricePoint ?? null),
      positioning:
        input.positioning !== undefined
          ? input.positioning
          : (existing.positioning ?? null),
      claims:
        input.claims !== undefined ? input.claims : (existing.claims ?? null),
      changeSummary: input.changeSummary ?? existing.changeSummary,
      content: input.content ?? existing.content,
      version: existing.version,
      status: input.status ?? existing.status,
      expectedUplift:
        input.expectedUplift !== undefined
          ? input.expectedUplift
          : (existing.expectedUplift ?? null),
      successMetric:
        input.successMetric !== undefined
          ? input.successMetric
          : (existing.successMetric ?? null),
      risk: input.risk !== undefined ? input.risk : (existing.risk ?? null),
      notes: input.notes !== undefined ? input.notes : (existing.notes ?? null),
    });

    return this.repository.update(updated);
  }
}
