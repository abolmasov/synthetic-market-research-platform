import { InMemoryStudyRepository } from './in-memory-study.repository';
import { Study } from '../../domain/study/study';

function createTestStudy(
  overrides: Partial<{
    name: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
  }> = {},
): Study {
  return Study.create({
    name: overrides.name ?? 'Test Study',
    objective: 'A test objective',
    status: overrides.status ?? 'draft',
    tags: null,
  });
}

describe('InMemoryStudyRepository', () => {
  let repo: InMemoryStudyRepository;

  beforeEach(async () => {
    repo = new InMemoryStudyRepository();
    for (let i = 1; i <= 4; i++) {
      await repo.create(createTestStudy({ name: `Study ${i}` }));
    }
  });

  it('create assigns id and createdAt', async () => {
    const study = await repo.create(createTestStudy({ name: 'New Study' }));
    expect(study.id).toBeDefined();
    expect(study.createdAt).toBeInstanceOf(Date);
    expect(study.name).toBe('New Study');
  });

  it('findAll returns all studies sorted newest first', async () => {
    const all = await repo.findAll();
    expect(all).toHaveLength(4);
  });

  it('findAllPaginated returns correct page', async () => {
    const result = await repo.findAllPaginated({ page: 1, limit: 2 });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(4);
    expect(result.totalPages).toBe(2);
  });

  it('findAllPaginated returns second page', async () => {
    const result = await repo.findAllPaginated({ page: 2, limit: 2 });
    expect(result.data).toHaveLength(2);
    expect(result.page).toBe(2);
  });

  it('findById returns the study with matching id', async () => {
    const created = await repo.create(createTestStudy({ name: 'Findable' }));
    const found = await repo.findById(created.id!);
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Findable');
  });

  it('findById returns null for unknown id', async () => {
    const found = await repo.findById('nonexistent-id');
    expect(found).toBeNull();
  });

  it('update persists changes', async () => {
    const created = await repo.create(createTestStudy({ name: 'Before' }));
    const updated = Study.rehydrate({
      id: created.id!,
      createdAt: created.createdAt!,
      name: 'After',
      objective: 'A test objective',
      status: 'active',
      tags: ['new-tag'],
    });

    const result = await repo.update(updated);
    expect(result.name).toBe('After');
    expect(result.status).toBe('active');

    const fetched = await repo.findById(created.id!);
    expect(fetched!.name).toBe('After');
  });

  it('delete removes the study and returns true', async () => {
    const created = await repo.create(createTestStudy());
    const deleted = await repo.delete(created.id!);
    expect(deleted).toBe(true);
    expect(await repo.findById(created.id!)).toBeNull();
  });

  it('delete returns false for unknown id', async () => {
    const deleted = await repo.delete('nonexistent');
    expect(deleted).toBe(false);
  });
});
