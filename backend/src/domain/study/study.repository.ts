import { Study } from './study';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';

export interface StudyRepository {
  create(study: Study): Promise<Study>;
  findAll(workspaceId?: string): Promise<Study[]>;
  findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Study>>;
  findById(id: string, workspaceId?: string): Promise<Study | null>;
  update(study: Study): Promise<Study>;
  delete(id: string): Promise<boolean>;
}
