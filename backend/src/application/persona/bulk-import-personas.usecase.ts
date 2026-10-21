import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { PERSONA_REPOSITORY } from '../../common/tokens';
import type { PersonaRepository } from '../../domain/persona/persona.repository';
import { Persona, type Gender } from '../../domain/persona/persona';

export type BulkImportPersonasInput = {
  csvContent: string;
};

export type BulkImportResult = {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  personas: Persona[];
};

const parseNumber = (value: string | undefined): number | undefined => {
  if (!value || value.trim() === '') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

const parseArray = (value: string | undefined): string[] => {
  if (!value || value.trim() === '') return [];
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseGender = (value: string | undefined): Gender | undefined => {
  if (!value || value.trim() === '') return undefined;
  const normalized = value.toLowerCase().trim();
  if (['male', 'female', 'non-binary', 'other'].includes(normalized)) {
    return normalized as Gender;
  }
  return undefined;
};

const parsePersonalityProfile = (row: Record<string, string>) => {
  const openness = parseNumber(row.personality_openness);
  const conscientiousness = parseNumber(row.personality_conscientiousness);
  const extraversion = parseNumber(row.personality_extraversion);
  const agreeableness = parseNumber(row.personality_agreeableness);
  const neuroticism = parseNumber(row.personality_neuroticism);

  if (
    openness === undefined &&
    conscientiousness === undefined &&
    extraversion === undefined &&
    agreeableness === undefined &&
    neuroticism === undefined
  ) {
    return undefined;
  }

  return {
    openness: openness ?? 50,
    conscientiousness: conscientiousness ?? 50,
    extraversion: extraversion ?? 50,
    agreeableness: agreeableness ?? 50,
    neuroticism: neuroticism ?? 50,
  };
};

const parseHealthProfile = (row: Record<string, string>) => {
  const insomniaSeverity = parseNumber(row.health_insomnia_severity);
  const anxietyLevel = parseNumber(row.health_anxiety_level);
  const chronicPain = parseNumber(row.health_chronic_pain);
  const currentSupplements = parseArray(row.health_current_supplements);

  if (
    insomniaSeverity === undefined &&
    anxietyLevel === undefined &&
    chronicPain === undefined &&
    currentSupplements.length === 0
  ) {
    return undefined;
  }

  return {
    insomniaSeverity: insomniaSeverity ?? 0,
    anxietyLevel: anxietyLevel ?? 0,
    chronicPain: chronicPain ?? 0,
    currentSupplements,
  };
};

const parseCognitiveProfile = (row: Record<string, string>) => {
  const lossAversion = parseNumber(row.cognitive_loss_aversion);
  const authorityBias = parseNumber(row.cognitive_authority_bias);
  const socialProof = parseNumber(row.cognitive_social_proof);
  const statusQuoBias = parseNumber(row.cognitive_status_quo_bias);
  const anchoring = parseNumber(row.cognitive_anchoring);
  const confirmationBias = parseNumber(row.cognitive_confirmation_bias);

  if (
    lossAversion === undefined &&
    authorityBias === undefined &&
    socialProof === undefined &&
    statusQuoBias === undefined &&
    anchoring === undefined &&
    confirmationBias === undefined
  ) {
    return undefined;
  }

  return {
    lossAversion: lossAversion ?? 0.5,
    authorityBias: authorityBias ?? 0.5,
    socialProof: socialProof ?? 0.5,
    statusQuoBias: statusQuoBias ?? 0.5,
    anchoring: anchoring ?? 0.5,
    confirmationBias: confirmationBias ?? 0.5,
  };
};

const parseDecisionStyle = (row: Record<string, string>) => {
  const system1Weight = parseNumber(row.decision_system1_weight);
  const priceAnchor = parseNumber(row.decision_price_anchor);
  const riskTolerance = parseNumber(row.decision_risk_tolerance);

  if (
    system1Weight === undefined &&
    priceAnchor === undefined &&
    riskTolerance === undefined
  ) {
    return undefined;
  }

  return {
    system1Weight: system1Weight ?? 0.5,
    priceAnchor: priceAnchor ?? 50,
    riskTolerance: riskTolerance ?? 0.5,
  };
};

function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) {
    throw new BadRequestException(
      'CSV must have header row and at least one data row',
    );
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return rows;
}

@Injectable()
export class BulkImportPersonasUseCase {
  constructor(
    @Inject(PERSONA_REPOSITORY)
    private readonly personaRepository: PersonaRepository,
  ) {}

  async execute(input: BulkImportPersonasInput): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      personas: [],
    };

    let rows: Record<string, string>[];
    try {
      rows = parseCSV(input.csvContent);
    } catch (error) {
      throw new BadRequestException(
        `CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because of header and 0-index

      try {
        // Required fields
        if (!row.name || !row.segment) {
          result.errors.push({
            row: rowNumber,
            error: 'Missing required fields: name and segment',
          });
          result.failed++;
          continue;
        }

        const motivations = parseArray(row.motivations);
        const barriers = parseArray(row.barriers);
        const purchaseTriggers = parseArray(row.purchase_triggers);

        if (
          motivations.length === 0 ||
          barriers.length === 0 ||
          purchaseTriggers.length === 0
        ) {
          result.errors.push({
            row: rowNumber,
            error:
              'Missing required arrays: motivations, barriers, or purchase_triggers',
          });
          result.failed++;
          continue;
        }

        if (!row.trust_channel || !row.budget_range) {
          result.errors.push({
            row: rowNumber,
            error: 'Missing required fields: trust_channel or budget_range',
          });
          result.failed++;
          continue;
        }

        const persona = Persona.create({
          name: row.name,
          segment: row.segment,
          segmentId: row.segment_id || undefined,
          motivations,
          barriers,
          trustChannel: row.trust_channel,
          purchaseTriggers,
          budgetRange: row.budget_range,
          contextNotes: row.context_notes || undefined,
          age: parseNumber(row.age),
          location: row.location || undefined,
          income: parseNumber(row.income),
          gender: parseGender(row.gender),
          occupation: row.occupation || undefined,
          personality: parsePersonalityProfile(row),
          healthProfile: parseHealthProfile(row),
          cognitiveProfile: parseCognitiveProfile(row),
          decisionStyle: parseDecisionStyle(row),
        });

        const created = await this.personaRepository.create(persona);
        result.personas.push(created);
        result.success++;
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        result.failed++;
      }
    }

    return result;
  }
}
