import { Inject, Injectable } from '@nestjs/common';
import type { VariantRepository } from '../../domain/hypothesis/variant.repository';
import { Variant } from '../../domain/hypothesis/variant';
import { VARIANT_REPOSITORY } from '../../common/tokens';

@Injectable()
export class GetVariantUseCase {
  constructor(
    @Inject(VARIANT_REPOSITORY)
    private readonly repository: VariantRepository,
  ) {}

  async execute(id: string): Promise<Variant | null> {
    return this.repository.findById(id);
  }
}
