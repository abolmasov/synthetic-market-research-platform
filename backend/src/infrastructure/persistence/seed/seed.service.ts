import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HYPOTHESIS_REPOSITORY,
  PERSONA_REPOSITORY,
  SEGMENT_REPOSITORY,
  SIMULATION_REPOSITORY,
} from '../../../common/tokens';
import { Hypothesis } from '../../../domain/hypothesis/hypothesis';
import type { HypothesisRepository } from '../../../domain/hypothesis/hypothesis.repository';
import { Persona } from '../../../domain/persona/persona';
import type { PersonaRepository } from '../../../domain/persona/persona.repository';
import { Segment } from '../../../domain/segment/segment';
import type { SegmentRepository } from '../../../domain/segment/segment.repository';
import {
  Simulation,
  type SimulationDecision,
  type SimulationSummary,
} from '../../../domain/simulation/simulation';
import type { SimulationRepository } from '../../../domain/simulation/simulation.repository';
import { DocumentIngestionService } from '../../rag/document-ingestion.service';
import { seedHypotheses as seedHypothesesData } from './hypotheses.seed';
import { seedPersonas as seedPersonasData } from './personas.seed';
import { seedSegments as seedSegmentsData } from './segments.seed';
import { seedRagDocuments } from './rag.seed';

export type SeedMode = 'demo' | 'random';

export type SeedOptions = {
  mode?: SeedMode;
  overwrite?: boolean;
  count?: number;
};

export type SeedStats = {
  created: number;
  skipped: number;
  total: number;
};

export type ClearStats = {
  deleted: number;
};

export type SeedAllResult = {
  personas: SeedStats;
  segments: SeedStats;
  hypotheses: SeedStats;
  simulations: SeedStats;
  ragDocuments: SeedStats;
};

