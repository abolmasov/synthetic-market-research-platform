import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonaRepository } from '../../../domain/persona/persona.repository';
import { Persona } from '../../../domain/persona/persona';
import { PersonaOrmEntity } from './persona.orm-entity';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../../common/pagination';
import { buildPaginatedResult } from '../../../common/pagination';

@Injectable()
export class TypeormPersonaRepository implements PersonaRepository {
  constructor(
    @InjectRepository(PersonaOrmEntity)
    private readonly repository: Repository<PersonaOrmEntity>,
  ) {}

  async create(persona: Persona): Promise<Persona> {
    const entity = this.repository.create({
      name: persona.name,
      segment: persona.segment,
      segmentId: persona.segmentId ?? null,
      motivations: persona.motivations,
      barriers: persona.barriers,
      trustChannel: persona.trustChannel,
      purchaseTriggers: persona.purchaseTriggers,
      budgetRange: persona.budgetRange,
      contextNotes: persona.contextNotes ?? null,
      age: persona.age ?? null,
      location: persona.location ?? null,
      income: persona.income ?? null,
      gender: persona.gender ?? null,
      occupation: persona.occupation ?? null,
      personality: persona.personality ?? null,
      healthProfile: persona.healthProfile ?? null,
      cognitiveProfile: persona.cognitiveProfile ?? null,
      decisionStyle: persona.decisionStyle ?? null,
      workspaceId: persona.workspaceId ?? null,
    });

    const saved = await this.repository.save(entity);
    return this.mapToDomain(saved);
  }

  private mapToDomain(record: PersonaOrmEntity): Persona {
    return Persona.rehydrate({
      id: record.id,
      createdAt: record.createdAt,
      name: record.name,
      segment: record.segment,
      segmentId: record.segmentId ?? null,
      motivations: record.motivations ?? [],
      barriers: record.barriers ?? [],
      trustChannel: record.trustChannel ?? '',
      purchaseTriggers: record.purchaseTriggers ?? [],
      budgetRange: record.budgetRange ?? '',
      contextNotes: record.contextNotes ?? null,
      age: record.age,
      location: record.location,
      income: record.income,
      gender: record.gender,
      occupation: record.occupation,
      personality: record.personality,
      healthProfile: record.healthProfile,
      cognitiveProfile: record.cognitiveProfile,
      decisionStyle: record.decisionStyle,
      workspaceId: record.workspaceId ?? null,
    });
  }

  async findAll(workspaceId?: string): Promise<Persona[]> {
    const records = await this.repository.find({
      where: workspaceId ? { workspaceId } : undefined,
      order: { createdAt: 'DESC' },
    });

    return records.map((record) => this.mapToDomain(record));
  }

  async findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<Persona>> {
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

  async findById(id: string, workspaceId?: string): Promise<Persona | null> {
    const record = await this.repository.findOne({
      where: workspaceId ? { id, workspaceId } : { id },
    });
    if (!record) {
      return null;
    }

    return this.mapToDomain(record);
  }

  async update(persona: Persona): Promise<Persona> {
    const entity = this.repository.create({
      id: persona.id,
      name: persona.name,
      segment: persona.segment,
      segmentId: persona.segmentId ?? null,
      motivations: persona.motivations,
      barriers: persona.barriers,
      trustChannel: persona.trustChannel,
      purchaseTriggers: persona.purchaseTriggers,
      budgetRange: persona.budgetRange,
      contextNotes: persona.contextNotes ?? null,
      age: persona.age ?? null,
      location: persona.location ?? null,
      income: persona.income ?? null,
      gender: persona.gender ?? null,
      occupation: persona.occupation ?? null,
      personality: persona.personality ?? null,
      healthProfile: persona.healthProfile ?? null,
      cognitiveProfile: persona.cognitiveProfile ?? null,
      decisionStyle: persona.decisionStyle ?? null,
      workspaceId: persona.workspaceId ?? null,
      createdAt: persona.createdAt,
    });

    const saved = await this.repository.save(entity);
    return this.mapToDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return Boolean(result.affected);
  }
}
