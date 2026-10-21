import { Injectable } from '@nestjs/common';
import { ArtifactRepository } from '../../domain/study/artifact.repository';
import { Artifact } from '../../domain/study/artifact';

@Injectable()
export class InMemoryArtifactRepository implements ArtifactRepository {
  private artifacts: Map<string, Artifact> = new Map();

  async create(artifact: Artifact): Promise<Artifact> {
    const id = artifact.id ?? crypto.randomUUID();
    const newArtifact = Artifact.rehydrate({
      id,
      runId: artifact.runId,
      stage: artifact.stage,
      type: artifact.type,
      payload: artifact.payload,
      createdAt: artifact.createdAt ?? new Date(),
    });
    this.artifacts.set(id, newArtifact);
    return Promise.resolve(newArtifact);
  }

  async findAllByRun(runId: string): Promise<Artifact[]> {
    return Promise.resolve(
      Array.from(this.artifacts.values())
        .filter((a) => a.runId === runId)
        .sort(
          (a, b) =>
            (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
        ),
    );
  }

  async findById(id: string): Promise<Artifact | null> {
    return Promise.resolve(this.artifacts.get(id) ?? null);
  }

  async update(artifact: Artifact): Promise<Artifact> {
    if (!artifact.id || !this.artifacts.has(artifact.id)) {
      throw new Error(`Artifact with id ${artifact.id} not found`);
    }
    this.artifacts.set(artifact.id, artifact);
    return Promise.resolve(artifact);
  }

  async delete(id: string): Promise<boolean> {
    return Promise.resolve(this.artifacts.delete(id));
  }
}
