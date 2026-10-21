import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RunRepository } from '../../../domain/study/run.repository';
import { Run, RunStage, RunStatus } from '../../../domain/study/run';
import { RunOrmEntity } from './run.orm-entity';

@Injectable()
export class TypeormRunRepository implements RunRepository {
  constructor(
    @InjectRepository(RunOrmEntity)
    private readonly repository: Repository<RunOrmEntity>,
  ) {}

  async create(run: Run): Promise<Run> {
    const entity = this.repository.create({
      hypothesisId: run.hypothesisId,
      panelId: run.panelId ?? null,
      variantIds: run.variantIds,
      stage: run.stage,
      status: run.status,
      config: run.config as Record<string, unknown>,
      startedAt: run.startedAt ?? null,
      completedAt: run.completedAt ?? null,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findAllByHypothesis(hypothesisId: string): Promise<Run[]> {
    const records = await this.repository.find({
      where: { hypothesisId },
      order: { createdAt: 'DESC' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Run | null> {
    const record = await this.repository.findOne({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async update(run: Run): Promise<Run> {
    const entity = this.repository.create({
      id: run.id,
      hypothesisId: run.hypothesisId,
      panelId: run.panelId ?? null,
      variantIds: run.variantIds,
      stage: run.stage,
      status: run.status,
      config: run.config as Record<string, unknown>,
      startedAt: run.startedAt ?? null,
      completedAt: run.completedAt ?? null,
      createdAt: run.createdAt,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return Boolean(result.affected);
  }

  private toDomain(entity: RunOrmEntity): Run {
    return Run.rehydrate({
      id: entity.id,
      createdAt: entity.createdAt,
      hypothesisId: entity.hypothesisId,
      panelId: entity.panelId ?? null,
      variantIds: entity.variantIds,
      stage: entity.stage as RunStage,
      status: entity.status as RunStatus,
      config: entity.config,
      startedAt: entity.startedAt ?? null,
      completedAt: entity.completedAt ?? null,
    });
  }
}
