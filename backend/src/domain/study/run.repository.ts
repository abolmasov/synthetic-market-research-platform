import { Run } from './run';

export interface RunRepository {
  create(run: Run): Promise<Run>;
  findAllByHypothesis(hypothesisId: string): Promise<Run[]>;
  findById(id: string): Promise<Run | null>;
  update(run: Run): Promise<Run>;
  delete(id: string): Promise<boolean>;
}
