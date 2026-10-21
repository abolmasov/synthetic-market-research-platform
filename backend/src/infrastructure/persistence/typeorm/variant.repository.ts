import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VariantRepository } from '../../../domain/hypothesis/variant.repository';
import { Variant, VariantStatus } from '../../../domain/hypothesis/variant';
import { VariantOrmEntity } from './variant.orm-entity';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../../common/pagination';
import { buildPaginatedResult } from '../../../common/pagination';

@Injectable()
export class TypeormVariantRepository implements VariantRepository {
  constructor(
    @InjectRepository(VariantOrmEntity)
    private readonly repository: Repository<VariantOrmEntity>,
  ) {}

  async create(variant: Variant): Promise<Variant> {
    const entity = this.repository.create({
      hypothesisId: variant.hypothesisId,
      name: variant.name,
      description: variant.description ?? null,
      pricePoint: variant.pricePoint ?? null,
      positioning: variant.positioning ?? null,
      claims: variant.claims ?? null,
      changeSummary: variant.changeSummary,
      content: variant.content,
      version: variant.version,
      status: variant.status,
      expectedUplift: variant.expectedUplift ?? null,
      successMetric: variant.successMetric ?? null,
      risk: variant.risk ?? null,
      notes: variant.notes ?? null,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findAllByHypothesis(hypothesisId: string): Promise<Variant[]> {
    const records = await this.repository.find({
      where: { hypothesisId },
      order: { createdAt: 'DESC' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findAllByHypothesisPaginated(
    hypothesisId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Variant>> {
    const [records, total] = await this.repository.findAndCount({
      where: { hypothesisId },
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

  async findById(id: string): Promise<Variant | null> {
    const record = await this.repository.findOne({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async update(variant: Variant): Promise<Variant> {
    const entity = this.repository.create({
      id: variant.id,
      hypothesisId: variant.hypothesisId,
      name: variant.name,
      description: variant.description ?? null,
      pricePoint: variant.pricePoint ?? null,
      positioning: variant.positioning ?? null,
      claims: variant.claims ?? null,
      changeSummary: variant.changeSummary,
      content: variant.content,
      version: variant.version,
      status: variant.status,
      expectedUplift: variant.expectedUplift ?? null,
      successMetric: variant.successMetric ?? null,
      risk: variant.risk ?? null,
      notes: variant.notes ?? null,
      createdAt: variant.createdAt,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return Boolean(result.affected);
  }

  async getNextVersion(hypothesisId: string, name: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('variant')
      .select('MAX(variant.version)', 'max')
      .where('variant.hypothesisId = :hypothesisId', { hypothesisId })
      .andWhere('variant.name = :name', { name })
      .getRawOne<{ max: string | null }>();

    const max = result?.max ? Number(result.max) : 0;
    return max + 1;
  }

  private toDomain(entity: VariantOrmEntity): Variant {
    return Variant.rehydrate({
      id: entity.id,
      createdAt: entity.createdAt,
      hypothesisId: entity.hypothesisId,
      name: entity.name,
      description: entity.description ?? null,
      pricePoint: entity.pricePoint ?? null,
      positioning: entity.positioning ?? null,
      claims: entity.claims ?? null,
      changeSummary: entity.changeSummary,
      content: entity.content,
      version: entity.version,
      status: entity.status as VariantStatus,
      expectedUplift: entity.expectedUplift ?? null,
      successMetric: entity.successMetric ?? null,
      risk: entity.risk ?? null,
      notes: entity.notes ?? null,
    });
  }
}
