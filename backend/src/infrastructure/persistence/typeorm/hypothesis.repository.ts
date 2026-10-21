import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindManyOptions } from 'typeorm';
import { Repository } from 'typeorm';
import { HypothesisRepository } from '../../../domain/hypothesis/hypothesis.repository';
import {
  HypothesisGuardrail,
  HypothesisMetric,
  Hypothesis,
  HypothesisStage,
  HypothesisStatus,
  VerificationDecisionOutcome,
  VerificationDirection,
} from '../../../domain/hypothesis/hypothesis';
import { HypothesisOrmEntity } from './hypothesis.orm-entity';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../../common/pagination';
import { buildPaginatedResult } from '../../../common/pagination';

@Injectable()
export class TypeormHypothesisRepository implements HypothesisRepository {
  constructor(
    @InjectRepository(HypothesisOrmEntity)
    private readonly repository: Repository<HypothesisOrmEntity>,
  ) {}

  async create(hypothesis: Hypothesis): Promise<Hypothesis> {
    const entity = this.repository.create({
      workspaceId: hypothesis.workspaceId ?? null,
      studyId: hypothesis.studyId ?? null,
      stage: hypothesis.stage,
      title: hypothesis.title,
      statement: hypothesis.statement,
      status: hypothesis.status,
      successCriteria: hypothesis.successCriteria ?? null,
      protocolId: hypothesis.protocolId ?? null,
      primaryMetric: hypothesis.primaryMetric ?? null,
      primaryMetricDirection: hypothesis.primaryMetricDirection ?? null,
      primaryMetricThreshold: hypothesis.primaryMetricThreshold ?? null,
      guardrails: hypothesis.guardrails ?? null,
      falsificationRule: hypothesis.falsificationRule ?? null,
      sampleSize: hypothesis.sampleSize ?? null,
      testDurationDays: hypothesis.testDurationDays ?? null,
      decisionOutcome: hypothesis.decisionOutcome ?? 'pending',
      decisionReason: hypothesis.decisionReason ?? null,
      lastEvaluatedAt: hypothesis.lastEvaluatedAt ?? null,
      notes: hypothesis.notes ?? null,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findAll(workspaceId?: string): Promise<Hypothesis[]> {
    const records = await this.repository.find({
      where: workspaceId ? { workspaceId } : undefined,
      order: { createdAt: 'DESC' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findAllPaginated(
    options: PaginationOptions,
    studyId?: string,
  ): Promise<PaginatedResult<Hypothesis>> {
    const where: FindManyOptions<HypothesisOrmEntity>['where'] = studyId
      ? {
          studyId,
          ...(options.workspaceId ? { workspaceId: options.workspaceId } : {}),
        }
      : options.workspaceId
        ? { workspaceId: options.workspaceId }
        : undefined;

    const [records, total] = await this.repository.findAndCount({
      where,
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

  async findAllByStudy(studyId: string): Promise<Hypothesis[]> {
    const records = await this.repository.find({
      where: { studyId },
      order: { createdAt: 'DESC' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string, workspaceId?: string): Promise<Hypothesis | null> {
    const record = await this.repository.findOne({
      where: workspaceId ? { id, workspaceId } : { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async update(hypothesis: Hypothesis): Promise<Hypothesis> {
    const entity = this.repository.create({
      id: hypothesis.id,
      workspaceId: hypothesis.workspaceId ?? null,
      studyId: hypothesis.studyId ?? null,
      stage: hypothesis.stage,
      title: hypothesis.title,
      statement: hypothesis.statement,
      status: hypothesis.status,
      successCriteria: hypothesis.successCriteria ?? null,
      protocolId: hypothesis.protocolId ?? null,
      primaryMetric: hypothesis.primaryMetric ?? null,
      primaryMetricDirection: hypothesis.primaryMetricDirection ?? null,
      primaryMetricThreshold: hypothesis.primaryMetricThreshold ?? null,
      guardrails: hypothesis.guardrails ?? null,
      falsificationRule: hypothesis.falsificationRule ?? null,
      sampleSize: hypothesis.sampleSize ?? null,
      testDurationDays: hypothesis.testDurationDays ?? null,
      decisionOutcome: hypothesis.decisionOutcome ?? 'pending',
      decisionReason: hypothesis.decisionReason ?? null,
      lastEvaluatedAt: hypothesis.lastEvaluatedAt ?? null,
      notes: hypothesis.notes ?? null,
      createdAt: hypothesis.createdAt,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return Boolean(result.affected);
  }

  private toDomain(entity: HypothesisOrmEntity): Hypothesis {
    return Hypothesis.rehydrate({
      id: entity.id,
      createdAt: entity.createdAt,
      workspaceId: entity.workspaceId ?? null,
      studyId: entity.studyId ?? null,
      stage: entity.stage as HypothesisStage,
      title: entity.title,
      statement: entity.statement,
      status: entity.status as HypothesisStatus,
      successCriteria: entity.successCriteria ?? null,
      protocolId: entity.protocolId ?? null,
      primaryMetric: (entity.primaryMetric as HypothesisMetric | null) ?? null,
      primaryMetricDirection:
        (entity.primaryMetricDirection as VerificationDirection | null) ?? null,
      primaryMetricThreshold: entity.primaryMetricThreshold ?? null,
      guardrails: (entity.guardrails as HypothesisGuardrail[] | null) ?? null,
      falsificationRule: entity.falsificationRule ?? null,
      sampleSize: entity.sampleSize ?? null,
      testDurationDays: entity.testDurationDays ?? null,
      decisionOutcome:
        (entity.decisionOutcome as VerificationDecisionOutcome | null) ??
        'pending',
      decisionReason: entity.decisionReason ?? null,
      lastEvaluatedAt: entity.lastEvaluatedAt ?? null,
      notes: entity.notes ?? null,
    });
  }
}
