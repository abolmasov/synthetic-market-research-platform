import { User, UserRole } from './user';

describe('User', () => {
  const baseInput = {
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    role: 'analyst' as UserRole,
  };

  describe('create', () => {
    it('should create a user with generated id and createdAt', () => {
      const user = User.create(baseInput);

      expect(user.id).toBeDefined();
      expect(user.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).toBe('hashed-password');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('analyst');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should generate unique ids for each user', () => {
      const user1 = User.create(baseInput);
      const user2 = User.create(baseInput);

      expect(user1.id).not.toBe(user2.id);
    });

    it('should accept admin role', () => {
      const user = User.create({ ...baseInput, role: 'admin' });
      expect(user.role).toBe('admin');
    });

    it('should accept viewer role', () => {
      const user = User.create({ ...baseInput, role: 'viewer' });
      expect(user.role).toBe('viewer');
    });
  });

  describe('rehydrate', () => {
    it('should reconstruct a user from stored props', () => {
      const date = new Date('2025-01-01');
      const user = User.rehydrate({
        id: 'fixed-id',
        workspaceId: 'workspace-id',
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Rehydrated',
        role: 'admin',
        createdAt: date,
      });

      expect(user.id).toBe('fixed-id');
      expect(user.workspaceId).toBe('workspace-id');
      expect(user.name).toBe('Rehydrated');
      expect(user.createdAt).toBe(date);
    });
  });
});
