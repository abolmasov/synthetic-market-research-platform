import { RunSimulationUseCase } from './run-simulation.usecase';
import { Hypothesis } from '../../domain/hypothesis/hypothesis';
import { Persona } from '../../domain/persona/persona';
import type { PersonaRepository } from '../../domain/persona/persona.repository';
import type { HypothesisRepository } from '../../domain/hypothesis/hypothesis.repository';
import type { SimulationRepository } from '../../domain/simulation/simulation.repository';
import type { RagSourceProvider } from '../../domain/rag/rag-source.provider';
import type { LlmProvider } from '../../domain/ai/llm.provider';

describe('RunSimulationUseCase', () => {
  let useCase: RunSimulationUseCase;
  let mockPersonaRepo: jest.Mocked<PersonaRepository>;
  let mockHypothesisRepo: jest.Mocked<HypothesisRepository>;
  let mockSimRepo: jest.Mocked<SimulationRepository>;
  let mockRag: jest.Mocked<RagSourceProvider>;
  let mockLlm: jest.Mocked<LlmProvider>;

  const testPersona = Persona.rehydrate({
    id: 'p1',
    createdAt: new Date(),
    name: 'Alice',
    segment: 'Tech Workers',
    segmentId: null,
    motivations: ['efficiency'],
    barriers: ['cost'],
    trustChannel: 'tech blogs',
    purchaseTriggers: ['sale'],
    budgetRange: '$50-100/month',
    contextNotes: 'Works in tech',
    age: 30,
    location: 'San Francisco',
    income: 120,
    gender: 'female',
    occupation: 'Engineer',
    personality: {
      openness: 70,
      conscientiousness: 80,
      extraversion: 50,
      agreeableness: 60,
      neuroticism: 40,
    },
    healthProfile: {
      insomniaSeverity: 5,
      anxietyLevel: 3,
      chronicPain: 0,
      currentSupplements: [],
    },
    cognitiveProfile: {
      lossAversion: 0.5,
      authorityBias: 0.6,
      socialProof: 0.7,
      statusQuoBias: 0.3,
      anchoring: 0.4,
      confirmationBias: 0.3,
    },
    decisionStyle: {
      system1Weight: 0.4,
      priceAnchor: 50,
      riskTolerance: 0.6,
    },
  });

  beforeEach(() => {
    mockPersonaRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    mockSimRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };
    mockHypothesisRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findAllByStudy: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    mockRag = {
      query: jest.fn(),
    };
    mockLlm = {
      generateText: jest.fn(),
      generateJson: jest.fn(),
    };

    useCase = new RunSimulationUseCase(
      mockPersonaRepo,
      mockHypothesisRepo,
      mockSimRepo,
      mockRag,
      mockLlm,
    );
  });

  it('should run simulation and return completed result', async () => {
    mockPersonaRepo.findAll.mockResolvedValue([testPersona]);
    mockRag.query.mockResolvedValue([
      {
        title: 'Market Report',
        url: 'https://example.com',
        snippet: 'Growing market',
        relevanceScore: 0.9,
      },
    ]);
    mockLlm.generateText.mockResolvedValue(
      'This looks interesting, I might try it.',
    );
    mockLlm.generateJson.mockResolvedValue({
      decision: 'accept',
      confidence: 0.8,
      rational_thought: 'Fits my budget and needs',
      key_reasons: ['Good price', 'Solves my problem'],
    });
    mockSimRepo.create.mockImplementation((sim) => Promise.resolve(sim));

    const result = await useCase.execute({
      hypothesis: 'Users will pay $49/month for a sleep supplement',
    });

    expect(result.status).toBe('completed');
    expect(result.hypothesis).toBe(
      'Users will pay $49/month for a sleep supplement',
    );
    expect(result.decisions).toHaveLength(1);
    expect(result.decisions[0].decision).toBe('accept');
    expect(result.decisions[0].confidence).toBe(0.8);
    expect(result.decisions[0].name).toBe('Alice');
    expect(result.summary.totalPersonas).toBe(1);
    expect(result.summary.acceptanceRate).toBe(1);
    expect(mockSimRepo.create.mock.calls).toHaveLength(1);
  });

  it('should filter personas by personaIds when provided', async () => {
    const persona2 = Persona.rehydrate({
      id: 'p2',
      createdAt: new Date(),
      name: 'Bob',
      segment: testPersona.segment,
      segmentId: testPersona.segmentId,
      motivations: testPersona.motivations,
      barriers: testPersona.barriers,
      trustChannel: testPersona.trustChannel,
      purchaseTriggers: testPersona.purchaseTriggers,
      budgetRange: testPersona.budgetRange,
      contextNotes: testPersona.contextNotes,
      age: testPersona.age,
      location: testPersona.location,
      income: testPersona.income,
      gender: testPersona.gender,
      occupation: testPersona.occupation,
      personality: testPersona.personality,
      healthProfile: testPersona.healthProfile,
      cognitiveProfile: testPersona.cognitiveProfile,
      decisionStyle: testPersona.decisionStyle,
    });
    mockPersonaRepo.findAll.mockResolvedValue([testPersona, persona2]);
    mockRag.query.mockResolvedValue([]);
    mockLlm.generateText.mockResolvedValue('Hmm');
    mockLlm.generateJson.mockResolvedValue({
      decision: 'reject',
      confidence: 0.7,
      rational_thought: 'Too expensive',
      key_reasons: ['Over budget'],
    });
    mockSimRepo.create.mockImplementation((sim) => Promise.resolve(sim));

    const result = await useCase.execute({
      hypothesis: 'Test hypothesis',
      personaIds: ['p1'],
    });

    expect(result.decisions).toHaveLength(1);
    expect(result.decisions[0].personaId).toBe('p1');
  });

  it('should handle LLM errors gracefully', async () => {
    mockPersonaRepo.findAll.mockResolvedValue([testPersona]);
    mockRag.query.mockResolvedValue([]);
    mockLlm.generateText.mockRejectedValue(new Error('LLM timeout'));
    mockSimRepo.create.mockImplementation((sim) => Promise.resolve(sim));

    const result = await useCase.execute({
      hypothesis: 'Test hypothesis',
    });

    expect(result.decisions).toHaveLength(1);
    expect(result.decisions[0].decision).toBe('maybe');
    expect(result.decisions[0].confidence).toBe(0.1);
    expect(result.decisions[0].reasons).toEqual(['Simulation failed']);
  });

  it('should calculate correct summary statistics', async () => {
    const persona2 = Persona.rehydrate({
      id: 'p2',
      createdAt: new Date(),
      name: 'Bob',
      segment: 'Health',
      segmentId: null,
      motivations: [],
      barriers: ['price'],
      trustChannel: 'friends',
      purchaseTriggers: [],
      budgetRange: '$20-40/month',
      contextNotes: null,
      age: 45,
      location: null,
      income: 60,
      gender: 'male',
      occupation: null,
      personality: null,
      healthProfile: null,
      cognitiveProfile: null,
      decisionStyle: null,
    });

    mockPersonaRepo.findAll.mockResolvedValue([testPersona, persona2]);
    mockRag.query.mockResolvedValue([]);
    mockLlm.generateText.mockResolvedValue('Gut feeling response');
    mockLlm.generateJson
      .mockResolvedValueOnce({
        decision: 'accept',
        confidence: 0.9,
        rational_thought: 'Worth it',
        key_reasons: ['Good deal'],
      })
      .mockResolvedValueOnce({
        decision: 'reject',
        confidence: 0.8,
        rational_thought: 'Too expensive for me',
        key_reasons: ['Over budget', 'Not convinced'],
      });
    mockSimRepo.create.mockImplementation((sim) => Promise.resolve(sim));

    const result = await useCase.execute({
      hypothesis: 'Test hypothesis',
    });

    expect(result.summary.totalPersonas).toBe(2);
    expect(result.summary.acceptanceRate).toBe(0.5);
    expect(result.summary.rejectionRate).toBe(0.5);
    expect(result.summary.maybeRate).toBe(0);
  });

  it('should collect top objections from rejections', async () => {
    mockPersonaRepo.findAll.mockResolvedValue([testPersona]);
    mockRag.query.mockResolvedValue([]);
    mockLlm.generateText.mockResolvedValue('No thanks');
    mockLlm.generateJson.mockResolvedValue({
      decision: 'reject',
      confidence: 0.9,
      rational_thought: 'Not for me',
      key_reasons: ['Too expensive', 'No clinical proof'],
    });
    mockSimRepo.create.mockImplementation((sim) => Promise.resolve(sim));

    const result = await useCase.execute({
      hypothesis: 'Test hypothesis',
    });

    expect(result.objections).toContain('Too expensive');
    expect(result.objections).toContain('No clinical proof');
  });

  it('should iterate for uncertain decisions up to maxIterations', async () => {
    mockPersonaRepo.findAll.mockResolvedValue([testPersona]);
    mockRag.query.mockResolvedValue([]);
    mockLlm.generateText.mockResolvedValue('I am not sure yet.');
    mockLlm.generateJson
      .mockResolvedValueOnce({
        decision: 'maybe',
        confidence: 0.25,
        rational_thought: 'I need more proof.',
        key_reasons: ['Unclear value'],
      })
      .mockResolvedValueOnce({
        decision: 'maybe',
        confidence: 0.4,
        rational_thought: 'Still uncertain due to price.',
        key_reasons: ['Price concern'],
      })
      .mockResolvedValueOnce({
        decision: 'accept',
        confidence: 0.76,
        rational_thought: 'Now it looks worthwhile.',
        key_reasons: ['Better fit for my needs'],
      });
    mockSimRepo.create.mockImplementation((sim) => Promise.resolve(sim));

    const result = await useCase.execute({
      hypothesis: 'Test hypothesis',
      maxIterations: 3,
    });

    expect(mockLlm.generateJson.mock.calls).toHaveLength(3);
    expect(result.decisions).toHaveLength(1);
    expect(result.decisions[0].decision).toBe('accept');
    expect(result.decisions[0].loopDepth).toBe(3);
  });

  it('should evaluate and persist hypothesis decision when verification fields exist', async () => {
    mockPersonaRepo.findAll.mockResolvedValue([testPersona]);
    mockRag.query.mockResolvedValue([]);
    mockLlm.generateText.mockResolvedValue('Looks useful to me.');
    mockLlm.generateJson.mockResolvedValue({
      decision: 'accept',
      confidence: 0.9,
      rational_thought: 'This solves a real pain point for me.',
      key_reasons: ['Strong value proposition'],
    });
    mockSimRepo.create.mockImplementation((sim) => Promise.resolve(sim));

    const hypothesis = Hypothesis.rehydrate({
      id: 'h1',
      createdAt: new Date(),
      studyId: null,
      workspaceId: null,
      stage: 'H1',
      title: 'Test verification',
      statement: 'A stronger value prop will lift conversion',
      status: 'ready',
      successCriteria: null,
      protocolId: null,
      primaryMetric: 'acceptanceRate',
      primaryMetricDirection: 'at_least',
      primaryMetricThreshold: 0.6,
      guardrails: [],
      falsificationRule: null,
      sampleSize: 1,
      testDurationDays: null,
      decisionOutcome: 'pending',
      decisionReason: null,
      lastEvaluatedAt: null,
      notes: null,
    });
    mockHypothesisRepo.findById.mockResolvedValue(hypothesis);
    mockHypothesisRepo.update.mockImplementation((h) => Promise.resolve(h));

    const result = await useCase.execute({
      hypothesis: 'People will buy at $39/month',
      hypothesisId: 'h1',
    });

    expect(mockHypothesisRepo.update.mock.calls).toHaveLength(1);
    expect(
      result.topSignals.some((signal) => signal.includes('Decision: PASS')),
    ).toBe(true);
  });
});