export type ClearAllResult = {
  personas: ClearStats;
  segments: ClearStats;
  hypotheses: ClearStats;
  simulations: ClearStats;
  ragChunks: ClearStats;
};

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @Inject(PERSONA_REPOSITORY)
    private readonly personaRepository: PersonaRepository,
    @Inject(SEGMENT_REPOSITORY)
    private readonly segmentRepository: SegmentRepository,
    @Inject(HYPOTHESIS_REPOSITORY)
    private readonly hypothesisRepository: HypothesisRepository,
    @Inject(SIMULATION_REPOSITORY)
    private readonly simulationRepository: SimulationRepository,
    private readonly configService: ConfigService,
    @Optional()
    @Inject(DocumentIngestionService)
    private readonly ingestionService?: DocumentIngestionService,
  ) {}

  async onModuleInit() {
    const seedEnabled =
      this.configService.get<string>('SEED_ENABLED') === 'true';

    if (!seedEnabled) {
      this.logger.log('Seeding disabled. Set SEED_ENABLED=true to enable.');
      return;
    }

    const result = await this.seedPersonas();
    this.logger.log(
      `Persona startup seed complete. created=${result.created}, skipped=${result.skipped}`,
    );
  }

  async seedAll(): Promise<SeedAllResult> {
    const personas = await this.seedPersonas();
    const segments = await this.seedSegments();
    const hypotheses = await this.seedHypotheses();
    const simulations = await this.seedSimulations();
    const ragDocuments = await this.seedRagDocuments();

    return { personas, segments, hypotheses, simulations, ragDocuments };
  }

  async seedPersonas(options: SeedOptions = {}): Promise<SeedStats> {
    const mode: SeedMode = options.mode ?? 'demo';
    const overwrite = options.overwrite === true;
    const requestedCount = options.count;

    if (overwrite) {
      await this.clearPersonas();
    }

    const sourceData =
      mode === 'demo'
        ? seedPersonasData
        : this.generatePersonas(
            Math.min(Math.max(requestedCount ?? 12, 1), 50),
          );

    const existing = await this.personaRepository.findAll();
    const existingKeys = new Set(existing.map((persona) => persona.name));

    let created = 0;
    for (const seedData of sourceData) {
      if (existingKeys.has(seedData.name)) {
        continue;
      }

      const persona = Persona.create({
        name: seedData.name,
        segment: seedData.segment,
        age: seedData.age,
        gender: seedData.gender,
        location: seedData.location,
        income: seedData.income,
        occupation: seedData.occupation,
        motivations: seedData.motivations,
        barriers: seedData.barriers,
        trustChannel: seedData.trustChannel,
        purchaseTriggers: seedData.purchaseTriggers,
        budgetRange: seedData.budgetRange,
        contextNotes: seedData.contextNotes,
        personality: seedData.personality,
        healthProfile: seedData.healthProfile,
        cognitiveProfile: seedData.cognitiveProfile,
        decisionStyle: seedData.decisionStyle,
      });

      await this.personaRepository.create(persona);
      existingKeys.add(seedData.name);
      created += 1;
    }

    const total = sourceData.length;
    const skipped = total - created;
    this.logger.log(
      `Personas seed (${mode}${overwrite ? ', overwrite' : ''}) complete. created=${created}, skipped=${skipped}, total=${total}`,
    );
    return { created, skipped, total };
  }

  async seedSegments(options: SeedOptions = {}): Promise<SeedStats> {
    const mode: SeedMode = options.mode ?? 'demo';
    const overwrite = options.overwrite === true;
    const requestedCount = options.count;

    if (overwrite) {
      await this.clearSegments();
    }

    const sourceData =
      mode === 'demo'
        ? seedSegmentsData
        : this.generateSegments(Math.min(Math.max(requestedCount ?? 6, 1), 30));

    const existing = await this.segmentRepository.findAll();
    const existingKeys = new Set(existing.map((segment) => segment.name));

    let created = 0;
    for (const seedData of sourceData) {
      if (existingKeys.has(seedData.name)) {
        continue;
      }

      const segment = Segment.create(seedData);
      await this.segmentRepository.create(segment);
      existingKeys.add(seedData.name);
      created += 1;
    }

    const total = sourceData.length;
    const skipped = total - created;
    this.logger.log(
      `Segments seed (${mode}${overwrite ? ', overwrite' : ''}) complete. created=${created}, skipped=${skipped}, total=${total}`,
    );
    return { created, skipped, total };
  }

  async seedHypotheses(options: SeedOptions = {}): Promise<SeedStats> {
    const mode: SeedMode = options.mode ?? 'demo';
    const overwrite = options.overwrite === true;
    const requestedCount = options.count;

    if (overwrite) {
      await this.clearHypotheses();
    }

    const sourceData =
      mode === 'demo'
        ? seedHypothesesData
        : this.generateHypotheses(
            Math.min(Math.max(requestedCount ?? 5, 1), 30),
          );

    const existing = await this.hypothesisRepository.findAll();
    const existingKeys = new Set(
      existing.map((hypothesis) => hypothesis.title),
    );

    let created = 0;
    for (const seedData of sourceData) {
      if (existingKeys.has(seedData.title)) {
        continue;
      }

      const hypothesis = Hypothesis.create(seedData);
      await this.hypothesisRepository.create(hypothesis);
      existingKeys.add(seedData.title);
      created += 1;
    }

    const total = sourceData.length;
    const skipped = total - created;
    this.logger.log(
      `Hypotheses seed (${mode}${overwrite ? ', overwrite' : ''}) complete. created=${created}, skipped=${skipped}, total=${total}`,
    );
    return { created, skipped, total };
  }

  async seedSimulations(options: SeedOptions = {}): Promise<SeedStats> {
    const mode: SeedMode = options.mode ?? 'demo';
    const overwrite = options.overwrite === true;

    if (overwrite) {
      await this.clearSimulations();
    }

    // Ensure prerequisites exist. For random mode, generate some if needed.
    const personasSeedResult = await this.seedPersonas({
      mode,
      overwrite: false,
      count: mode === 'random' ? 16 : undefined,
    });
    const hypothesesSeedResult = await this.seedHypotheses({
      mode,
      overwrite: false,
      count: mode === 'random' ? 6 : undefined,
    });

    if (personasSeedResult.created > 0 || hypothesesSeedResult.created > 0) {
      this.logger.log('Ensured personas/hypotheses before simulation seeding.');
    }

    const personas = await this.personaRepository.findAll();
    const hypotheses = await this.hypothesisRepository.findAll();
    const existingSimulations = await this.simulationRepository.findAll();

    if (personas.length === 0 || hypotheses.length === 0) {
      return { created: 0, skipped: 0, total: 0 };
    }

    const existingByHypothesis = new Set(
      existingSimulations.map((simulation) => simulation.hypothesis),
    );

    const targets = hypotheses.slice(0, mode === 'random' ? 3 : 2);
    let created = 0;

    for (const hypothesis of targets) {
      if (existingByHypothesis.has(hypothesis.statement)) {
        continue;
      }

      const decisions = personas
        .slice(0, 10)
        .map((persona) =>
          this.buildSeedDecision(persona, hypothesis.statement),
        );
      const summary = this.buildSummary(decisions);
      const objections = this.extractTopObjections(decisions);

      const simulation = Simulation.create({
        hypothesis: hypothesis.statement,
        hypothesisId: hypothesis.id ?? null,
        status: 'completed',
        summary,
        decisions,
        ragSources: [
          {
            title: 'Demo market report: sleep economy trends',
            url: 'https://example.com/research/sleep-economy',
            snippet:
              'Consumers with high stress show stronger intent for guided sleep improvement products.',
            relevanceScore: 0.91,
          },
          {
            title: 'Demo survey: supplement trust factors',
            url: 'https://example.com/research/supplement-trust',
            snippet:
              'Clinical proof and transparent ingredient lists are top conversion drivers.',
            relevanceScore: 0.84,
          },
        ],
        topSignals: [
          'Evidence-backed claims increase trust',
          'Price sensitivity remains a core objection',
          'Convenience and routine fit drive acceptance',
        ],
        objections,
        completedAt: new Date(),
      });

      await this.simulationRepository.create(simulation);
      existingByHypothesis.add(hypothesis.statement);
      created += 1;
    }

    const total = targets.length;
    const skipped = total - created;
    this.logger.log(
      `Simulations seed (${mode}${overwrite ? ', overwrite' : ''}) complete. created=${created}, skipped=${skipped}, total=${total}`,
    );
    return { created, skipped, total };
  }

  private buildSeedDecision(
    persona: Persona,
    hypothesisStatement: string,
  ): SimulationDecision {
    const segment = persona.segment.toLowerCase();
    const budget = persona.budgetRange.toLowerCase();

    let decision: 'accept' | 'reject' | 'maybe' = 'maybe';
    let confidence = 0.58;

    if (segment.includes('sleepless') || segment.includes('wellness')) {
      decision = 'accept';
      confidence = 0.76;
    } else if (
      segment.includes('budget') ||
      budget.includes('$10-25') ||
      budget.includes('$15-30')
    ) {
      decision = 'reject';
      confidence = 0.68;
    }

    const firstBarrier = persona.barriers[0] ?? 'price sensitivity';
    const firstMotivation = persona.motivations[0] ?? 'better sleep';

    return {
      personaId: persona.id ?? `seed-${persona.name}`,
      name: persona.name,
      segment: persona.segment,
      age: persona.age ?? null,
      gender: persona.gender ?? null,
      occupation: persona.occupation ?? null,
      income: persona.income ?? null,
      location: persona.location ?? null,
      decision,
      confidence,
      system1: `My first reaction: this could help with ${firstMotivation}, but I worry about ${firstBarrier}.`,
      system2: `Considering my budget (${persona.budgetRange}) and priorities, this offer is a ${decision} for me regarding: ${hypothesisStatement}`,
      reasons:
        decision === 'accept'
          ? [
              `Strong alignment with motivation: ${firstMotivation}`,
              'Perceived convenience and clear value proposition',
            ]
          : decision === 'reject'
            ? [
                `Primary barrier remains: ${firstBarrier}`,
                'Price-to-value ratio feels uncertain',
              ]
            : [
                `Needs stronger evidence to resolve: ${firstBarrier}`,
                'Interest exists but commitment is not clear yet',
              ],
      loopDepth: 1,
      sentimentScore:
        decision === 'accept' ? 0.4 : decision === 'reject' ? -0.4 : 0,
      priceAnchorHit: false,
    };
  }

  private buildSummary(decisions: SimulationDecision[]): SimulationSummary {
    const total = decisions.length;
    const accept = decisions.filter((d) => d.decision === 'accept');
    const reject = decisions.filter((d) => d.decision === 'reject');
    const maybe = decisions.filter((d) => d.decision === 'maybe');

    const averageConfidence =
      decisions.reduce((sum, d) => sum + d.confidence, 0) / Math.max(total, 1);
    const avgLoopDepth =
      decisions.reduce((sum, d) => sum + d.loopDepth, 0) / Math.max(total, 1);

    // Segment breakdown
    const segMap = new Map<
      string,
      {
        total: number;
        accept: number;
        reject: number;
        maybe: number;
        confSum: number;
      }
    >();
    for (const d of decisions) {
      const s = segMap.get(d.segment) ?? {
        total: 0,
        accept: 0,
        reject: 0,
        maybe: 0,
        confSum: 0,
      };
      s.total++;
      s[d.decision]++;
      s.confSum += d.confidence;
      segMap.set(d.segment, s);
    }
    const segmentBreakdown = [...segMap.entries()].map(([segment, s]) => ({
      segment,
      total: s.total,
      accept: s.accept,
      reject: s.reject,
      maybe: s.maybe,
      acceptRate: Math.round((s.accept / s.total) * 100) / 100,
      rejectRate: Math.round((s.reject / s.total) * 100) / 100,
      maybeRate: Math.round((s.maybe / s.total) * 100) / 100,
      avgConfidence: Math.round((s.confSum / s.total) * 100) / 100,
    }));

    // Confidence distribution
    const buckets = [
      { label: '0–39%', min: 0, max: 0.39 },
      { label: '40–59%', min: 0.4, max: 0.59 },
      { label: '60–79%', min: 0.6, max: 0.79 },
      { label: '80–100%', min: 0.8, max: 1.0 },
    ];
    const confidenceDistribution = buckets.map((b) => {
      const count = decisions.filter(
        (d) => d.confidence >= b.min && d.confidence <= b.max,
      ).length;
      return {
        ...b,
        count,
        rate: Math.round((count / Math.max(total, 1)) * 100) / 100,
      };
    });

    // Top reasons
    const acceptReasonsMap = new Map<string, number>();
    const rejectReasonsMap = new Map<string, number>();
    for (const d of decisions) {
      const map = d.decision === 'accept' ? acceptReasonsMap : rejectReasonsMap;
      for (const r of d.reasons) map.set(r, (map.get(r) ?? 0) + 1);
    }
    const toSorted = (m: Map<string, number>) =>
      [...m.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([reason, count]) => ({ reason, count }));

    return {
      acceptanceRate: accept.length / Math.max(total, 1),
      rejectionRate: reject.length / Math.max(total, 1),
      maybeRate: maybe.length / Math.max(total, 1),
      averageConfidence,
      avgLoopDepth,
      totalPersonas: total,
      segmentBreakdown,
      confidenceDistribution,
      topAcceptReasons: toSorted(acceptReasonsMap),
      topRejectReasons: toSorted(rejectReasonsMap),
      objectionFrequency: toSorted(rejectReasonsMap),
      avgSentimentScore: 0,
      priceAnchorHitRate: 0,
    };
  }

  private extractTopObjections(decisions: SimulationDecision[]): string[] {
    const rejected = decisions.filter(
      (decision) => decision.decision === 'reject',
    );
    const allReasons = rejected.flatMap((decision) => decision.reasons);
    const counts = new Map<string, number>();

    for (const reason of allReasons) {
      counts.set(reason, (counts.get(reason) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([reason]) => reason);
  }

  async seedRagDocuments(): Promise<SeedStats> {
    if (!this.ingestionService) {
      this.logger.warn(
        'RAG ingestion service not available. Set RAG_PROVIDER=pgvector and DB_ENABLED=true to enable RAG seeding.',
      );
      return { created: 0, skipped: 0, total: 0 };
    }

    let created = 0;
    let skipped = 0;

    this.logger.log(
      `Starting RAG document seed. Total documents to process: ${seedRagDocuments.length}`,
    );

    // Check for existing documents to avoid duplicates
    const existingStats = await this.ingestionService.getStats();
    if (existingStats.totalChunks > 0) {
      this.logger.log(
        `RAG corpus already contains ${existingStats.totalChunks} chunks. Skipping seed to avoid duplicates.`,
      );
      return {
        created: 0,
        skipped: seedRagDocuments.length,
        total: seedRagDocuments.length,
      };
    }

    for (const doc of seedRagDocuments) {
      try {
        const chunksCreated = await this.ingestionService.ingestText(
          doc.content,
          {
            title: doc.title,
            sourceType: doc.sourceType,
            industry: doc.industry,
            url: doc.url,
          },
        );
        created += 1;
        this.logger.log(
          `Seeded document: "${doc.title}" (${chunksCreated} chunks)`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to seed document "${doc.title}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        skipped += 1;
      }
    }

    const total = seedRagDocuments.length;
    this.logger.log(
      `RAG documents seed complete. created=${created}, skipped=${skipped}, total=${total}`,
    );
    return { created, skipped, total };
  }

  async clearPersonas(): Promise<ClearStats> {
    const existing = await this.personaRepository.findAll();
    let deleted = 0;
    for (const persona of existing) {
      if (!persona.id) continue;
      const ok = await this.personaRepository.delete(persona.id);
      if (ok) deleted += 1;
    }
    this.logger.log(`Cleared personas. deleted=${deleted}`);
    return { deleted };
  }

  async clearSegments(): Promise<ClearStats> {
    const existing = await this.segmentRepository.findAll();
    let deleted = 0;
    for (const segment of existing) {
      if (!segment.id) continue;
      const ok = await this.segmentRepository.delete(segment.id);
      if (ok) deleted += 1;
    }
    this.logger.log(`Cleared segments. deleted=${deleted}`);
    return { deleted };
  }

  async clearHypotheses(): Promise<ClearStats> {
    const existing = await this.hypothesisRepository.findAll();
    let deleted = 0;
    for (const hypothesis of existing) {
      if (!hypothesis.id) continue;
      const ok = await this.hypothesisRepository.delete(hypothesis.id);
      if (ok) deleted += 1;
    }
    this.logger.log(`Cleared hypotheses. deleted=${deleted}`);
    return { deleted };
  }

  async clearSimulations(): Promise<ClearStats> {
    const existing = await this.simulationRepository.findAll();
    let deleted = 0;
    for (const simulation of existing) {
      if (!simulation.id) continue;
      const ok = await this.simulationRepository.delete(simulation.id);
      if (ok) deleted += 1;
    }
    this.logger.log(`Cleared simulations. deleted=${deleted}`);
    return { deleted };
  }

  async clearRagChunks(): Promise<ClearStats> {
    if (!this.ingestionService) {
      return { deleted: 0 };
    }
    const deleted = await this.ingestionService.deleteAll();
    this.logger.log(`Cleared RAG chunks. deleted=${deleted}`);
    return { deleted };
  }

  async clearAll(): Promise<ClearAllResult> {
    const simulations = await this.clearSimulations();
    const hypotheses = await this.clearHypotheses();
    const personas = await this.clearPersonas();
    const segments = await this.clearSegments();
    const ragChunks = await this.clearRagChunks();
    return { personas, segments, hypotheses, simulations, ragChunks };
  }

  private generateSegments(count: number): typeof seedSegmentsData {
    const suffix = this.shortId();
    const adjectives = [
      'Budget',
      'Premium',
      'Anxious',
      'Busy',
      'Wellness',
      'Skeptical',
      'Optimistic',
      'Eco',
      'Performance',
    ];
    const nouns = [
      'Professionals',
      'Parents',
      'Students',
      'Night Owls',
      'Biohackers',
      'Planners',
      'Remote Workers',
      'Creators',
      'Caregivers',
    ];
    const locations = [
      'New York',
      'San Francisco',
      'Seattle',
      'Austin',
      'Chicago',
      'Phoenix',
      'Denver',
      'Atlanta',
    ];
    const motivations = [
      'better sleep',
      'stress reduction',
      'more energy',
      'focus',
      'recovery',
      'overall wellness',
    ];
    const barriers = [
      'price sensitivity',
      'skepticism of supplements',
      'busy schedule',
      'fear of side effects',
      'too many options',
    ];
    const values = [
      'evidence-based products',
      'simplicity',
      'affordability',
      'transparency',
      'convenience',
    ];
    const triggers = [
      'clinical evidence',
      'money-back guarantee',
      'positive reviews',
      'bundle savings',
      'expert recommendation',
    ];
    const channels = [
      'consumer reviews',
      'friends',
      'medical professionals',
      'creator content',
      'newsletters',
    ];

    const segments = Array.from({ length: count }, (_, idx) => {
      const name = `${this.pick(adjectives)} ${this.pick(nouns)} (${suffix}-${idx + 1})`;
      return {
        name,
        description: `Generated test segment ${idx + 1} for rapid prototyping.`,
        demographicCriteria: {
          ageRange: {
            min: this.randomInt(18, 35),
            max: this.randomInt(36, 65),
          },
          incomeRange: {
            min: this.randomInt(20, 70),
            max: this.randomInt(80, 250),
          },
          locations: this.pickMany(locations, this.randomInt(2, 4)),
        },
        psychographicTraits: {
          motivations: this.pickMany(motivations, 3),
          barriers: this.pickMany(barriers, 3),
          values: this.pickMany(values, 3),
        },
        behavioralPatterns: {
          purchaseTriggers: this.pickMany(triggers, 3),
          trustChannels: this.pickMany(channels, 3),
          decisionStyle: this.pick([
            'impulsive',
            'analytical',
            'social',
            'value-driven',
          ] as const),
          brandLoyalty: this.pick(['low', 'medium', 'high'] as const),
          priceAnchor: this.randomInt(20, 90),
        },
      };
    });

    // Type-level compatibility with seedSegmentsData (SeedSegment[])
    return segments;
  }

  private generateHypotheses(count: number): typeof seedHypothesesData {
    const suffix = this.shortId();
    const templates = [
      {
        title: 'Subscription Offer',
        statement:
          'Target customers will adopt a subscription priced at ${{price}}/month when the onboarding is under 5 minutes and the benefits are clear.',
      },
      {
        title: 'Value Bundle',
        statement:
          'Budget-sensitive segments will prefer a bundle at ${{price}} if it clearly saves 20% vs individual purchases.',
      },
      {
        title: 'Creator-Led Launch',
        statement:
          'Early adopters will respond to a creator-led launch with a limited-time discount and strong social proof.',
      },
      {
        title: 'Evidence-Based Positioning',
        statement:
          'Skeptical buyers will convert when claims are backed by clear clinical evidence and transparent sourcing.',
      },
    ];

    const hypotheses = Array.from({ length: count }, (_, idx) => {
      const t = this.pick(templates);
      const price = this.randomInt(29, 89);
      return {
        studyId: null,
        stage: this.pick(['H1', 'H2', 'H3'] as const),
        title: `${t.title} (${suffix}-${idx + 1})`,
        statement: t.statement.replace('{{price}}', String(price)),
        status: 'ready' as const,
        successCriteria: 'Acceptance rate >= 40% with confidence >= 0.6',
        protocolId: `gen-protocol-${suffix}`,
        notes: 'Generated test hypothesis.',
      };
    });

    return hypotheses;
  }

  private generatePersonas(count: number): typeof seedPersonasData {
    const suffix = this.shortId();
    const firstNames = [
      'Alex',
      'Jamie',
      'Taylor',
      'Morgan',
      'Jordan',
      'Casey',
      'Riley',
      'Avery',
      'Sam',
      'Cameron',
    ];
    const lastNames = [
      'Chen',
      'Torres',
      'Martinez',
      'Patel',
      'Nguyen',
      'Kim',
      'Johnson',
      'Brown',
      'Garcia',
      'Singh',
    ];
    const segments = [
      'Sleepless Optimizers',
      'Anxious Professionals',
      'Budget Guardians',
      'Wellness Early Adopters',
      'Skeptical Analysts',
    ];
    const locations = [
      'San Francisco, CA',
      'New York, NY',
      'Seattle, WA',
      'Austin, TX',
      'Chicago, IL',
      'Phoenix, AZ',
    ];
    const occupations = [
      'Product Manager',
      'Software Engineer',
      'Teacher',
      'Nurse',
      'Data Analyst',
      'Operations Manager',
      'Founder',
    ];
    const motivations = [
      'better sleep',
      'stress reduction',
      'peak performance',
      'mental clarity',
      'family health',
      'natural solutions',
    ];
    const barriers = [
      'price sensitivity',
      'fear of side effects',
      'busy schedule',
      'skepticism of supplements',
      'information overload',
    ];
    const trustChannels = [
      'consumer reviews',
      'medical professionals',
      'peer recommendations',
      'scientific journals',
      'creator content',
    ];
    const purchaseTriggers = [
      'clinical studies',
      'transparent ingredients',
      'discounts',
      'money-back guarantee',
      'fast results',
    ];
    const budgetRanges = ['$15-30/month', '$30-60/month', '$50-100/month'];

    const personas = Array.from({ length: count }, (_, idx) => {
      const name = `${this.pick(firstNames)} ${this.pick(lastNames)} (${suffix}-${idx + 1})`;
      const age = this.randomInt(22, 58);
      const income = this.randomInt(45, 220) * 1000;
      const gender = this.pick([
        'male',
        'female',
        'non-binary',
        'other',
      ] as const);

      return {
        name,
        segment: this.pick(segments),
        age,
        gender,
        location: this.pick(locations),
        income,
        occupation: this.pick(occupations),
        motivations: this.pickMany(motivations, 3),
        barriers: this.pickMany(barriers, 3),
        trustChannel: this.pick(trustChannels),
        purchaseTriggers: this.pickMany(purchaseTriggers, 3),
        budgetRange: this.pick(budgetRanges),
        contextNotes: 'Generated test persona.',
        personality: {
          openness: this.randomInt(30, 85),
          conscientiousness: this.randomInt(30, 90),
          extraversion: this.randomInt(20, 80),
          agreeableness: this.randomInt(20, 85),
          neuroticism: this.randomInt(15, 85),
        },
        healthProfile: {
          insomniaSeverity: this.randomInt(0, 10),
          anxietyLevel: this.randomInt(0, 10),
          chronicPain: this.randomInt(0, 6),
          currentSupplements: [],
        },
        cognitiveProfile: {
          lossAversion: this.randomFloat(0.2, 0.9),
          authorityBias: this.randomFloat(0.2, 0.9),
          socialProof: this.randomFloat(0.2, 0.9),
          statusQuoBias: this.randomFloat(0.2, 0.9),
          anchoring: this.randomFloat(0.2, 0.9),
          confirmationBias: this.randomFloat(0.2, 0.9),
        },
        decisionStyle: {
          system1Weight: this.randomFloat(0.2, 0.9),
          priceAnchor: this.randomInt(20, 90),
          riskTolerance: this.randomFloat(0.1, 0.9),
        },
      };
    });

    return personas;
  }

  private pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private pickMany<T>(arr: readonly T[], count: number): T[] {
    const copy = [...arr];
    const selected: T[] = [];
    while (selected.length < count && copy.length > 0) {
      const idx = Math.floor(Math.random() * copy.length);
      selected.push(copy.splice(idx, 1)[0]);
    }
    return selected;
  }

  private randomInt(min: number, max: number): number {
    const low = Math.ceil(min);
    const high = Math.floor(max);
    return Math.floor(Math.random() * (high - low + 1)) + low;
  }

  private randomFloat(min: number, max: number): number {
    return Math.round((min + Math.random() * (max - min)) * 100) / 100;
  }

  private shortId(): string {
    return Math.random().toString(36).slice(2, 8);
  }
}
