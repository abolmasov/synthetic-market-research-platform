import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SimulationRepository } from '../../domain/simulation/simulation.repository';
import { Simulation } from '../../domain/simulation/simulation';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';
import { buildPaginatedResult } from '../../common/pagination';

@Injectable()
export class InMemorySimulationRepository implements SimulationRepository {
  private readonly simulations = new Map<string, Simulation>();

  create(simulation: Simulation): Promise<Simulation> {
    const id = randomUUID();
    const createdAt = new Date();
    const created = Simulation.rehydrate({
      id,
      createdAt,
      hypothesis: simulation.hypothesis,
      hypothesisId: simulation.hypothesisId ?? null,
      workspaceId: simulation.workspaceId ?? null,
      status: simulation.status,
      summary: simulation.summary,
      decisions: simulation.decisions,
      ragSources: simulation.ragSources,
      topSignals: simulation.topSignals,
      objections: simulation.objections,
      completedAt: simulation.completedAt ?? null,
    });

    this.simulations.set(id, created);
    return Promise.resolve(created);
  }

  findAll(workspaceId?: string): Promise<Simulation[]> {
    let all = [...this.simulations.values()].sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
    if (workspaceId) {
      all = all.filter((s) => s.workspaceId === workspaceId);
    }
    return Promise.resolve(all);
  }

  findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<Simulation>> {
    let all = [...this.simulations.values()].sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
    if (options.workspaceId) {
      all = all.filter((s) => s.workspaceId === options.workspaceId);
    }
    const start = (options.page - 1) * options.limit;
    const data = all.slice(start, start + options.limit);
    return Promise.resolve(
      buildPaginatedResult(data, all.length, options.page, options.limit),
    );
  }

  findById(id: string, workspaceId?: string): Promise<Simulation | null> {
    const simulation = this.simulations.get(id) ?? null;
    if (!simulation) return Promise.resolve(null);
    if (workspaceId && simulation.workspaceId !== workspaceId)
      return Promise.resolve(null);
    return Promise.resolve(simulation);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.simulations.delete(id));
  }
}
