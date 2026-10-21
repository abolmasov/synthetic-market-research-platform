import { Persona } from '../../../domain/persona/persona';
import type {
  CognitiveProfile,
  DecisionStyle,
  Gender,
  HealthProfile,
  PersonalityProfile,
} from '../../../domain/persona/persona';

export type PersonaResponse = {
  id: string;
  name: string;
  segment: string;
  segmentId: string | null;
  motivations: string[];
  barriers: string[];
  trustChannel: string;
  purchaseTriggers: string[];
  budgetRange: string;
  contextNotes: string | null;
  age: number | null;
  location: string | null;
  income: number | null;
  // Extended fields
  gender: Gender | null;
  occupation: string | null;
  personality: PersonalityProfile | null;
  healthProfile: HealthProfile | null;
  cognitiveProfile: CognitiveProfile | null;
  decisionStyle: DecisionStyle | null;
  createdAt: string;
};

export const toPersonaResponse = (persona: Persona): PersonaResponse => ({
  id: persona.id ?? '',
  name: persona.name,
  segment: persona.segment,
  segmentId: persona.segmentId ?? null,
  motivations: persona.motivations ?? [],
  barriers: persona.barriers ?? [],
  trustChannel: persona.trustChannel,
  purchaseTriggers: persona.purchaseTriggers ?? [],
  budgetRange: persona.budgetRange,
  contextNotes: persona.contextNotes ?? null,
  age: persona.age ?? null,
  location: persona.location ?? null,
  income: persona.income ?? null,
  // Extended fields
  gender: persona.gender ?? null,
  occupation: persona.occupation ?? null,
  personality: persona.personality ?? null,
  healthProfile: persona.healthProfile ?? null,
  cognitiveProfile: persona.cognitiveProfile ?? null,
  decisionStyle: persona.decisionStyle ?? null,
  createdAt: persona.createdAt?.toISOString() ?? new Date().toISOString(),
});
