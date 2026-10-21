import { Persona } from './persona';

describe('Persona', () => {
  const minimalInput = {
    name: 'Test Persona',
    segment: 'Tech Workers',
    segmentId: null,
    motivations: ['efficiency'],
    barriers: ['cost'],
    trustChannel: 'tech blogs',
    purchaseTriggers: ['sale'],
    budgetRange: '$50-100/month',
    contextNotes: null,
    age: null,
    location: null,
    income: null,
    gender: null,
    occupation: null,
    personality: null,
    healthProfile: null,
    cognitiveProfile: null,
    decisionStyle: null,
  };

  describe('create', () => {
    it('should create a persona with minimal fields', () => {
      const persona = Persona.create(minimalInput);

      expect(persona.name).toBe('Test Persona');
      expect(persona.segment).toBe('Tech Workers');
      expect(persona.motivations).toEqual(['efficiency']);
      expect(persona.barriers).toEqual(['cost']);
      expect(persona.trustChannel).toBe('tech blogs');
      expect(persona.budgetRange).toBe('$50-100/month');
    });

    it('should create a persona with full psychological profile', () => {
      const persona = Persona.create({
        ...minimalInput,
        age: 32,
        location: 'Kyiv, Ukraine',
        income: 80,
        gender: 'female',
        occupation: 'Software Developer',
        personality: {
          openness: 75,
          conscientiousness: 85,
          extraversion: 60,
          agreeableness: 55,
          neuroticism: 45,
        },
        healthProfile: {
          insomniaSeverity: 3,
          anxietyLevel: 4,
          chronicPain: 1,
          currentSupplements: ['vitamin D'],
        },
        cognitiveProfile: {
          lossAversion: 0.4,
          authorityBias: 0.7,
          socialProof: 0.6,
          statusQuoBias: 0.3,
          anchoring: 0.5,
          confirmationBias: 0.4,
        },
        decisionStyle: {
          system1Weight: 0.3,
          priceAnchor: 75,
          riskTolerance: 0.6,
        },
      });

      expect(persona.age).toBe(32);
      expect(persona.gender).toBe('female');
      expect(persona.personality?.openness).toBe(75);
      expect(persona.cognitiveProfile?.lossAversion).toBe(0.4);
      expect(persona.decisionStyle?.riskTolerance).toBe(0.6);
      expect(persona.healthProfile?.currentSupplements).toEqual(['vitamin D']);
    });
  });

  describe('rehydrate', () => {
    it('should reconstruct a persona from stored data', () => {
      const date = new Date('2025-06-01');
      const persona = Persona.rehydrate({
        id: 'persona-123',
        createdAt: date,
        ...minimalInput,
      });

      expect(persona.id).toBe('persona-123');
      expect(persona.createdAt).toBe(date);
      expect(persona.name).toBe('Test Persona');
    });
  });
});
