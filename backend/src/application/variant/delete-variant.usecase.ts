import { Inject, Injectable } from '@nestjs/common';
import type { VariantRepository } from '../../domain/hypothesis/variant.repository';
import { VARIANT_REPOSITORY } from '../../common/tokens';

@Injectable()
export class DeleteVariantUseCase {
  constructor(
    @Inject(VARIANT_REPOSITORY)
    private readonly repository: VariantRepository,
  ) {}

  async execute(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
