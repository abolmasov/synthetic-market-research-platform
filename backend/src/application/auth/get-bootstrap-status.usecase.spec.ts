import { ConfigService } from '@nestjs/config';
import type { UserRepository } from '../../domain/user/user.repository';
import { GetBootstrapStatusUseCase } from './get-bootstrap-status.usecase';

describe('GetBootstrapStatusUseCase', () => {
  let useCase: GetBootstrapStatusUseCase;
  let repoHasAnyAdmin: jest.MockedFunction<UserRepository['hasAnyAdmin']>;
  let configGet: jest.Mock;

  beforeEach(() => {
    repoHasAnyAdmin = jest.fn();
    configGet = jest.fn();

    const userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      hasAnyAdmin: repoHasAnyAdmin,
    } as unknown as UserRepository;

    const configService = {
      get: configGet,
    } as unknown as ConfigService;

    useCase = new GetBootstrapStatusUseCase(userRepository, configService);
  });

  it('returns status flags when no bootstrap config is set', async () => {
    repoHasAnyAdmin.mockResolvedValue(false);
    configGet.mockReturnValue(undefined);

    await expect(useCase.execute()).resolves.toEqual({
      hasAdminUser: false,
      bootstrapKeyConfigured: false,
      defaultAdminConfigured: false,
    });
  });

  it('returns status flags when bootstrap and default admin are configured', async () => {
    repoHasAnyAdmin.mockResolvedValue(true);
    configGet.mockImplementation((key: string) => {
      if (key === 'ADMIN_BOOTSTRAP_KEY') return 'key-123';
      if (key === 'ADMIN_DEFAULT_EMAIL') return 'admin@example.com';
      if (key === 'ADMIN_DEFAULT_PASSWORD') return 'strong-password';
      return undefined;
    });

    await expect(useCase.execute()).resolves.toEqual({
      hasAdminUser: true,
      bootstrapKeyConfigured: true,
      defaultAdminConfigured: true,
    });
  });
});
