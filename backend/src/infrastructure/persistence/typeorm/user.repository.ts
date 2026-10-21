import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../../domain/user/user';
import type { UserRepository } from '../../../domain/user/user.repository';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class TypeormUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async create(user: User): Promise<User> {
    const entity = this.repo.create({
      id: user.id,
      workspaceId: user.workspaceId,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  hasAnyAdmin(): Promise<boolean> {
    return this.repo.exists({ where: { role: 'admin' } });
  }

  private toDomain(entity: UserOrmEntity): User {
    return User.rehydrate({
      id: entity.id,
      workspaceId: entity.workspaceId,
      email: entity.email,
      passwordHash: entity.passwordHash,
      name: entity.name,
      role: entity.role as UserRole,
      createdAt: entity.createdAt,
    });
  }
}
