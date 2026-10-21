import { SeedController } from './seed.controller';
import type {
  ClearAllResult,
  SeedService,
} from '../../infrastructure/persistence/seed/seed.service';

describe('SeedController', () => {
  let controller: SeedController;
  let mockSeedService: jest.Mocked<SeedService>;

  beforeEach(() => {
    mockSeedService = {
      seedPersonas: jest.fn(),
      seedSegments: jest.fn(),
      seedHypotheses: jest.fn(),
      seedSimulations: jest.fn(),
      seedAll: jest.fn(),
      seedRagDocuments: jest.fn(),
      clearPersonas: jest.fn(),
      clearSegments: jest.fn(),
      clearHypotheses: jest.fn(),
      clearSimulations: jest.fn(),
      clearAll: jest.fn(),
    } as unknown as jest.Mocked<SeedService>;

    controller = new SeedController(mockSeedService);
  });

  it('seedPersonas delegates to seedService', async () => {
    mockSeedService.seedPersonas.mockResolvedValue({ seeded: 10, skipped: 0 });
    const result = await controller.seedPersonas({});
    expect(mockSeedService.seedPersonas.mock.calls).toHaveLength(1);
    expect(result).toEqual({ seeded: 10, skipped: 0 });
  });

  it('seedPersonas uses empty object when no body provided', async () => {
    mockSeedService.seedPersonas.mockResolvedValue({ seeded: 5, skipped: 0 });
    await controller.seedPersonas(undefined);
    expect(mockSeedService.seedPersonas.mock.calls[0][0]).toEqual({});
  });

  it('seedSegments delegates to seedService', async () => {
    mockSeedService.seedSegments.mockResolvedValue({ seeded: 3, skipped: 0 });
    const result = await controller.seedSegments({});
    expect(mockSeedService.seedSegments.mock.calls).toHaveLength(1);
    expect(result).toEqual({ seeded: 3, skipped: 0 });
  });

  it('clearAll delegates to seedService and returns result', async () => {
    const clearResult: ClearAllResult = {
      personas: { deleted: 10 },
      segments: { deleted: 3 },
      hypotheses: { deleted: 5 },
      simulations: { deleted: 2 },
      ragChunks: { deleted: 0 },
    };
    mockSeedService.clearAll.mockResolvedValue(clearResult);
    const result = await controller.clearAll();
    expect(result).toEqual(clearResult);
  });

  it('clearPersonas delegates to seedService', async () => {
    mockSeedService.clearPersonas.mockResolvedValue({ deleted: 7 });
    const result = await controller.clearPersonas();
    expect(result).toEqual({ deleted: 7 });
  });
});
