import { Inject, Injectable, Logger } from '@nestjs/common';
import type { PersonaRepository } from '../../domain/persona/persona.repository';
import type { HypothesisRepository } from '../../domain/hypothesis/hypothesis.repository';
import type { SimulationRepository } from '../../domain/simulation/simulation.repository';
import type { RagSourceProvider } from '../../domain/rag/rag-source.provider';
import type { LlmProvider } from '../../domain/ai/llm.provider';
import {
  HYPOTHESIS_REPOSITORY,
  LLM_PROVIDER,
  PERSONA_REPOSITORY,
  RAG_SOURCE_PROVIDER,
  SIMULATION_REPOSITORY,
} from '../../common/tokens';
import {
  ConfidenceBucket,
  ReasonEntry,
  Simulation,
  SimulationDecision,
  SimulationSummary,
  SegmentBreakdownEntry,
} from '../../domain/simulation/simulation';
import {
  Hypothesis,
  HypothesisGuardrail,
  HypothesisMetric,
  VerificationDecisionOutcome,
  VerificationDirection,
} from '../../domain/hypothesis/hypothesis';
import { Persona } from '../../domain/persona/persona';

export type RunSimulationInput = {
  hypothesis: string;
  hypothesisId?: string;
  personaIds?: string[];
  maxIterations?: number;
  workspaceId?: string;
};

type AgentJsonResponse = {
  decision: 'accept' | 'reject' | 'maybe';
  confidence: number;
  rational_thought: string;
  key_reasons: string[];
};

type HypothesisVerificationResult = {
  outcome: VerificationDecisionOutcome;
  reason: string;
};

