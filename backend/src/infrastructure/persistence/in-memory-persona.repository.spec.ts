import { InMemoryPersonaRepository } from './in-memory-persona.repository';
import { Persona } from '../../domain/persona/persona';

function createTestPersona(overrides: Partial<{ name: string }> = {}): Persona {
  return Persona.create({
    name: overrides.name ?? 'Test',
    segment: 'Segment',
    motivations: ['m'],
    barriers: ['b'],
    trustChannel: 'channel',
    purchaseTriggers: ['t'],
    budgetRange: '$10-50',
  });
}

describe('InMemoryPersonaRepository – pagination', () => {
  let repo: InMemoryPersonaRepository;

  beforeEach(async () => {
    repo = new InMemoryPersonaRepository();
    // Seed 5 personas with sequential names
    for (let i = 1; i <= 5; i++) {
      await repo.create(createTestPersona({ name: `Persona ${i}` }));
    }
  });

  it('findAllPaginated returns first page', async () => {
    const result = await repo.findAllPaginated({ page: 1, limit: 2 });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(3);
  });

  it('findAllPaginated returns middle page', async () => {
    const result = await repo.findAllPaginated({ page: 2, limit: 2 });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.page).toBe(2);
  });

  it('findAllPaginated returns last partial page', async () => {
    const result = await repo.findAllPaginated({ page: 3, limit: 2 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(5);
  });

  it('findAllPaginated returns empty for out-of-range page', async () => {
    const result = await repo.findAllPaginated({ page: 10, limit: 2 });
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(5);
  });

  it('findAll still returns all items', async () => {
    const all = await repo.findAll();
    expect(all).toHaveLength(5);
  });
});
