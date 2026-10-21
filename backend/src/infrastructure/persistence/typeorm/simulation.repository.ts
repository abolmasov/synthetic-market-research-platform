import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SimulationRepository } from '../../../domain/simulation/simulation.repository';
import {
  Simulation,
  SimulationDecision,
  SimulationSummary,
} from '../../../domain/simulation/simulation';
import { RagSource } from '../../../domain/rag/rag-source';
import { SimulationOrmEntity } from './simulation.orm-entity';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../../common/pagination';
import { buildPaginatedResult } from '../../../common/pagination';

@Injectable()
export class TypeormSimulationRepository implements SimulationRepository {
  constructor(
    @InjectRepository(SimulationOrmEntity)
    private readonly repository: Repository<SimulationOrmEntity>,
  ) {}

  async create(simulation: Simulation): Promise<Simulation> {
    const entity = this.repository.create({
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

    const saved = await this.repository.save(entity);
    return Simulation.rehydrate({
      id: saved.id,
      createdAt: saved.createdAt,
      hypothesis: saved.hypothesis,
      hypothesisId: saved.hypothesisId ?? null,
      workspaceId: saved.workspaceId ?? null,
      status: saved.status as 'running' | 'completed',
      summary: saved.summary as SimulationSummary,
      decisions: saved.decisions as SimulationDecision[],
      ragSources: saved.ragSources as RagSource[],
      topSignals: saved.topSignals,
      objections: saved.objections,
      completedAt: saved.completedAt,
    });
  }

  async findAll(workspaceId?: string): Promise<Simulation[]> {
    const records = await this.repository.find({
      where: workspaceId ? { workspaceId } : undefined,
      order: { createdAt: 'DESC' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<Simulation>> {
    const [records, total] = await this.repository.findAndCount({
      where: options.workspaceId
        ? { workspaceId: options.workspaceId }
        : undefined,
      order: { createdAt: 'DESC' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });

    return buildPaginatedResult(
      records.map((record) => this.toDomain(record)),
      total,
      options.page,
      options.limit,
    );
  }

  private toDomain(record: SimulationOrmEntity): Simulation {
    return Simulation.rehydrate({
      id: record.id,
      createdAt: record.createdAt,
      hypothesis: record.hypothesis,
      hypothesisId: record.hypothesisId ?? null,
      workspaceId: record.workspaceId ?? null,
      status: record.status as 'running' | 'completed',
      summary: record.summary as SimulationSummary,
      decisions: record.decisions as SimulationDecision[],
      ragSources: record.ragSources as RagSource[],
      topSignals: record.topSignals,
      objections: record.objections,
      completedAt: record.completedAt,
    });
  }

  async findById(id: string, workspaceId?: string): Promise<Simulation | null> {
    const record = await this.repository.findOne({
      where: workspaceId ? { id, workspaceId } : { id },
    });
    if (!record) {
      return null;
    }

    return Simulation.rehydrate({
      id: record.id,
      createdAt: record.createdAt,
      hypothesis: record.hypothesis,
      hypothesisId: record.hypothesisId ?? null,
      workspaceId: record.workspaceId ?? null,
      status: record.status as 'running' | 'completed',
      summary: record.summary as SimulationSummary,
      decisions: record.decisions as SimulationDecision[],
      ragSources: record.ragSources as RagSource[],
      topSignals: record.topSignals,
      objections: record.objections,
      completedAt: record.completedAt,
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return Boolean(result.affected);
  }
}