/** Parse a rough price figure out of the hypothesis text (e.g. "$49/month" → 49) */
function extractHypothesisPrice(hypothesis: string): number | null {
  const match = hypothesis.match(/\$\s*(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Naïve sentiment estimation for System 1 text.
 * Returns -1 (very negative) to +1 (very positive).
 */
function estimateSentiment(text: string): number {
  const positive = [
    'love',
    'great',
    'amazing',
    'yes',
    'want',
    'need',
    'excited',
    'fantastic',
    'perfect',
    'interesting',
    'good',
    'definitely',
    'try',
  ];
  const negative = [
    'no',
    'hate',
    'never',
    'expensive',
    'waste',
    'doubt',
    'skeptical',
    'ridiculous',
    'too much',
    'not interested',
    'worried',
    'bad',
    'awful',
  ];
  const lower = text.toLowerCase();
  let score = 0;
  for (const w of positive) {
    if (lower.includes(w)) score += 1;
  }
  for (const w of negative) {
    if (lower.includes(w)) score -= 1;
  }
  // Normalise to [-1, +1]
  const maxTerms = Math.max(positive.length, negative.length);
  return Math.max(-1, Math.min(1, score / maxTerms));
}

@Injectable()
export class RunSimulationUseCase {
  private readonly logger = new Logger(RunSimulationUseCase.name);

  constructor(
    @Inject(PERSONA_REPOSITORY)
    private readonly personaRepository: PersonaRepository,
    @Inject(HYPOTHESIS_REPOSITORY)
    private readonly hypothesisRepository: HypothesisRepository,
    @Inject(SIMULATION_REPOSITORY)
    private readonly simulationRepository: SimulationRepository,
    @Inject(RAG_SOURCE_PROVIDER)
    private readonly ragProvider: RagSourceProvider,
    @Inject(LLM_PROVIDER)
    private readonly llmProvider: LlmProvider,
  ) {}

  async execute(input: RunSimulationInput): Promise<Simulation> {
    this.logger.log(
      `Starting simulation for hypothesis: "${input.hypothesis}"`,
    );

    const personas = await this.personaRepository.findAll();
    const personaIdSet = input.personaIds?.length
      ? new Set(input.personaIds)
      : null;
    const filteredPersonas = personaIdSet
      ? personas.filter((p) => p.id && personaIdSet.has(p.id))
      : personas;

    this.logger.log(`Simulating with ${filteredPersonas.length} personas`);

    const ragSources = await this.ragProvider.query(input.hypothesis);
    const contextText = ragSources
      .map((s) => `- [${s.title}]: ${s.snippet}`)
      .join('\n');

    const hypothesisPrice = extractHypothesisPrice(input.hypothesis);
    const maxIterations = input.maxIterations ?? 1;

    const decisions = await this.processPersonasBatched(
      filteredPersonas,
      input.hypothesis,
      contextText,
      maxIterations,
      hypothesisPrice,
    );

    const summary = this.buildSummary(decisions);
    const verification = await this.evaluateAndPersistHypothesisDecision(
      input.hypothesisId,
      summary,
      decisions.length,
      input.workspaceId,
    );

    const objections = summary.objectionFrequency
      .slice(0, 5)
      .map((e) => e.reason);

    const topSignals = [
      'AI Analysis Completed',
      `Simulated ${decisions.length} agents`,
      `RAG Context: ${ragSources.length} sources`,
      `Acceptance: ${Math.round(summary.acceptanceRate * 100)}%`,
      `Avg Confidence: ${Math.round(summary.averageConfidence * 100)}%`,
      ...(verification
        ? [
            `Decision: ${verification.outcome.toUpperCase()} (${verification.reason})`,
          ]
        : []),
    ];

    const simulation = Simulation.create({
      hypothesis: input.hypothesis,
      hypothesisId: input.hypothesisId ?? null,
      workspaceId: input.workspaceId ?? null,
      status: 'completed',
      summary,
      decisions,
      ragSources,
      topSignals,
      objections,
      completedAt: new Date(),
    });

    return this.simulationRepository.create(simulation);
  }

  // ─── Batch processing ─────────────────────────────────────────────────────

  private async processPersonasBatched(
    personas: Persona[],
    hypothesis: string,
    context: string,
    maxIterations: number,
    hypothesisPrice: number | null,
  ): Promise<SimulationDecision[]> {
    const BATCH_SIZE = 5;
    const results: SimulationDecision[] = [];

    for (let i = 0; i < personas.length; i += BATCH_SIZE) {
      const batch = personas.slice(i, i + BATCH_SIZE);
      const settled = await Promise.all(
        batch.map((p) =>
          this.simulatePersona(
            p,
            hypothesis,
            context,
            maxIterations,
            hypothesisPrice,
          ),
        ),
      );
      results.push(...settled);
      this.logger.log(`Processed batch ${Math.ceil((i + 1) / BATCH_SIZE)}`);
    }

    return results;
  }

  // ─── Single persona simulation ────────────────────────────────────────────

  private async simulatePersona(
    persona: Persona,
    hypothesis: string,
    context: string,
    maxIterations: number,
    hypothesisPrice: number | null,
  ): Promise<SimulationDecision> {
    try {
      const system1Prompt = this.buildSystem1Prompt(persona, hypothesis);

      let system1Response = await this.llmProvider.generateText(system1Prompt, {
        temperature: 0.7 + (persona.personality?.neuroticism ?? 50) / 500,
      });

      let system2Result =
        await this.llmProvider.generateJson<AgentJsonResponse>(
          this.buildSystem2Prompt(
            persona,
            hypothesis,
            context,
            system1Response,
          ),
          {},
          { temperature: 0.2 },
        );

      let loopDepth = 1;
      const clampedMax = Math.min(Math.max(maxIterations, 1), 10);

      while (
        loopDepth < clampedMax &&
        (system2Result.decision === 'maybe' || system2Result.confidence < 0.5)
      ) {
        this.logger.debug(
          `${persona.name}: iteration ${loopDepth + 1} (decision=${system2Result.decision}, confidence=${system2Result.confidence})`,
        );

        system1Response = await this.llmProvider.generateText(
          this.buildReSystem1Prompt(
            persona,
            system2Result.rational_thought,
            system2Result.decision,
            system2Result.confidence,
          ),
          { temperature: 0.5 + (persona.personality?.neuroticism ?? 50) / 500 },
        );

        system2Result = await this.llmProvider.generateJson<AgentJsonResponse>(
          this.buildReSystem2Prompt(
            persona,
            hypothesis,
            context,
            system1Response,
            system2Result,
            loopDepth,
          ),
          {},
          { temperature: 0.2 },
        );

        loopDepth++;
      }

      const sentimentScore = estimateSentiment(system1Response);
      const priceAnchorHit = this.computePriceAnchorHit(
        persona,
        hypothesisPrice,
      );

      return {
        personaId: persona.id ?? 'unknown',
        name: persona.name,
        segment: persona.segment,
        age: persona.age ?? null,
        gender: persona.gender ?? null,
        occupation: persona.occupation ?? null,
        income: persona.income ?? null,
        location: persona.location ?? null,
        decision: system2Result.decision,
        confidence: Math.max(0, Math.min(1, system2Result.confidence)),
        system1: system1Response,
        system2: system2Result.rational_thought,
        reasons: system2Result.key_reasons,
        loopDepth,
        sentimentScore,
        priceAnchorHit,
      };
    } catch (error) {
      this.logger.error(`Failed to simulate persona ${persona.name}`, error);
      return {
        personaId: persona.id ?? 'unknown',
        name: persona.name,
        segment: persona.segment,
        age: persona.age ?? null,
        gender: persona.gender ?? null,
        occupation: persona.occupation ?? null,
        income: persona.income ?? null,
        location: persona.location ?? null,
        decision: 'maybe',
        confidence: 0.1,
        system1: 'Error processing response',
        system2: 'System error',
        reasons: ['Simulation failed'],
        loopDepth: 0,
        sentimentScore: 0,
        priceAnchorHit: false,
      };
    }
  }

  // ─── Prompt builders ──────────────────────────────────────────────────────

  private buildSystem1Prompt(persona: Persona, hypothesis: string): string {
    const ds = persona.decisionStyle;
    const hp = persona.healthProfile;
    const pp = persona.personality;

    return `You are simulating the IMMEDIATE EMOTIONAL GUT REACTION of a real consumer.
Act exactly as this person. Be authentic and impulsive — no hedging.

═══ PERSONA PROFILE ═══
Name:       ${persona.name}
Age:        ${persona.age ?? 'Unknown'}
Gender:     ${persona.gender ?? 'Not specified'}
Occupation: ${persona.occupation ?? 'Unknown'}
Location:   ${persona.location ?? 'Unknown'}
Income:     ${persona.income ? '$' + persona.income + 'k/yr' : 'Unknown'}
Segment:    ${persona.segment}

PERSONALITY (OCEAN 0-100):
  Openness:         ${pp?.openness ?? 50}/100
  Conscientiousness:${pp?.conscientiousness ?? 50}/100
  Extraversion:     ${pp?.extraversion ?? 50}/100
  Agreeableness:    ${pp?.agreeableness ?? 50}/100
  Neuroticism:      ${pp?.neuroticism ?? 50}/100

HEALTH:
  Insomnia severity: ${hp?.insomniaSeverity ?? 0}/10
  Anxiety level:     ${hp?.anxietyLevel ?? 0}/10
  Chronic pain:      ${hp?.chronicPain ?? 0}/10
  Supplements:       ${hp?.currentSupplements?.join(', ') || 'None'}

BUYING CONTEXT:
  Budget range:        ${persona.budgetRange}
  Trust channels:      ${persona.trustChannel}
  Purchase triggers:   ${persona.purchaseTriggers.join(', ')}
  Motivations:         ${persona.motivations.join(', ')}
  Barriers:            ${persona.barriers.join(', ')}
  Context notes:       ${persona.contextNotes ?? 'None'}

DECISION STYLE:
  Intuition weight: ${ds ? Math.round(ds.system1Weight * 100) : 50}% (higher = more gut-driven)
  Price anchor:     $${ds?.priceAnchor ?? 'Unknown'}
  Risk tolerance:   ${ds ? Math.round(ds.riskTolerance * 100) : 50}%

═══ HYPOTHESIS ═══
"${hypothesis}"

INSTRUCTION:
Write ONE sentence: your immediate gut reaction, in first-person, as this specific person.
Be raw, honest, and specific to who this person is.`;
  }

  private buildSystem2Prompt(
    persona: Persona,
    hypothesis: string,
    context: string,
    system1Response: string,
  ): string {
    const cp = persona.cognitiveProfile;
    const ds = persona.decisionStyle;

    return `You are ${persona.name}. Your gut just said: "${system1Response}"

Now think carefully and critically before deciding.

═══ YOUR PROFILE ═══
Income:        ${persona.income ? '$' + persona.income + 'k/yr' : 'Unknown'}
Budget range:  ${persona.budgetRange}
Price anchor:  $${ds?.priceAnchor ?? 'Unknown'} (your internal reference price)
Risk tolerance:${ds ? Math.round(ds.riskTolerance * 100) : 50}% (higher = more open to trying new things)

COGNITIVE BIASES (0-1, higher = stronger bias):
  Loss aversion:    ${cp?.lossAversion ?? 0.5} — How much you hate losses vs. gains
  Status quo bias:  ${cp?.statusQuoBias ?? 0.5} — Preference for doing nothing / staying put
  Authority bias:   ${cp?.authorityBias ?? 0.5} — Tendency to trust experts/brands
  Social proof:     ${cp?.socialProof ?? 0.5} — Influenced by what others do
  Anchoring:        ${cp?.anchoring ?? 0.5} — Influenced by the first number/fact you see
  Confirmation:     ${cp?.confirmationBias ?? 0.3} — Tendency to seek confirming info

BARRIERS:       ${persona.barriers.join(', ')}
MOTIVATIONS:    ${persona.motivations.join(', ')}
TRUST CHANNELS: ${persona.trustChannel}
PURCHASE TRIGGERS: ${persona.purchaseTriggers.join(', ')}

MARKET FACTS (from research corpus):
${context || 'No specific market data available.'}

═══ HYPOTHESIS ═══
"${hypothesis}"

Weigh this against your finances, biases, and the facts above.
Return ONLY valid JSON with this exact structure:
{
  "decision": "accept" | "reject" | "maybe",
  "confidence": <number 0.0-1.0>,
  "rational_thought": "<your detailed reasoning as this person, 2-3 sentences>",
  "key_reasons": ["<reason 1>", "<reason 2>", "<reason 3>"]
}`;
  }

  private buildReSystem1Prompt(
    persona: Persona,
    priorRational: string,
    priorDecision: string,
    priorConfidence: number,
  ): string {
    return `You are ${persona.name}. You just thought this through rationally:
"${priorRational}"
Your current decision: ${priorDecision} (confidence: ${Math.round(priorConfidence * 100)}%)

But something still nags at you. Re-examine your GUT feeling now.
Has anything shifted? Write ONE sentence — your updated emotional reaction, first-person.`;
  }

  private buildReSystem2Prompt(
    persona: Persona,
    hypothesis: string,
    context: string,
    system1Response: string,
    prior: AgentJsonResponse,
    iteration: number,
  ): string {
    const cp = persona.cognitiveProfile;
    const ds = persona.decisionStyle;

    return `You are ${persona.name}. This is deliberation round ${iteration + 1}.

Previous conclusion: "${prior.rational_thought}"
Updated gut feeling: "${system1Response}"

BIAS CONTEXT:
  Loss aversion:   ${cp?.lossAversion ?? 0.5} — remember, losses feel 2× worse than gains
  Status quo bias: ${cp?.statusQuoBias ?? 0.5} — inertia pulls you toward doing nothing
  Price anchor:    $${ds?.priceAnchor ?? 'Unknown'} — this is your internal reference point

MARKET FACTS:
${context || 'No specific market data available.'}

HYPOTHESIS: "${hypothesis}"

Make a MORE DEFINITIVE decision this time. Avoid "maybe" unless truly undecided.
Return ONLY valid JSON:
{
  "decision": "accept" | "reject" | "maybe",
  "confidence": <number 0.0-1.0>,
  "rational_thought": "<updated reasoning, 2-3 sentences>",
  "key_reasons": ["<reason 1>", "<reason 2>", "<reason 3>"]
}`;
  }

  // ─── Analytics builders ───────────────────────────────────────────────────

  private async evaluateAndPersistHypothesisDecision(
    hypothesisId: string | undefined,
    summary: SimulationSummary,
    simulatedPersonas: number,
    workspaceId?: string,
  ): Promise<HypothesisVerificationResult | null> {
    if (!hypothesisId) {
      return null;
    }

    const hypothesis = await this.hypothesisRepository.findById(
      hypothesisId,
      workspaceId,
    );
    if (!hypothesis) {
      return null;
    }

    const primaryMetric = hypothesis.primaryMetric;
    const primaryDirection = hypothesis.primaryMetricDirection;
    const primaryThreshold = hypothesis.primaryMetricThreshold;

    if (
      !primaryMetric ||
      !primaryDirection ||
      primaryThreshold === undefined ||
      primaryThreshold === null
    ) {
      return null;
    }

    const primaryValue = this.readMetric(summary, primaryMetric);
    const primaryPassed = this.compareMetric(
      primaryValue,
      primaryDirection,
      primaryThreshold,
    );
    const sampleSizeTarget = hypothesis.sampleSize ?? null;
    const sampleSizePassed =
      sampleSizeTarget === null || simulatedPersonas >= sampleSizeTarget;
    const guardrailFailures = this.findGuardrailFailures(
      summary,
      hypothesis.guardrails ?? [],
    );
    const isFalsified = this.evaluateFalsificationRule(
      hypothesis.falsificationRule,
      summary,
      simulatedPersonas,
    );

    let outcome: VerificationDecisionOutcome;
    let reason: string;
    if (!sampleSizePassed) {
      outcome = 'iterate';
      reason = `Sample size below target (${simulatedPersonas}/${sampleSizeTarget})`;
    } else if (guardrailFailures.length > 0) {
      outcome = 'kill';
      reason = `Guardrail failed: ${guardrailFailures[0]}`;
    } else if (isFalsified) {
      outcome = 'kill';
      reason = 'Falsification rule triggered';
    } else if (primaryPassed) {
      outcome = 'pass';
      reason = `${primaryMetric} ${this.operatorText(primaryDirection)} ${primaryThreshold.toFixed(2)} (actual ${primaryValue.toFixed(2)})`;
    } else {
      outcome = 'iterate';
      reason = `${primaryMetric} missed threshold (${primaryValue.toFixed(2)} vs ${primaryThreshold.toFixed(2)})`;
    }

    const updated = this.rehydrateHypothesisWithDecision(
      hypothesis,
      outcome,
      reason,
    );
    await this.hypothesisRepository.update(updated);

    return { outcome, reason };
  }

  private readMetric(
    summary: SimulationSummary,
    metric: HypothesisMetric,
  ): number {
    return summary[metric] ?? 0;
  }

  private compareMetric(
    value: number,
    direction: VerificationDirection,
    threshold: number,
  ): boolean {
    if (direction === 'at_most') {
      return value <= threshold;
    }

    return value >= threshold;
  }

  private operatorText(direction: VerificationDirection): string {
    return direction === 'at_most' ? '<=' : '>=';
  }

  private findGuardrailFailures(
    summary: SimulationSummary,
    guardrails: HypothesisGuardrail[],
  ): string[] {
    const failures: string[] = [];
    for (const guardrail of guardrails) {
      const value = this.readMetric(summary, guardrail.metric);
      if (
        !this.compareMetric(value, guardrail.direction, guardrail.threshold)
      ) {
        const guardrailName =
          guardrail.label?.trim() ||
          `${guardrail.metric} ${this.operatorText(guardrail.direction)} ${guardrail.threshold.toFixed(2)}`;
        failures.push(`${guardrailName} (actual ${value.toFixed(2)})`);
      }
    }

    return failures;
  }

  private evaluateFalsificationRule(
    rule: string | null | undefined,
    summary: SimulationSummary,
    simulatedPersonas: number,
  ): boolean {
    if (!rule?.trim()) {
      return false;
    }

    const input = rule.trim();
    const match = input.match(
      /^(acceptanceRate|rejectionRate|maybeRate|averageConfidence|priceAnchorHitRate|sampleSize)\s*(>=|<=|>|<)\s*(\d*\.?\d+)$/,
    );
    if (!match) {
      return false;
    }

    const metric = match[1];
    const operator = match[2];
    const threshold = Number(match[3]);
    const value =
      metric === 'sampleSize'
        ? simulatedPersonas
        : this.readMetric(summary, metric as HypothesisMetric);

    if (operator === '>=') {
      return value >= threshold;
    }
    if (operator === '<=') {
      return value <= threshold;
    }
    if (operator === '>') {
      return value > threshold;
    }

    return value < threshold;
  }

  private rehydrateHypothesisWithDecision(
    hypothesis: Hypothesis,
    outcome: VerificationDecisionOutcome,
    reason: string,
  ): Hypothesis {
    return Hypothesis.rehydrate({
      id: hypothesis.id ?? '',
      createdAt: hypothesis.createdAt ?? new Date(),
      workspaceId: hypothesis.workspaceId ?? null,
      studyId: hypothesis.studyId ?? null,
      stage: hypothesis.stage,
      title: hypothesis.title,
      statement: hypothesis.statement,
      status:
        hypothesis.status === 'ready' || hypothesis.status === 'running'
          ? 'completed'
          : hypothesis.status,
      successCriteria: hypothesis.successCriteria ?? null,
      protocolId: hypothesis.protocolId ?? null,
      primaryMetric: hypothesis.primaryMetric ?? null,
      primaryMetricDirection: hypothesis.primaryMetricDirection ?? null,
      primaryMetricThreshold: hypothesis.primaryMetricThreshold ?? null,
      guardrails: hypothesis.guardrails ?? null,
      falsificationRule: hypothesis.falsificationRule ?? null,
      sampleSize: hypothesis.sampleSize ?? null,
      testDurationDays: hypothesis.testDurationDays ?? null,
      decisionOutcome: outcome,
      decisionReason: reason,
      lastEvaluatedAt: new Date(),
      notes: hypothesis.notes ?? null,
    });
  }

  private computePriceAnchorHit(
    persona: Persona,
    hypothesisPrice: number | null,
  ): boolean {
    if (hypothesisPrice === null) return false;
    const anchor = persona.decisionStyle?.priceAnchor ?? null;
    if (anchor === null) return false;
    // "hit" if hypothesis price is within 150% of the persona's price anchor
    return hypothesisPrice <= anchor * 1.5;
  }

  private buildSummary(decisions: SimulationDecision[]): SimulationSummary {
    const total = decisions.length;
    if (total === 0) {
      return this.emptySummary();
    }

    // Core counts
    let accept = 0,
      reject = 0,
      maybe = 0;
    let confidenceSum = 0,
      loopSum = 0,
      sentimentSum = 0,
      priceHits = 0;

    const acceptReasonCounts = new Map<string, number>();
    const rejectReasonCounts = new Map<string, number>();
    const objectionCounts = new Map<string, number>();
    const segmentMap = new Map<
      string,
      {
        total: number;
        accept: number;
        reject: number;
        maybe: number;
        confidenceSum: number;
      }
    >();

    for (const d of decisions) {
      if (d.decision === 'accept') accept++;
      else if (d.decision === 'reject') reject++;
      else maybe++;

      confidenceSum += d.confidence;
      loopSum += d.loopDepth;
      sentimentSum += d.sentimentScore;
      if (d.priceAnchorHit) priceHits++;

      // Segment aggregation
      const seg = segmentMap.get(d.segment) ?? {
        total: 0,
        accept: 0,
        reject: 0,
        maybe: 0,
        confidenceSum: 0,
      };
      seg.total++;
      seg[d.decision]++;
      seg.confidenceSum += d.confidence;
      segmentMap.set(d.segment, seg);

      // Reason tallying
      for (const reason of d.reasons) {
        if (d.decision === 'accept') {
          acceptReasonCounts.set(
            reason,
            (acceptReasonCounts.get(reason) ?? 0) + 1,
          );
        } else {
          rejectReasonCounts.set(
            reason,
            (rejectReasonCounts.get(reason) ?? 0) + 1,
          );
          objectionCounts.set(reason, (objectionCounts.get(reason) ?? 0) + 1);
        }
      }
    }

    const segmentBreakdown: SegmentBreakdownEntry[] = [...segmentMap.entries()]
      .map(([segment, s]) => ({
        segment,
        total: s.total,
        accept: s.accept,
        reject: s.reject,
        maybe: s.maybe,
        acceptRate: round2(s.accept / s.total),
        rejectRate: round2(s.reject / s.total),
        maybeRate: round2(s.maybe / s.total),
        avgConfidence: round2(s.confidenceSum / s.total),
      }))
      .sort((a, b) => b.total - a.total);

    const confidenceDistribution: ConfidenceBucket[] = [
      { label: '0–39%', min: 0, max: 0.39 },
      { label: '40–59%', min: 0.4, max: 0.59 },
      { label: '60–79%', min: 0.6, max: 0.79 },
      { label: '80–100%', min: 0.8, max: 1.0 },
    ].map((b) => {
      const count = decisions.filter(
        (d) => d.confidence >= b.min && d.confidence <= b.max,
      ).length;
      return { ...b, count, rate: round2(count / total) };
    });

    const topAcceptReasons = sortedReasons(acceptReasonCounts).slice(0, 5);
    const topRejectReasons = sortedReasons(rejectReasonCounts).slice(0, 5);
    const objectionFrequency = sortedReasons(objectionCounts);

    return {
      acceptanceRate: round2(accept / total),
      rejectionRate: round2(reject / total),
      maybeRate: round2(maybe / total),
      averageConfidence: round2(confidenceSum / total),
      avgLoopDepth: round2(loopSum / total),
      totalPersonas: total,
      segmentBreakdown,
      confidenceDistribution,
      topAcceptReasons,
      topRejectReasons,
      objectionFrequency,
      avgSentimentScore: round2(sentimentSum / total),
      priceAnchorHitRate: round2(priceHits / total),
    };
  }

  private emptySummary(): SimulationSummary {
    return {
      acceptanceRate: 0,
      rejectionRate: 0,
      maybeRate: 0,
      averageConfidence: 0,
      avgLoopDepth: 0,
      totalPersonas: 0,
      segmentBreakdown: [],
      confidenceDistribution: [],
      topAcceptReasons: [],
      topRejectReasons: [],
      objectionFrequency: [],
      avgSentimentScore: 0,
      priceAnchorHitRate: 0,
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function sortedReasons(counts: Map<string, number>): ReasonEntry[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => ({ reason, count }));
}
