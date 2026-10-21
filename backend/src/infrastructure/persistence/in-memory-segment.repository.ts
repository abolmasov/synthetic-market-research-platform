import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SegmentRepository } from '../../domain/segment/segment.repository';
import { Segment } from '../../domain/segment/segment';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';
import { buildPaginatedResult } from '../../common/pagination';

@Injectable()
export class InMemorySegmentRepository implements SegmentRepository {
  private readonly segments = new Map<string, Segment>();

  create(segment: Segment): Promise<Segment> {
    const id = randomUUID();
    const createdAt = new Date();
    const created = Segment.rehydrate({
      id,
      createdAt,
      updatedAt: createdAt,
      workspaceId: segment.workspaceId ?? null,
      name: segment.name,
      description: segment.description,
      demographicCriteria: segment.demographicCriteria,
      psychographicTraits: segment.psychographicTraits,
      behavioralPatterns: segment.behavioralPatterns,
    });

    this.segments.set(id, created);
    return Promise.resolve(created);
  }

  findAll(workspaceId?: string): Promise<Segment[]> {
    let all = [...this.segments.values()].sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
    if (workspaceId) {
      all = all.filter((s) => s.workspaceId === workspaceId);
    }
    return Promise.resolve(all);
  }

  findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<Segment>> {
    let all = [...this.segments.values()].sort(
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

  findById(id: string, workspaceId?: string): Promise<Segment | null> {
    const segment = this.segments.get(id) ?? null;
    if (!segment) return Promise.resolve(null);
    if (workspaceId && segment.workspaceId !== workspaceId)
      return Promise.resolve(null);
    return Promise.resolve(segment);
  }

  update(segment: Segment): Promise<Segment> {
    if (segment.id) {
      const updated = Segment.rehydrate({
        id: segment.id,
        createdAt: segment.createdAt ?? new Date(),
        updatedAt: new Date(),
        workspaceId: segment.workspaceId ?? null,
        name: segment.name,
        description: segment.description,
        demographicCriteria: segment.demographicCriteria,
        psychographicTraits: segment.psychographicTraits,
        behavioralPatterns: segment.behavioralPatterns,
      });
      this.segments.set(segment.id, updated);
      return Promise.resolve(updated);
    }
    return Promise.resolve(segment);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.segments.delete(id));
  }
}
