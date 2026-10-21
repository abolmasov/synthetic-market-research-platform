import { CreateStudyUseCase } from './create-study.usecase';
import type { StudyRepository } from '../../domain/study/study.repository';

describe('CreateStudyUseCase', () => {
  let useCase: CreateStudyUseCase;
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
    useCase = new CreateStudyUseCase(mockRepo);
  });

  it('should create a study with default draft status', async () => {
    mockRepo.create.mockImplementation((study) => Promise.resolve(study));

    const result = await useCase.execute({
      name: 'Sleep Market Study',
      objective: 'Understand consumer willingness to pay for sleep aids',
    });

    expect(result.name).toBe('Sleep Market Study');
    expect(result.objective).toBe(
      'Understand consumer willingness to pay for sleep aids',
    );
    expect(result.status).toBe('draft');
    expect(result.tags).toBeNull();
    expect(mockRepo.create.mock.calls).toHaveLength(1);
  });

  it('should create a study with explicit status and tags', async () => {
    mockRepo.create.mockImplementation((study) => Promise.resolve(study));

    const result = await useCase.execute({
      name: 'Active Study',
      objective: 'Test objective',
      status: 'active',
      tags: ['sleep', 'wellness'],
    });

    expect(result.status).toBe('active');
    expect(result.tags).toEqual(['sleep', 'wellness']);
  });

  it('should store null tags when not provided', async () => {
    mockRepo.create.mockImplementation((study) => Promise.resolve(study));

    const result = await useCase.execute({
      name: 'No Tags Study',
      objective: 'Some objective',
    });

    expect(result.tags).toBeNull();
  });
});
