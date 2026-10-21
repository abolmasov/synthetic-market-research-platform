import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { HypothesisRepository } from '../../domain/hypothesis/hypothesis.repository';
import { Hypothesis } from '../../domain/hypothesis/hypothesis';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';
import { buildPaginatedResult } from '../../common/pagination';

@Injectable()
export class InMemoryHypothesisRepository implements HypothesisRepository {
  private readonly hypotheses = new Map<string, Hypothesis>();

  create(hypothesis: Hypothesis): Promise<Hypothesis> {
    const id = randomUUID();
    const createdAt = new Date();
    const created = Hypothesis.rehydrate({
      id,
      createdAt,
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

    this.hypotheses.set(id, created);
    return Promise.resolve(created);
  }

  findAll(workspaceId?: string): Promise<Hypothesis[]> {
    let all = [...this.hypotheses.values()].sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
    if (workspaceId) {
      all = all.filter((h) => h.workspaceId === workspaceId);
    }
    return Promise.resolve(all);
  }

  findAllPaginated(
    options: PaginationOptions,
    studyId?: string,
  ): Promise<PaginatedResult<Hypothesis>> {
    let all = [...this.hypotheses.values()].sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
    if (studyId) {
      all = all.filter((h) => h.studyId === studyId);
    }
    if (options.workspaceId) {
      all = all.filter((h) => h.workspaceId === options.workspaceId);
    }
    const start = (options.page - 1) * options.limit;
    const data = all.slice(start, start + options.limit);
    return Promise.resolve(
      buildPaginatedResult(data, all.length, options.page, options.limit),
    );
  }

  findAllByStudy(studyId: string): Promise<Hypothesis[]> {
    return Promise.resolve(
      [...this.hypotheses.values()]
        .filter((hypothesis) => hypothesis.studyId === studyId)
        .sort(
          (a, b) =>
            (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
        ),
    );
  }

  findById(id: string, workspaceId?: string): Promise<Hypothesis | null> {
    const hypothesis = this.hypotheses.get(id) ?? null;
    if (!hypothesis) return Promise.resolve(null);
    if (workspaceId && hypothesis.workspaceId !== workspaceId)
      return Promise.resolve(null);
    return Promise.resolve(hypothesis);
  }

  update(hypothesis: Hypothesis): Promise<Hypothesis> {
    if (hypothesis.id) {
      this.hypotheses.set(hypothesis.id, hypothesis);
    }
    return Promise.resolve(hypothesis);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.hypotheses.delete(id));
  }
}
