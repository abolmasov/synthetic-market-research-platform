import type {
  HypothesisProps,
  HypothesisStatus,
} from '../../../domain/hypothesis/hypothesis';

export type SeedHypothesis = Omit<HypothesisProps, 'id' | 'createdAt'>;

const ready: HypothesisStatus = 'ready';

export const seedHypotheses: SeedHypothesis[] = [
  {
    studyId: null,
    stage: 'H1',
    title: 'Subscription Sleep Formula',
    statement:
      'Professionals with sleep and stress issues will adopt a $49/month personalized sleep supplement subscription if it includes evidence-backed ingredients and quick onboarding.',
    status: ready,
    successCriteria:
      'Acceptance rate >= 45% with confidence >= 0.65 among target personas',
    protocolId: 'demo-protocol-01',
    notes:
      'Primary go-to-market validation hypothesis for recurring revenue model.',
  },
  {
    studyId: null,
    stage: 'H2',
    title: 'Family Value Bundle',
    statement:
      'Budget-conscious households will prefer a quarterly family wellness bundle priced at $79 over individual product purchases when supported by clear savings messaging.',
    status: ready,
    successCriteria:
      'Acceptance rate >= 35% and rejection rate < 45% in family-focused segments',
    protocolId: 'demo-protocol-02',
    notes: 'Tests price framing and bundle economics.',
  },
  {
    studyId: null,
    stage: 'H3',
    title: 'Creator-Led Launch Offer',
    statement:
      'Wellness early adopters will respond positively to a limited-time creator-led product launch with social proof and a 20% first-month discount.',
    status: ready,
    successCriteria: 'Acceptance + maybe >= 60% in trend-sensitive personas',
    protocolId: 'demo-protocol-03',
    notes: 'Validates influencer channel fit and urgency mechanics.',
  },
];
