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

export type UpdatePersonaInput = {
  name?: string;
  segment?: string;
  segmentId?: string | null;
  motivations?: string[];
  barriers?: string[];
  trustChannel?: string;
  purchaseTriggers?: string[];
  budgetRange?: string;
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
export class UpdatePersonaUseCase {
  constructor(
    @Inject(PERSONA_REPOSITORY)
    private readonly repository: PersonaRepository,
  ) {}

  async execute(
    id: string,
    input: UpdatePersonaInput,
  ): Promise<Persona | null> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }

    const updated = Persona.rehydrate({
      id: existing.id ?? id,
      createdAt: existing.createdAt ?? new Date(),
      name: input.name ?? existing.name,
      segment: input.segment ?? existing.segment,
      segmentId:
        input.segmentId !== undefined
          ? input.segmentId
          : (existing.segmentId ?? null),
      motivations: input.motivations ?? existing.motivations,
      barriers: input.barriers ?? existing.barriers,
      trustChannel: input.trustChannel ?? existing.trustChannel,
      purchaseTriggers: input.purchaseTriggers ?? existing.purchaseTriggers,
      budgetRange: input.budgetRange ?? existing.budgetRange,
      contextNotes:
        input.contextNotes !== undefined
          ? input.contextNotes
          : (existing.contextNotes ?? null),
      age: input.age !== undefined ? input.age : (existing.age ?? null),
      location:
        input.location !== undefined
          ? input.location
          : (existing.location ?? null),
      income:
        input.income !== undefined ? input.income : (existing.income ?? null),
      // Extended fields
      gender:
        input.gender !== undefined ? input.gender : (existing.gender ?? null),
      occupation:
        input.occupation !== undefined
          ? input.occupation
          : (existing.occupation ?? null),
      personality:
        input.personality !== undefined
          ? input.personality
          : (existing.personality ?? null),
      healthProfile:
        input.healthProfile !== undefined
          ? input.healthProfile
          : (existing.healthProfile ?? null),
      cognitiveProfile:
        input.cognitiveProfile !== undefined
          ? input.cognitiveProfile
          : (existing.cognitiveProfile ?? null),
      decisionStyle:
        input.decisionStyle !== undefined
          ? input.decisionStyle
          : (existing.decisionStyle ?? null),
    });

    return this.repository.update(updated);
  }
}
