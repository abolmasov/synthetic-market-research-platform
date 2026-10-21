import { Variant } from './variant';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';

export interface VariantRepository {
  create(variant: Variant): Promise<Variant>;
  findAllByHypothesis(hypothesisId: string): Promise<Variant[]>;
  findAllByHypothesisPaginated(
    hypothesisId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Variant>>;
  findById(id: string): Promise<Variant | null>;
  update(variant: Variant): Promise<Variant>;
  delete(id: string): Promise<boolean>;
  getNextVersion(hypothesisId: string, name: string): Promise<number>;
}
