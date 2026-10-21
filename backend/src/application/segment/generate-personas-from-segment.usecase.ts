import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { SegmentRepository } from '../../domain/segment/segment.repository';
import type { PersonaRepository } from '../../domain/persona/persona.repository';
import type { LlmProvider } from '../../domain/ai/llm.provider';
import {
  SEGMENT_REPOSITORY,
  PERSONA_REPOSITORY,
  LLM_PROVIDER,
} from '../../common/tokens';
import { Segment } from '../../domain/segment/segment';
import { Persona } from '../../domain/persona/persona';

export type GeneratePersonasInput = {
  segmentId: string;
  count: number;
  diversityLevel: 'low' | 'medium' | 'high';
};

export type GeneratePersonasOutput = {
  segmentId: string;
  segmentName: string;
  generatedCount: number;
  personas: Persona[];
};

type GeneratedPersonaSchema = {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  location: string;
  income: number;
  occupation: string;
  motivations: string[];
  barriers: string[];
  trustChannel: string;
  purchaseTriggers: string[];
  budgetRange: string;
  contextNotes: string;
  personality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  healthProfile: {
    insomniaSeverity: number;
    anxietyLevel: number;
    chronicPain: number;
    currentSupplements: string[];
  };
  cognitiveProfile: {
    lossAversion: number;
    authorityBias: number;
    socialProof: number;
    statusQuoBias: number;
    anchoring: number;
    confirmationBias: number;
  };
  decisionStyle: {
    system1Weight: number;
    priceAnchor: number;
    riskTolerance: number;
  };
};

type LlmResponse = {
  personas: GeneratedPersonaSchema[];
};

@Injectable()
export class GeneratePersonasFromSegmentUseCase {
  private readonly logger = new Logger(GeneratePersonasFromSegmentUseCase.name);

  constructor(
    @Inject(SEGMENT_REPOSITORY)
    private readonly segmentRepository: SegmentRepository,
    @Inject(PERSONA_REPOSITORY)
    private readonly personaRepository: PersonaRepository,
    @Inject(LLM_PROVIDER)
    private readonly llmProvider: LlmProvider,
  ) {}

  async execute(input: GeneratePersonasInput): Promise<GeneratePersonasOutput> {
    const segment = await this.segmentRepository.findById(input.segmentId);
    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    this.logger.log(
      `Generating ${input.count} personas for segment "${segment.name}" with diversity: ${input.diversityLevel}`,
    );

    const prompt = this.buildPrompt(segment, input.count, input.diversityLevel);

    const response = await this.llmProvider.generateJson<LlmResponse>(
      prompt,
      {},
      {
        temperature: this.getTemperature(input.diversityLevel),
        maxOutputTokens: 8000,
      },
    );

    const createdPersonas: Persona[] = [];

    for (const generated of response.personas) {
      try {
        const persona = Persona.create({
          name: generated.name,
          segment: segment.name,
          segmentId: segment.id,
          motivations: generated.motivations,
          barriers: generated.barriers,
          trustChannel: generated.trustChannel,
          purchaseTriggers: generated.purchaseTriggers,
          budgetRange: generated.budgetRange,
          contextNotes: generated.contextNotes,
          age: generated.age,
          location: generated.location,
          income: generated.income,
          gender: generated.gender,
          occupation: generated.occupation,
          personality: generated.personality,
          healthProfile: generated.healthProfile,
          cognitiveProfile: generated.cognitiveProfile,
          decisionStyle: generated.decisionStyle,
        });

        const saved = await this.personaRepository.create(persona);
        createdPersonas.push(saved);
      } catch (error) {
        this.logger.error(`Failed to create persona ${generated.name}`, error);
      }
    }

    this.logger.log(
      `Successfully created ${createdPersonas.length} personas for segment "${segment.name}"`,
    );

    return {
      segmentId: segment.id ?? '',
      segmentName: segment.name,
      generatedCount: createdPersonas.length,
      personas: createdPersonas,
    };
  }

  private getTemperature(diversityLevel: 'low' | 'medium' | 'high'): number {
    switch (diversityLevel) {
      case 'low':
        return 0.3;
      case 'medium':
        return 0.6;
      case 'high':
        return 0.9;
    }
  }

