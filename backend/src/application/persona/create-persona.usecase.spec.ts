import { CreatePersonaUseCase } from './create-persona.usecase';
import { Persona } from '../../domain/persona/persona';
import type { PersonaRepository } from '../../domain/persona/persona.repository';

describe('CreatePersonaUseCase', () => {
  let useCase: CreatePersonaUseCase;
  let mockRepo: jest.Mocked<PersonaRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreatePersonaUseCase(mockRepo);
  });

  it('should create a persona with required fields', async () => {
    mockRepo.create.mockImplementation((persona) => Promise.resolve(persona));

    const result = await useCase.execute({
      name: 'Test Persona',
      segment: 'Tech Workers',
      motivations: ['efficiency'],
      barriers: ['cost'],
      trustChannel: 'tech blogs',
      purchaseTriggers: ['sale'],
      budgetRange: '$50-100/month',
    });

    expect(result).toBeInstanceOf(Persona);
    expect(result.name).toBe('Test Persona');
    expect(result.segment).toBe('Tech Workers');
    expect(mockRepo.create.mock.calls).toHaveLength(1);
  });

  it('should default optional fields to null', async () => {
    mockRepo.create.mockImplementation((persona) => Promise.resolve(persona));

    const result = await useCase.execute({
      name: 'Minimal',
      segment: 'General',
      motivations: [],
      barriers: [],
      trustChannel: 'word of mouth',
      purchaseTriggers: [],
      budgetRange: '$0-50/month',
    });

    expect(result.contextNotes).toBeNull();
    expect(result.age).toBeNull();
    expect(result.gender).toBeNull();
    expect(result.personality).toBeNull();
    expect(result.cognitiveProfile).toBeNull();
  });

  it('should pass extended profiles when provided', async () => {
    mockRepo.create.mockImplementation((persona) => Promise.resolve(persona));

    const result = await useCase.execute({
      name: 'Full Profile',
      segment: 'Health',
      motivations: ['wellness'],
      barriers: ['skepticism'],
      trustChannel: 'doctor recommendations',
      purchaseTriggers: ['clinical study'],
      budgetRange: '$30-60/month',
      age: 45,
      gender: 'male',
      personality: {
        openness: 60,
        conscientiousness: 70,
        extraversion: 40,
        agreeableness: 80,
        neuroticism: 30,
      },
      cognitiveProfile: {
        lossAversion: 0.7,
        authorityBias: 0.8,
        socialProof: 0.5,
        statusQuoBias: 0.6,
        anchoring: 0.4,
        confirmationBias: 0.3,
      },
      decisionStyle: {
        system1Weight: 0.4,
        priceAnchor: 50,
        riskTolerance: 0.3,
      },
    });

    expect(result.age).toBe(45);
    expect(result.personality?.openness).toBe(60);
    expect(result.cognitiveProfile?.authorityBias).toBe(0.8);
    expect(result.decisionStyle?.priceAnchor).toBe(50);
  });
});
