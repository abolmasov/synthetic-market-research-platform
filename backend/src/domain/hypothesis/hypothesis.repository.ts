import { Hypothesis } from './hypothesis';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';

export interface HypothesisRepository {
  create(hypothesis: Hypothesis): Promise<Hypothesis>;
  findAll(workspaceId?: string): Promise<Hypothesis[]>;
  findAllPaginated(
    options: PaginationOptions,
    studyId?: string,
  ): Promise<PaginatedResult<Hypothesis>>;
  findAllByStudy(studyId: string): Promise<Hypothesis[]>;
  findById(id: string, workspaceId?: string): Promise<Hypothesis | null>;
  update(hypothesis: Hypothesis): Promise<Hypothesis>;
  delete(id: string): Promise<boolean>;
}