  private buildPrompt(
    segment: Segment,
    count: number,
    diversityLevel: 'low' | 'medium' | 'high',
  ): string {
    const demographics = segment.demographicCriteria;
    const psychographics = segment.psychographicTraits;
    const behaviors = segment.behavioralPatterns;

    return `You are an expert market research analyst creating realistic synthetic personas for market research simulation.

SEGMENT DEFINITION:
Name: ${segment.name}
Description: ${segment.description}

Demographics:
- Age Range: ${demographics.ageRange.min}-${demographics.ageRange.max} years
- Income Range: $${demographics.incomeRange.min}k-$${demographics.incomeRange.max}k/year
- Locations: ${demographics.locations.join(', ')}
- Target Genders: ${demographics.genders?.join(', ') || 'All'}
- Target Occupations: ${demographics.occupations?.join(', ') || 'Various'}

Psychographics:
- Key Motivations: ${psychographics.motivations.join(', ')}
- Common Barriers: ${psychographics.barriers.join(', ')}
- Core Values: ${psychographics.values.join(', ')}
- Lifestyle Attributes: ${psychographics.lifestyleAttributes?.join(', ') || 'N/A'}

Behavioral Patterns:
- Purchase Triggers: ${behaviors.purchaseTriggers.join(', ')}
- Trust Channels: ${behaviors.trustChannels.join(', ')}
- Decision Style: ${behaviors.decisionStyle || 'Mixed'}
- Brand Loyalty: ${behaviors.brandLoyalty || 'Medium'}
- Price Anchor: ${behaviors.priceAnchor ? '$' + behaviors.priceAnchor : 'Variable'}

TASK:
Generate ${count} unique, realistic personas that fit this segment.

DIVERSITY LEVEL: ${diversityLevel}
- Low: Personas are very similar, representing the "core" of the segment
- Medium: Some variation in demographics and psychology
- High: Maximum variation while still fitting segment criteria

REQUIREMENTS:
1. Each persona must have a realistic, diverse name appropriate for their location
2. Ages must fall within the segment's age range (${demographics.ageRange.min}-${demographics.ageRange.max})
3. Income must fall within the segment's income range (${demographics.incomeRange.min}-${demographics.incomeRange.max}k)
4. Locations should be selected from the segment's location list
5. Personality traits (OCEAN) should be on 0-100 scale, varying based on diversity level
6. Cognitive biases should be on 0-1 scale
7. Health profile values should be 0-10 scale
8. Each persona should have a unique "contextNotes" backstory (1-2 sentences)
9. budgetRange should be a realistic monthly spend based on income (e.g., "$30-60/month")
10. Select motivations and barriers from the segment definition but vary the emphasis

Return a JSON object with this exact structure:
{
  "personas": [
    {
      "name": "Full Name",
      "age": 35,
      "gender": "male" | "female" | "non-binary" | "other",
      "location": "City, State/Country",
      "income": 85,
      "occupation": "Job Title",
      "motivations": ["motivation1", "motivation2"],
      "barriers": ["barrier1", "barrier2"],
      "trustChannel": "primary trust channel",
      "purchaseTriggers": ["trigger1", "trigger2"],
      "budgetRange": "$X-Y/month",
      "contextNotes": "Brief backstory about this persona",
      "personality": {
        "openness": 65,
        "conscientiousness": 70,
        "extraversion": 55,
        "agreeableness": 60,
        "neuroticism": 45
      },
      "healthProfile": {
        "insomniaSeverity": 5,
        "anxietyLevel": 4,
        "chronicPain": 2,
        "currentSupplements": ["vitamin D", "multivitamin"]
      },
      "cognitiveProfile": {
        "lossAversion": 0.6,
        "authorityBias": 0.5,
        "socialProof": 0.7,
        "statusQuoBias": 0.4,
        "anchoring": 0.5,
        "confirmationBias": 0.4
      },
      "decisionStyle": {
        "system1Weight": 0.4,
        "priceAnchor": 75,
        "riskTolerance": 0.5
      }
    }
  ]
}

Generate exactly ${count} personas. Each must be unique and realistic.`;
  }
}
