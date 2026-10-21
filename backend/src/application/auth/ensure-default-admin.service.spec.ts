import { ConfigService } from '@nestjs/config';
import { User } from '../../domain/user/user';
import type { UserRepository } from '../../domain/user/user.repository';
import { EnsureDefaultAdminService } from './ensure-default-admin.service';

describe('EnsureDefaultAdminService', () => {
  let service: EnsureDefaultAdminService;
  let configGet: jest.Mock;
  let repoCreate: jest.MockedFunction<UserRepository['create']>;
  let repoFindByEmail: jest.MockedFunction<UserRepository['findByEmail']>;

  beforeEach(() => {
    configGet = jest.fn();
    repoCreate = jest.fn();
    repoFindByEmail = jest.fn();

    const configService = {
      get: configGet,
    } as unknown as ConfigService;

    const userRepository = {
      create: repoCreate,
      findByEmail: repoFindByEmail,
      findById: jest.fn(),
      hasAnyAdmin: jest.fn(),
    } as unknown as UserRepository;

    service = new EnsureDefaultAdminService(configService, userRepository);
  });

  it('does nothing when default admin env vars are not set', async () => {
    configGet.mockReturnValue(undefined);

    await service.ensureDefaultAdmin();

    expect(repoFindByEmail).not.toHaveBeenCalled();
    expect(repoCreate).not.toHaveBeenCalled();
  });

  it('warns when only one env var is set', async () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'ADMIN_DEFAULT_EMAIL') {
        return 'admin@example.com';
      }
      return undefined;
    });
    const warnSpy = jest.spyOn(service['logger'], 'warn');

    await service.ensureDefaultAdmin();

    expect(warnSpy).toHaveBeenCalled();
    expect(repoFindByEmail).not.toHaveBeenCalled();
    expect(repoCreate).not.toHaveBeenCalled();
  });

  it('creates default admin when user does not exist', async () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'ADMIN_DEFAULT_EMAIL') return ' Admin@Example.com ';
      if (key === 'ADMIN_DEFAULT_PASSWORD') return 'very-secure-password';
      if (key === 'ADMIN_DEFAULT_NAME') return 'Default Admin';
      if (key === 'ADMIN_DEFAULT_WORKSPACE_ID') return 'workspace-123';
      return undefined;
    });
    repoFindByEmail.mockResolvedValue(null);
    repoCreate.mockImplementation((user: User) => Promise.resolve(user));

    await service.ensureDefaultAdmin();

    expect(repoFindByEmail).toHaveBeenCalledWith('admin@example.com');
    expect(repoCreate).toHaveBeenCalledTimes(1);

    const createdUser = repoCreate.mock.calls[0][0];
    expect(createdUser.email).toBe('admin@example.com');
    expect(createdUser.name).toBe('Default Admin');
    expect(createdUser.role).toBe('admin');
    expect(createdUser.workspaceId).toBe('workspace-123');
    expect(createdUser.passwordHash).not.toBe('very-secure-password');
  });

  it('skips creation when admin already exists', async () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'ADMIN_DEFAULT_EMAIL') return 'admin@example.com';
      if (key === 'ADMIN_DEFAULT_PASSWORD') return 'very-secure-password';
      return undefined;
    });
    repoFindByEmail.mockResolvedValue(
      User.create({
        email: 'admin@example.com',
        passwordHash: 'hashed',
        name: 'Admin',
        role: 'admin',
      }),
    );

    await service.ensureDefaultAdmin();

    expect(repoCreate).not.toHaveBeenCalled();
  });

  it('warns when existing user is not admin', async () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'ADMIN_DEFAULT_EMAIL') return 'analyst@example.com';
      if (key === 'ADMIN_DEFAULT_PASSWORD') return 'very-secure-password';
      return undefined;
    });
    repoFindByEmail.mockResolvedValue(
      User.create({
        email: 'analyst@example.com',
        passwordHash: 'hashed',
        name: 'Analyst',
        role: 'analyst',
      }),
    );
    const warnSpy = jest.spyOn(service['logger'], 'warn');

    await service.ensureDefaultAdmin();

    expect(warnSpy).toHaveBeenCalled();
    expect(repoCreate).not.toHaveBeenCalled();
  });
});
