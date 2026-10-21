import { NotFoundException } from '@nestjs/common';
import { GeneratePersonasFromSegmentUseCase } from './generate-personas-from-segment.usecase';
import { Segment } from '../../domain/segment/segment';
import type { SegmentRepository } from '../../domain/segment/segment.repository';
import type { PersonaRepository } from '../../domain/persona/persona.repository';
import type { LlmProvider } from '../../domain/ai/llm.provider';
import { Persona } from '../../domain/persona/persona';

describe('GeneratePersonasFromSegmentUseCase', () => {
  let useCase: GeneratePersonasFromSegmentUseCase;
  let mockSegmentRepository: jest.Mocked<SegmentRepository>;
  let mockPersonaRepository: jest.Mocked<PersonaRepository>;
  let mockLlmProvider: jest.Mocked<LlmProvider>;

  const segment = Segment.rehydrate({
    id: 'segment-1',
    createdAt: new Date('2026-02-24T00:00:00.000Z'),
    workspaceId: 'workspace-1',
    name: 'Urban Tech Workers',
    description: 'Knowledge workers in large cities',
    demographicCriteria: {
      ageRange: { min: 25, max: 45 },
      incomeRange: { min: 40, max: 180 },
      locations: ['Kyiv, Ukraine'],
      genders: ['female', 'male'],
      occupations: ['Software Engineer', 'Product Manager'],
    },
    psychographicTraits: {
      motivations: ['health optimization', 'productivity'],
      barriers: ['price', 'skepticism'],
      values: ['evidence-based choices', 'time efficiency'],
      lifestyleAttributes: ['busy schedule'],
    },
    behavioralPatterns: {
      purchaseTriggers: ['peer recommendation', 'trial offer'],
      trustChannels: ['online communities'],
      decisionStyle: 'analytical',
      brandLoyalty: 'medium',
      priceAnchor: 60,
    },
  });

  beforeEach(() => {
    mockSegmentRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    mockPersonaRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    mockLlmProvider = {
      generateText: jest.fn(),
      generateJson: jest.fn(),
    };

    useCase = new GeneratePersonasFromSegmentUseCase(
      mockSegmentRepository,
      mockPersonaRepository,
      mockLlmProvider,
    );
  });

  it('creates personas from LLM JSON output', async () => {
    mockSegmentRepository.findById.mockResolvedValue(segment);
    mockLlmProvider.generateJson.mockResolvedValue({
      personas: [
        {
          name: 'Olena Kovalenko',
          age: 32,
          gender: 'female',
          location: 'Kyiv, Ukraine',
          income: 95,
          occupation: 'Software Engineer',
          motivations: ['productivity', 'better sleep'],
          barriers: ['price'],
          trustChannel: 'online communities',
          purchaseTriggers: ['trial offer'],
          budgetRange: '$40-80/month',
          contextNotes: 'Works long hours and values practical solutions.',
          personality: {
            openness: 70,
            conscientiousness: 82,
            extraversion: 45,
            agreeableness: 62,
            neuroticism: 38,
          },
          healthProfile: {
            insomniaSeverity: 5,
            anxietyLevel: 4,
            chronicPain: 1,
            currentSupplements: ['magnesium'],
          },
          cognitiveProfile: {
            lossAversion: 0.6,
            authorityBias: 0.5,
            socialProof: 0.7,
            statusQuoBias: 0.3,
            anchoring: 0.4,
            confirmationBias: 0.4,
          },
          decisionStyle: {
            system1Weight: 0.4,
            priceAnchor: 65,
            riskTolerance: 0.55,
          },
        },
      ],
    });
    mockPersonaRepository.create.mockImplementation((persona: Persona) =>
      Promise.resolve(
        Persona.rehydrate({
          id: 'persona-1',
          createdAt: new Date('2026-02-24T00:00:00.000Z'),
          name: persona.name,
          segment: persona.segment,
          segmentId: persona.segmentId,
          motivations: persona.motivations,
          barriers: persona.barriers,
          trustChannel: persona.trustChannel,
          purchaseTriggers: persona.purchaseTriggers,
          budgetRange: persona.budgetRange,
          contextNotes: persona.contextNotes,
          age: persona.age,
          location: persona.location,
          income: persona.income,
          gender: persona.gender,
          occupation: persona.occupation,
          personality: persona.personality,
          healthProfile: persona.healthProfile,
          cognitiveProfile: persona.cognitiveProfile,
          decisionStyle: persona.decisionStyle,
        }),
      ),
    );

    const result = await useCase.execute({
      segmentId: 'segment-1',
      count: 1,
      diversityLevel: 'medium',
    });

    expect(mockLlmProvider.generateJson.mock.calls).toHaveLength(1);
    expect(mockPersonaRepository.create.mock.calls).toHaveLength(1);
    expect(result.segmentId).toBe('segment-1');
    expect(result.segmentName).toBe('Urban Tech Workers');
    expect(result.generatedCount).toBe(1);
    expect(result.personas[0].id).toBe('persona-1');
  });

  it('throws when segment does not exist', async () => {
    mockSegmentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        segmentId: 'missing-segment',
        count: 3,
        diversityLevel: 'high',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(mockLlmProvider.generateJson.mock.calls).toHaveLength(0);
  });
});
