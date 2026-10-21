import { Inject, Injectable } from '@nestjs/common';
import type { PersonaRepository } from '../../domain/persona/persona.repository';
import { Persona } from '../../domain/persona/persona';
import { PERSONA_REPOSITORY } from '../../common/tokens';
import type {
  CognitiveProfile,
  DecisionStyle,
  Gender,
  HealthProfile,
  PersonalityProfile,
} from '../../domain/persona/persona';

export type CreatePersonaInput = {
  workspaceId?: string | null;
  name: string;
  segment: string;
  segmentId?: string | null;
  motivations: string[];
  barriers: string[];
  trustChannel: string;
  purchaseTriggers: string[];
  budgetRange: string;
  contextNotes?: string | null;
  age?: number | null;
  location?: string | null;
  income?: number | null;
  // Extended demographics
  gender?: Gender | null;
  occupation?: string | null;
  // OCEAN personality profile
  personality?: PersonalityProfile | null;
  // Health profile
  healthProfile?: HealthProfile | null;
  // Cognitive biases
  cognitiveProfile?: CognitiveProfile | null;
  // Decision-making style
  decisionStyle?: DecisionStyle | null;
};

@Injectable()
export class CreatePersonaUseCase {
  constructor(
    @Inject(PERSONA_REPOSITORY)
    private readonly repository: PersonaRepository,
  ) {}

  async execute(input: CreatePersonaInput): Promise<Persona> {
    const persona = Persona.create({
      workspaceId: input.workspaceId ?? null,
      name: input.name,
      segment: input.segment,
      segmentId: input.segmentId ?? null,
      motivations: input.motivations,
      barriers: input.barriers,
      trustChannel: input.trustChannel,
      purchaseTriggers: input.purchaseTriggers,
      budgetRange: input.budgetRange,
      contextNotes: input.contextNotes ?? null,
      age: input.age ?? null,
      location: input.location ?? null,
      income: input.income ?? null,
      // Extended fields
      gender: input.gender ?? null,
      occupation: input.occupation ?? null,
      personality: input.personality ?? null,
      healthProfile: input.healthProfile ?? null,
      cognitiveProfile: input.cognitiveProfile ?? null,
      decisionStyle: input.decisionStyle ?? null,
    });

    return this.repository.create(persona);
  }
}
