import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { VariantRepository } from '../../domain/hypothesis/variant.repository';
import { Variant } from '../../domain/hypothesis/variant';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';
import { buildPaginatedResult } from '../../common/pagination';

@Injectable()
export class InMemoryVariantRepository implements VariantRepository {
  private readonly variants = new Map<string, Variant>();

  create(variant: Variant): Promise<Variant> {
    const id = randomUUID();
    const createdAt = new Date();
    const created = Variant.rehydrate({
      id,
      createdAt,
      hypothesisId: variant.hypothesisId,
      name: variant.name,
      description: variant.description ?? null,
      pricePoint: variant.pricePoint ?? null,
      positioning: variant.positioning ?? null,
      claims: variant.claims ?? null,
      changeSummary: variant.changeSummary,
      content: variant.content,
      version: variant.version,
      status: variant.status,
      expectedUplift: variant.expectedUplift ?? null,
      successMetric: variant.successMetric ?? null,
      risk: variant.risk ?? null,
      notes: variant.notes ?? null,
    });

    this.variants.set(id, created);
    return Promise.resolve(created);
  }

  findAllByHypothesis(hypothesisId: string): Promise<Variant[]> {
    return Promise.resolve(
      [...this.variants.values()]
        .filter((variant) => variant.hypothesisId === hypothesisId)
        .sort(
          (a, b) =>
            (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
        ),
    );
  }

  findAllByHypothesisPaginated(
    hypothesisId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Variant>> {
    const all = [...this.variants.values()]
      .filter((variant) => variant.hypothesisId === hypothesisId)
      .sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      );
    const start = (options.page - 1) * options.limit;
    const data = all.slice(start, start + options.limit);
    return Promise.resolve(
      buildPaginatedResult(data, all.length, options.page, options.limit),
    );
  }

  findById(id: string): Promise<Variant | null> {
    return Promise.resolve(this.variants.get(id) ?? null);
  }

  update(variant: Variant): Promise<Variant> {
    if (variant.id) {
      this.variants.set(variant.id, variant);
    }
    return Promise.resolve(variant);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.variants.delete(id));
  }

  getNextVersion(hypothesisId: string, name: string): Promise<number> {
    const versions = [...this.variants.values()]
      .filter(
        (variant) =>
          variant.hypothesisId === hypothesisId && variant.name === name,
      )
      .map((variant) => variant.version);
    const max = versions.length ? Math.max(...versions) : 0;
    return Promise.resolve(max + 1);
  }
}
