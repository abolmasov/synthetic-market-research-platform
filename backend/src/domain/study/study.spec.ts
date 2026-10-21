import { Study } from './study';

describe('Study', () => {
  describe('create', () => {
    it('should create a study with required fields and default status', () => {
      const study = Study.create({
        name: 'Market Research 2025',
        objective: 'Understand consumer preferences',
        status: 'draft',
      });

      expect(study.name).toBe('Market Research 2025');
      expect(study.objective).toBe('Understand consumer preferences');
      expect(study.status).toBe('draft');
      expect(study.id).toBeUndefined();
      expect(study.createdAt).toBeUndefined();
      expect(study.tags).toBeUndefined();
    });

    it('should create a study with tags', () => {
      const study = Study.create({
        name: 'Tagged Study',
        objective: 'Objective',
        status: 'active',
        tags: ['market', 'wellness'],
      });

      expect(study.tags).toEqual(['market', 'wellness']);
      expect(study.status).toBe('active');
    });

    it('should create a study with null tags', () => {
      const study = Study.create({
        name: 'No Tags',
        objective: 'Objective',
        status: 'draft',
        tags: null,
      });

      expect(study.tags).toBeNull();
    });
  });

  describe('rehydrate', () => {
    it('should reconstruct a study from persisted data', () => {
      const date = new Date('2025-03-15T10:00:00Z');
      const study = Study.rehydrate({
        id: 'study-uuid-123',
        createdAt: date,
        name: 'Rehydrated Study',
        objective: 'Persisted objective',
        status: 'completed',
        tags: ['research'],
      });

      expect(study.id).toBe('study-uuid-123');
      expect(study.createdAt).toBe(date);
      expect(study.name).toBe('Rehydrated Study');
      expect(study.objective).toBe('Persisted objective');
      expect(study.status).toBe('completed');
      expect(study.tags).toEqual(['research']);
    });

    it('should rehydrate with archived status', () => {
      const study = Study.rehydrate({
        id: 'study-456',
        createdAt: new Date(),
        name: 'Old Study',
        objective: 'Archived',
        status: 'archived',
        tags: null,
      });

      expect(study.status).toBe('archived');
    });
  });
});
