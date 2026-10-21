import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SegmentRepository } from '../../../domain/segment/segment.repository';
import { Segment } from '../../../domain/segment/segment';
import { SegmentOrmEntity } from './segment.orm-entity';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../../common/pagination';
import { buildPaginatedResult } from '../../../common/pagination';

@Injectable()
export class TypeormSegmentRepository implements SegmentRepository {
  constructor(
    @InjectRepository(SegmentOrmEntity)
    private readonly repository: Repository<SegmentOrmEntity>,
  ) {}

  async create(segment: Segment): Promise<Segment> {
    const entity = this.repository.create({
      name: segment.name,
      description: segment.description,
      demographicCriteria: segment.demographicCriteria,
      psychographicTraits: segment.psychographicTraits,
      behavioralPatterns: segment.behavioralPatterns,
      workspaceId: segment.workspaceId ?? null,
    });

    const saved = await this.repository.save(entity);
    return this.mapToDomain(saved);
  }

  private mapToDomain(record: SegmentOrmEntity): Segment {
    return Segment.rehydrate({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      name: record.name,
      description: record.description,
      demographicCriteria: record.demographicCriteria,
      psychographicTraits: record.psychographicTraits,
      behavioralPatterns: record.behavioralPatterns,
      workspaceId: record.workspaceId ?? null,
    });
  }

  async findAll(workspaceId?: string): Promise<Segment[]> {
    const records = await this.repository.find({
      where: workspaceId ? { workspaceId } : undefined,
      order: { createdAt: 'DESC' },
    });

    return records.map((record) => this.mapToDomain(record));
  }

  async findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<Segment>> {
    const [records, total] = await this.repository.findAndCount({
      where: options.workspaceId
        ? { workspaceId: options.workspaceId }
        : undefined,
      order: { createdAt: 'DESC' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });

    return buildPaginatedResult(
      records.map((record) => this.mapToDomain(record)),
      total,
      options.page,
      options.limit,
    );
  }

  async findById(id: string, workspaceId?: string): Promise<Segment | null> {
    const record = await this.repository.findOne({
      where: workspaceId ? { id, workspaceId } : { id },
    });
    if (!record) {
      return null;
    }

    return this.mapToDomain(record);
  }

  async update(segment: Segment): Promise<Segment> {
    const entity = this.repository.create({
      id: segment.id,
      name: segment.name,
      description: segment.description,
      demographicCriteria: segment.demographicCriteria,
      psychographicTraits: segment.psychographicTraits,
      behavioralPatterns: segment.behavioralPatterns,
      workspaceId: segment.workspaceId ?? null,
      createdAt: segment.createdAt,
    });

    const saved = await this.repository.save(entity);
    return this.mapToDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return Boolean(result.affected);
  }
}
