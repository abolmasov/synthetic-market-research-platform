import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret-key';
        return undefined;
      }),
    } as unknown as ConfigService;
  });

  it('should be defined when JWT_SECRET is configured', () => {
    const strategy = new JwtStrategy(configService);
    expect(strategy).toBeDefined();
  });

  it('should throw error when JWT_SECRET is not configured', () => {
    const configWithoutSecret = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return undefined;
        return undefined;
      }),
    } as unknown as ConfigService;

    expect(() => new JwtStrategy(configWithoutSecret)).toThrow(
      'JWT_SECRET environment variable is required but not configured',
    );
  });

  it('should throw error when JWT_SECRET is empty string', () => {
    const configWithEmptySecret = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return '';
        return undefined;
      }),
    } as unknown as ConfigService;

    expect(() => new JwtStrategy(configWithEmptySecret)).toThrow(
      'JWT_SECRET environment variable is required but not configured',
    );
  });

  it('should validate payload and return user object', () => {
    const strategy = new JwtStrategy(configService);

    const payload = {
      sub: 'user-123',
      email: 'test@example.com',
      role: 'admin',
      workspaceId: 'ws-456',
    };

    const result = strategy.validate(payload);

    expect(result).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      role: 'admin',
      workspaceId: 'ws-456',
    });
  });

  it('should validate payload with viewer role', () => {
    const strategy = new JwtStrategy(configService);

    const payload = {
      sub: 'user-789',
      email: 'viewer@example.com',
      role: 'viewer',
      workspaceId: 'ws-123',
    };

    const result = strategy.validate(payload);

    expect(result).toEqual({
      id: 'user-789',
      email: 'viewer@example.com',
      role: 'viewer',
      workspaceId: 'ws-123',
    });
  });

  it('should validate payload with analyst role', () => {
    const strategy = new JwtStrategy(configService);

    const payload = {
      sub: 'user-analyst',
      email: 'analyst@example.com',
      role: 'analyst',
      workspaceId: 'ws-analyst',
    };

    const result = strategy.validate(payload);

    expect(result.role).toBe('analyst');
  });
});
