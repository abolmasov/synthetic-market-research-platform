import { ConflictException } from '@nestjs/common';
import { RegisterUseCase } from './register.usecase';
import { User } from '../../domain/user/user';
import type { UserRepository } from '../../domain/user/user.repository';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      hasAnyAdmin: jest.fn(),
    };
    useCase = new RegisterUseCase(mockRepo);
  });

  it('should register a new user with analyst role by default', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.create.mockImplementation((user) => Promise.resolve(user));

    const result = await useCase.execute({
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
    });

    expect(result.email).toBe('new@example.com');
    expect(result.name).toBe('New User');
    expect(result.role).toBe('analyst');
    expect(mockRepo.findByEmail.mock.calls).toEqual([['new@example.com']]);
    expect(mockRepo.create.mock.calls).toHaveLength(1);
  });

  it('should register a user with specified role', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.create.mockImplementation((user) => Promise.resolve(user));

    const result = await useCase.execute({
      email: 'admin@example.com',
      password: 'password123',
      name: 'Admin User',
      role: 'admin',
    });

    expect(result.role).toBe('admin');
  });

  it('should throw ConflictException if email already exists', async () => {
    const existing = User.create({
      email: 'existing@example.com',
      passwordHash: 'hash',
      name: 'Existing',
      role: 'analyst',
    });
    mockRepo.findByEmail.mockResolvedValue(existing);

    await expect(
      useCase.execute({
        email: 'existing@example.com',
        password: 'password',
        name: 'Duplicate',
      }),
    ).rejects.toThrow(ConflictException);

    expect(mockRepo.create.mock.calls).toHaveLength(0);
  });

  it('should hash the password before storing', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.create.mockImplementation((user) => Promise.resolve(user));

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'plaintext',
      name: 'Test',
    });

    // Password should be hashed, not plaintext
    expect(result.passwordHash).not.toBe('plaintext');
    expect(result.passwordHash.length).toBeGreaterThan(0);
  });
});
