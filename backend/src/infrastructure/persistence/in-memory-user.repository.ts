import { Injectable } from '@nestjs/common';
import { User } from '../../domain/user/user';
import type { UserRepository } from '../../domain/user/user.repository';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly users: User[] = [];

  create(user: User): Promise<User> {
    this.users.push(user);
    return Promise.resolve(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.email === email) ?? null);
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.id === id) ?? null);
  }

  hasAnyAdmin(): Promise<boolean> {
    return Promise.resolve(this.users.some((u) => u.role === 'admin'));
  }
}
