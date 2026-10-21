import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUseCase } from './login.usecase';
import { User } from '../../domain/user/user';
import type { UserRepository } from '../../domain/user/user.repository';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockRepo: jest.Mocked<UserRepository>;
  let mockJwt: jest.Mocked<JwtService>;
  let testUser: User;

  beforeEach(async () => {
    const hash = await bcrypt.hash('correctpassword', 12);
    testUser = User.rehydrate({
      id: 'user-1',
      workspaceId: 'workspace-1',
      email: 'user@example.com',
      passwordHash: hash,
      name: 'Test User',
      role: 'analyst',
      createdAt: new Date(),
    });

    mockRepo = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      hasAnyAdmin: jest.fn(),
    };
    mockJwt = {
      sign: jest.fn().mockReturnValue('jwt-token-123'),
    } as unknown as jest.Mocked<JwtService>;

    useCase = new LoginUseCase(mockRepo, mockJwt);
  });

  it('should return access token and user on valid credentials', async () => {
    mockRepo.findByEmail.mockResolvedValue(testUser);

    const result = await useCase.execute({
      email: 'user@example.com',
      password: 'correctpassword',
    });

    expect(result.accessToken).toBe('jwt-token-123');
    expect(result.user.id).toBe('user-1');
    expect(result.user.email).toBe('user@example.com');
    expect(result.user.name).toBe('Test User');
    expect(result.user.role).toBe('analyst');
    expect(mockJwt.sign.mock.calls).toHaveLength(1);
    expect(mockJwt.sign.mock.calls[0]).toEqual([
      {
        sub: 'user-1',
        email: 'user@example.com',
        role: 'analyst',
        workspaceId: 'workspace-1',
      },
    ]);
  });

  it('should throw UnauthorizedException for non-existent email', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'nonexistent@example.com',
        password: 'any',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for wrong password', async () => {
    mockRepo.findByEmail.mockResolvedValue(testUser);

    await expect(
      useCase.execute({
        email: 'user@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
