import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyRepository } from '../../../domain/study/study.repository';
import { Study, StudyStatus } from '../../../domain/study/study';
import { StudyOrmEntity } from './study.orm-entity';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../../common/pagination';
import { buildPaginatedResult } from '../../../common/pagination';

@Injectable()
export class TypeormStudyRepository implements StudyRepository {
  constructor(
    @InjectRepository(StudyOrmEntity)
    private readonly repository: Repository<StudyOrmEntity>,
  ) {}

  async create(study: Study): Promise<Study> {
    const entity = this.repository.create({
      workspaceId: study.workspaceId ?? null,
      name: study.name,
      objective: study.objective,
      status: study.status,
      tags: study.tags ?? null,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findAll(workspaceId?: string): Promise<Study[]> {
    const records = await this.repository.find({
      where: workspaceId ? { workspaceId } : undefined,
      order: { createdAt: 'DESC' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<Study>> {
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

  async findById(id: string, workspaceId?: string): Promise<Study | null> {
    const record = await this.repository.findOne({
      where: workspaceId ? { id, workspaceId } : { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async update(study: Study): Promise<Study> {
    const entity = this.repository.create({
      id: study.id,
      workspaceId: study.workspaceId ?? null,
      name: study.name,
      objective: study.objective,
      status: study.status,
      tags: study.tags ?? null,
      createdAt: study.createdAt,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return Boolean(result.affected);
  }

  private toDomain(entity: StudyOrmEntity): Study {
    return Study.rehydrate({
      id: entity.id,
      createdAt: entity.createdAt,
      workspaceId: entity.workspaceId ?? null,
      name: entity.name,
      objective: entity.objective,
      status: entity.status as StudyStatus,
      tags: entity.tags ?? null,
    });
  }
}
