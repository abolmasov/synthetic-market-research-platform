import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtifactRepository } from '../../../domain/study/artifact.repository';
import {
  Artifact,
  ArtifactStage,
  ArtifactType,
} from '../../../domain/study/artifact';
import { ArtifactOrmEntity } from './artifact.orm-entity';

@Injectable()
export class TypeormArtifactRepository implements ArtifactRepository {
  constructor(
    @InjectRepository(ArtifactOrmEntity)
    private readonly repository: Repository<ArtifactOrmEntity>,
  ) {}

  async create(artifact: Artifact): Promise<Artifact> {
    const entity = this.repository.create({
      runId: artifact.runId,
      stage: artifact.stage,
      type: artifact.type,
      payload: artifact.payload,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findAllByRun(runId: string): Promise<Artifact[]> {
    const records = await this.repository.find({
      where: { runId },
      order: { createdAt: 'DESC' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Artifact | null> {
    const record = await this.repository.findOne({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async update(artifact: Artifact): Promise<Artifact> {
    const entity = this.repository.create({
      id: artifact.id,
      runId: artifact.runId,
      stage: artifact.stage,
      type: artifact.type,
      payload: artifact.payload,
      createdAt: artifact.createdAt,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return Boolean(result.affected);
  }

  private toDomain(entity: ArtifactOrmEntity): Artifact {
    return Artifact.rehydrate({
      id: entity.id,
      createdAt: entity.createdAt,
      runId: entity.runId,
      stage: entity.stage as ArtifactStage,
      type: entity.type as ArtifactType,
      payload: entity.payload,
    });
  }
}
