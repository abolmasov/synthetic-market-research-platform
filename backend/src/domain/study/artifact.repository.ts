import { Artifact } from './artifact';

export interface ArtifactRepository {
  create(artifact: Artifact): Promise<Artifact>;
  findAllByRun(runId: string): Promise<Artifact[]>;
  findById(id: string): Promise<Artifact | null>;
  update(artifact: Artifact): Promise<Artifact>;
  delete(id: string): Promise<boolean>;
}
