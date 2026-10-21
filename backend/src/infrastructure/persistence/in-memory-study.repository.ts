import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StudyRepository } from '../../domain/study/study.repository';
import { Study } from '../../domain/study/study';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';
import { buildPaginatedResult } from '../../common/pagination';

@Injectable()
export class InMemoryStudyRepository implements StudyRepository {
  private readonly studies = new Map<string, Study>();

  create(study: Study): Promise<Study> {
    const id = randomUUID();
    const createdAt = new Date();
    const created = Study.rehydrate({
      id,
      createdAt,
      workspaceId: study.workspaceId ?? null,
      name: study.name,
      objective: study.objective,
      status: study.status,
      tags: study.tags ?? null,
    });

    this.studies.set(id, created);
    return Promise.resolve(created);
  }

  findAll(workspaceId?: string): Promise<Study[]> {
    const all = [...this.studies.values()]
      .filter((s) => !workspaceId || s.workspaceId === workspaceId)
      .sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      );
    return Promise.resolve(all);
  }

  findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<Study>> {
    const all = [...this.studies.values()]
      .filter(
        (s) => !options.workspaceId || s.workspaceId === options.workspaceId,
      )
      .sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      );
    const start = (options.page - 1) * options.limit;
    const data = all.slice(start, start + options.limit);
    return Promise.resolve(
      buildPaginatedResult(data, all.length, options.page, options.limit),
    );
  }

  findById(id: string, workspaceId?: string): Promise<Study | null> {
    const study = this.studies.get(id) ?? null;
    if (!study) return Promise.resolve(null);
    if (workspaceId && study.workspaceId !== workspaceId)
      return Promise.resolve(null);
    return Promise.resolve(study);
  }

  update(study: Study): Promise<Study> {
    if (study.id) {
      this.studies.set(study.id, study);
    }
    return Promise.resolve(study);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.studies.delete(id));
  }
}
