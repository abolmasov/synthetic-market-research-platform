import { Injectable } from '@nestjs/common';
import { RunRepository } from '../../domain/study/run.repository';
import { Run } from '../../domain/study/run';

@Injectable()
export class InMemoryRunRepository implements RunRepository {
  private runs: Map<string, Run> = new Map();

  async create(run: Run): Promise<Run> {
    const id = run.id ?? crypto.randomUUID();
    const newRun = Run.rehydrate({
      id,
      hypothesisId: run.hypothesisId,
      panelId: run.panelId,
      variantIds: run.variantIds,
      stage: run.stage,
      status: run.status,
      config: run.config,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      createdAt: run.createdAt ?? new Date(),
    });
    this.runs.set(id, newRun);
    return Promise.resolve(newRun);
  }

  async findAllByHypothesis(hypothesisId: string): Promise<Run[]> {
    return Promise.resolve(
      Array.from(this.runs.values())
        .filter((r) => r.hypothesisId === hypothesisId)
        .sort(
          (a, b) =>
            (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
        ),
    );
  }

  async findById(id: string): Promise<Run | null> {
    return Promise.resolve(this.runs.get(id) ?? null);
  }

  async update(run: Run): Promise<Run> {
    if (!run.id || !this.runs.has(run.id)) {
      throw new Error(`Run with id ${run.id} not found`);
    }
    this.runs.set(run.id, run);
    return Promise.resolve(run);
  }

  async delete(id: string): Promise<boolean> {
    return Promise.resolve(this.runs.delete(id));
  }
}
