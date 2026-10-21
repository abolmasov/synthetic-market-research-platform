import { Segment } from './segment';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';

export interface SegmentRepository {
  create(segment: Segment): Promise<Segment>;
  findAll(workspaceId?: string): Promise<Segment[]>;
  findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<Segment>>;
  findById(id: string, workspaceId?: string): Promise<Segment | null>;
  update(segment: Segment): Promise<Segment>;
  delete(id: string): Promise<boolean>;
}
