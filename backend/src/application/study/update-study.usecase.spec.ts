import { UpdateStudyUseCase } from './update-study.usecase';
import { Study } from '../../domain/study/study';
import type { StudyRepository } from '../../domain/study/study.repository';

function makeStudy(): Study {
  return Study.rehydrate({
    id: 'study-1',
    createdAt: new Date('2025-01-01'),
    name: 'Original Name',
    objective: 'Original objective',
    status: 'draft',
    tags: ['tag1'],
  });
}

describe('UpdateStudyUseCase', () => {
  let useCase: UpdateStudyUseCase;
  let mockRepo: jest.Mocked<StudyRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdateStudyUseCase(mockRepo);
  });

  it('should update study fields', async () => {
    const existing = makeStudy();
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.update.mockImplementation((study) => Promise.resolve(study));

    const result = await useCase.execute('study-1', {
      name: 'Updated Name',
      status: 'active',
    });

    expect(result).not.toBeNull();
    expect(result!.name).toBe('Updated Name');
    expect(result!.status).toBe('active');
    expect(result!.objective).toBe('Original objective');
  });

  it('should return null when study is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute('nonexistent', { name: 'New Name' });

    expect(result).toBeNull();
    expect(mockRepo.update.mock.calls).toHaveLength(0);
  });

  it('should preserve existing tags when not provided in update', async () => {
    const existing = makeStudy();
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.update.mockImplementation((study) => Promise.resolve(study));

    const result = await useCase.execute('study-1', { name: 'Changed' });

    expect(result!.tags).toEqual(['tag1']);
  });

  it('should overwrite tags with null when explicitly set', async () => {
    const existing = makeStudy();
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.update.mockImplementation((study) => Promise.resolve(study));

    const result = await useCase.execute('study-1', { tags: null });

    expect(result!.tags).toBeNull();
  });
});
