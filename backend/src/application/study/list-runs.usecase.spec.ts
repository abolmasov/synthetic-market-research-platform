import { ListRunsUseCase } from './list-runs.usecase';
import { GetRunUseCase } from './get-run.usecase';
import { CreateRunUseCase } from './create-run.usecase';
import { UpdateRunUseCase } from './update-run.usecase';
import { DeleteRunUseCase } from './delete-run.usecase';
import { Run } from '../../domain/study/run';
import type { RunRepository } from '../../domain/study/run.repository';
import { NotFoundException } from '@nestjs/common';

const makeRun = (id: string, hypothesisId = 'hyp-1'): Run =>
  Run.rehydrate({
    id,
    createdAt: new Date('2026-01-01'),
    hypothesisId,
    panelId: null,
    variantIds: ['var-1'],
    stage: 'H1',
    status: 'queued',
    config: {},
    startedAt: null,
    completedAt: null,
  });

const makeRepo = (): jest.Mocked<RunRepository> => ({
  create: jest.fn(),
  findAllByHypothesis: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('ListRunsUseCase', () => {
  let useCase: ListRunsUseCase;
  let mockRepo: jest.Mocked<RunRepository>;

  beforeEach(() => {
    mockRepo = makeRepo();
    useCase = new ListRunsUseCase(mockRepo);
  });

  it('should return all runs for a hypothesis', async () => {
    const runs = [makeRun('run-1'), makeRun('run-2')];
    mockRepo.findAllByHypothesis.mockResolvedValue(runs);

    const result = await useCase.execute('hyp-1');

    expect(result).toEqual(runs);
    expect(mockRepo.findAllByHypothesis.mock.calls[0][0]).toBe('hyp-1');
  });

  it('should return empty array when no runs exist for hypothesis', async () => {
    mockRepo.findAllByHypothesis.mockResolvedValue([]);

    const result = await useCase.execute('hyp-none');

    expect(result).toEqual([]);
  });
});

describe('GetRunUseCase', () => {
  let useCase: GetRunUseCase;
  let mockRepo: jest.Mocked<RunRepository>;

  beforeEach(() => {
    mockRepo = makeRepo();
    useCase = new GetRunUseCase(mockRepo);
  });

  it('should return the run when found', async () => {
    const run = makeRun('run-abc');
    mockRepo.findById.mockResolvedValue(run);

    const result = await useCase.execute('run-abc');

    expect(result).toBe(run);
    expect(mockRepo.findById.mock.calls[0][0]).toBe('run-abc');
  });

  it('should throw NotFoundException when run is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
    await expect(useCase.execute('missing')).rejects.toThrow(
      'Run with ID missing not found',
    );
  });
});

describe('CreateRunUseCase', () => {
  let useCase: CreateRunUseCase;
  let mockRepo: jest.Mocked<RunRepository>;

  beforeEach(() => {
    mockRepo = makeRepo();
    useCase = new CreateRunUseCase(mockRepo);
  });

  it('should create a run with provided fields', async () => {
    mockRepo.create.mockImplementation((run) => Promise.resolve(run));

    const result = await useCase.execute({
      hypothesisId: 'hyp-1',
      variantIds: ['var-1', 'var-2'],
      stage: 'H1',
      status: 'queued',
      config: { llmModel: 'gemini-1.5-pro' },
    });

    expect(result.hypothesisId).toBe('hyp-1');
    expect(result.variantIds).toEqual(['var-1', 'var-2']);
    expect(result.stage).toBe('H1');
    expect(result.status).toBe('queued');
    expect(result.config).toEqual({ llmModel: 'gemini-1.5-pro' });
    expect(mockRepo.create.mock.calls).toHaveLength(1);
  });

  it('should create a run with optional panelId', async () => {
    mockRepo.create.mockImplementation((run) => Promise.resolve(run));

    const result = await useCase.execute({
      hypothesisId: 'hyp-2',
      panelId: 'panel-abc',
      variantIds: [],
      stage: 'H2',
      status: 'running',
      config: {},
    });

    expect(result.panelId).toBe('panel-abc');
  });
});

describe('UpdateRunUseCase', () => {
  let useCase: UpdateRunUseCase;
  let mockRepo: jest.Mocked<RunRepository>;

  beforeEach(() => {
    mockRepo = makeRepo();
    useCase = new UpdateRunUseCase(mockRepo);
  });

  it('should update run status', async () => {
    const existing = makeRun('run-1');
    const updated = Run.rehydrate({
      id: 'run-1',
      createdAt: new Date('2026-01-01'),
      hypothesisId: 'hyp-1',
      panelId: null,
      variantIds: ['var-1'],
      stage: 'H1',
      status: 'running',
      config: {},
      startedAt: null,
      completedAt: null,
    });
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 'run-1', status: 'running' });

    expect(result.status).toBe('running');
    expect(mockRepo.findById.mock.calls[0][0]).toBe('run-1');
    expect(mockRepo.update.mock.calls).toHaveLength(1);
  });

  it('should throw NotFoundException when run not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should preserve existing fields when not provided in update', async () => {
    const existing = makeRun('run-1');
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.update.mockImplementation((run) => Promise.resolve(run));

    const result = await useCase.execute({ id: 'run-1', status: 'completed' });

    expect(result.hypothesisId).toBe('hyp-1');
    expect(result.variantIds).toEqual(['var-1']);
    expect(result.stage).toBe('H1');
  });
});

describe('DeleteRunUseCase', () => {
  let useCase: DeleteRunUseCase;
  let mockRepo: jest.Mocked<RunRepository>;

  beforeEach(() => {
    mockRepo = makeRepo();
    useCase = new DeleteRunUseCase(mockRepo);
  });

  it('should delete a run successfully', async () => {
    mockRepo.delete.mockResolvedValue(true);

    await expect(useCase.execute('run-1')).resolves.toBeUndefined();
    expect(mockRepo.delete.mock.calls[0][0]).toBe('run-1');
  });

  it('should throw NotFoundException when run does not exist', async () => {
    mockRepo.delete.mockResolvedValue(false);

    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
    await expect(useCase.execute('missing')).rejects.toThrow(
      'Run with ID missing not found',
    );
  });
});
