import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY } from '../../common/tokens';
import { User, UserRole } from '../../domain/user/user';
import type { UserRepository } from '../../domain/user/user.repository';

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
};

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: RegisterInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = User.create({
      email: input.email,
      passwordHash,
      name: input.name,
      role: input.role ?? 'analyst',
    });

    return this.userRepository.create(user);
  }
}
