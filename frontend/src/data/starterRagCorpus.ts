export type StarterRagDocument = {
  title: string;
  sourceType: string;
  industry: string;
  url: string;
  text: string;
};

const coreCorpus: StarterRagDocument[] = [
  {
    title: 'Consumer Stress and Sleep Quality Trends (2025)',
    sourceType: 'market-report',
    industry: 'wellness',
    url: 'https://example.com/reports/stress-sleep-2025',
    text: 'Across urban professionals, stress and fragmented sleep remain top concerns. Users respond best to interventions that combine measurable outcomes, short onboarding, and low-friction daily routines.',
  },
  {
    title: 'Supplement Purchase Drivers by Income Tier',
    sourceType: 'survey',
    industry: 'healthcare',
    url: 'https://example.com/reports/supplement-drivers-income',
    text: 'Lower and mid-income buyers prioritize transparent ingredient sourcing, subscription flexibility, and clear value over premium branding. Higher-income buyers value evidence depth and clinician endorsement.',
  },
  {
    title: 'Digital Trust Benchmarks in Health E-commerce',
    sourceType: 'analysis',
    industry: 'ecommerce',
    url: 'https://example.com/reports/digital-trust-health',
    text: 'Trust increases when product pages include side-effect disclosures, third-party testing badges, and realistic expectations. Aggressive claim language correlates with higher rejection rates.',
  },
  {
    title: 'Behavioral Segmentation Patterns for Sleep Apps',
    sourceType: 'whitepaper',
    industry: 'software',
    url: 'https://example.com/reports/sleep-app-segments',
    text: 'Users cluster into routine seekers, optimization hobbyists, and skeptical experimenters. Routine seekers convert with clear habit plans, while skeptics require evidence and cancellation safety.',
  },
  {
    title: 'Pricing Elasticity for Preventive Wellness Products',
    sourceType: 'market-report',
    industry: 'wellness',
    url: 'https://example.com/reports/wellness-pricing-elasticity',
    text: 'Acceptance declines sharply above the mid-price threshold unless the offer includes trial options, guarantees, or bundled convenience. Price-anchor transparency reduces objections.',
  },
  {
    title: 'Gen Z and Millennial Purchase Friction Signals',
    sourceType: 'survey',
    industry: 'consumer-insights',
    url: 'https://example.com/reports/purchase-friction-genz-millennials',
    text: 'Strong friction signals are hidden fees, long setup flows, unclear results timelines, and social proof that feels fabricated. Short videos and peer-style testimonials increase confidence.',
  },
  {
    title: 'Subscription Churn Drivers in Health Products',
    sourceType: 'analysis',
    industry: 'subscription',
    url: 'https://example.com/reports/health-subscription-churn',
    text: 'Churn rises when customers do not perceive progress in the first two weeks. Retention improves with weekly milestone messaging, adaptive reminders, and easy pause controls.',
  },
  {
    title: 'Retailer Channel Trust by Persona Archetype',
    sourceType: 'market-report',
    industry: 'retail',
    url: 'https://example.com/reports/channel-trust-archetypes',
    text: 'Analytical buyers trust expert blogs and comparison sites. Social buyers trust creator communities, and value-driven buyers trust marketplace reviews with verified-purchase labels.',
  },
  {
    title: 'Claims Language and Conversion Quality',
    sourceType: 'experiment',
    industry: 'marketing',
    url: 'https://example.com/reports/claims-language-conversion',
    text: 'Claims that pair benefit and limitation outperform exaggerated promises. Balanced language increases both acceptance and post-purchase confidence, reducing buyer remorse.',
  },
  {
    title: 'Time-to-Value Expectations in Busy Professionals',
    sourceType: 'survey',
    industry: 'productivity',
    url: 'https://example.com/reports/time-to-value-professionals',
    text: 'Busy professionals expect visible value within 7 to 14 days. They reject products requiring complex setup or uncertain routines, while strong onboarding scripts improve retention.',
  },
  {
    title: 'Objection Taxonomy for Functional Wellness Offers',
    sourceType: 'taxonomy',
    industry: 'wellness',
    url: 'https://example.com/reports/objection-taxonomy-wellness',
    text: 'Top objections include price-to-value mismatch, doubt about efficacy, concern about side effects, and concern about consistency requirements. Objection handling must be specific and evidence-based.',
  },
  {
    title: 'Global Trend Snapshot: Preventive Health Spending',
    sourceType: 'trend-brief',
    industry: 'healthcare',
    url: 'https://example.com/reports/preventive-health-spending',
    text: 'Preventive health spending is growing across major markets, with strongest growth in stress management, sleep support, and personalized routine optimization solutions.',
  },
];

const thematicBriefs = [
  {
    slug: 'ingredient-transparency',
    title: 'Ingredient Transparency Impact Study',
    industry: 'healthcare',
    primarySignal:
      'clear sourcing and third-party test visibility consistently improve acceptance among first-time buyers',
    riskNote: 'missing safety details trigger trust breakdown during evaluation',
    recommendedAction:
      'publish ingredient provenance and test summaries directly in offer copy',
  },
  {
    slug: 'trial-mechanics',
    title: 'Trial Mechanics and Conversion Quality',
    industry: 'subscription',
    primarySignal:
      'time-boxed trials with visible milestones convert better than unstructured free access',
    riskNote: 'ambiguous trial boundaries increase cancellation anxiety',
    recommendedAction:
      'pair trials with clear day-7 and day-14 expected outcomes',
  },
  {
    slug: 'price-anchor-communication',
    title: 'Price Anchor Communication Benchmarks',
    industry: 'ecommerce',
    primarySignal:
      'anchored pricing with explicit comparison context improves perceived fairness',
    riskNote: 'unclear discount logic can be interpreted as manipulative',
    recommendedAction:
      'show original benchmark and the reason for current pricing in plain language',
  },
  {
    slug: 'evidence-storytelling',
    title: 'Evidence Storytelling in Wellness Funnels',
    industry: 'marketing',
    primarySignal:
      'claims connected to measurable outcomes outperform broad aspirational language',
    riskNote: 'outcome claims without method transparency reduce confidence',
    recommendedAction:
      'link evidence to a concrete user scenario and timeline',
  },
  {
    slug: 'onboarding-friction',
    title: 'Onboarding Friction Diagnostics',
    industry: 'software',
    primarySignal:
      'setup flows under five minutes materially improve completion and early retention',
    riskNote: 'multi-step forms with unclear progress cause drop-off',
    recommendedAction:
      'reduce first-session steps and surface immediate value cues',
  },
  {
    slug: 'social-proof-quality',
    title: 'Social Proof Quality and Decision Confidence',
    industry: 'consumer-insights',
    primarySignal:
      'specific testimonials with context increase confidence more than generic positive reviews',
    riskNote: 'low-specificity social proof is perceived as synthetic',
    recommendedAction:
      'highlight verified outcomes, context, and constraints in testimonials',
  },
  {
    slug: 'routine-fit',
    title: 'Routine-Fit Optimization in Habit Products',
    industry: 'wellness',
    primarySignal:
      'products that align with existing routines outperform products requiring behavior overhaul',
    riskNote: 'high routine disruption raises maybe/reject outcomes',
    recommendedAction:
      'position the product as an extension of an existing habit trigger',
  },
  {
    slug: 'channel-trust',
    title: 'Trust Channel Performance by Segment',
    industry: 'retail',
    primarySignal:
      'decision confidence improves when the message appears in channels already trusted by the segment',
    riskNote: 'cross-channel inconsistency undermines credibility',
    recommendedAction:
      'align core claims across marketplace, community, and landing page content',
  },
  {
    slug: 'objection-response-design',
    title: 'Objection Response Design Patterns',
    industry: 'productivity',
    primarySignal:
      'objection responses tied to concrete safeguards improve final acceptance',
    riskNote: 'generic reassurance language does not reduce perceived risk',
    recommendedAction:
      'map top objections to one explicit proof point and one risk-control mechanism',
  },
  {
    slug: 'retention-signals',
    title: 'Early Retention Signal Benchmarks',
    industry: 'subscription',
    primarySignal:
      'users retained beyond week two report clear progress indicators and flexible control options',
    riskNote: 'lack of progress visibility causes early disengagement',
    recommendedAction:
      'add weekly check-ins and visible progress snapshots',
  },
] as const;

const personaAngles = [
  {
    key: 'busy-professionals',
    label: 'Busy Professionals',
    buyingContext:
      'time-constrained evaluators who prefer low-friction setup and evidence in concise formats',
    trustProof:
      'before-and-after outcomes with realistic timelines',
    commonObjection: 'uncertain payoff relative to effort required',
  },
  {
    key: 'price-sensitive-families',
    label: 'Price-Sensitive Families',
    buyingContext:
      'household decision makers balancing quality claims against budget predictability',
    trustProof: 'transparent pricing and flexible cancellation terms',
    commonObjection: 'recurring spend without guaranteed value',
  },
  {
    key: 'optimization-enthusiasts',
    label: 'Optimization Enthusiasts',
    buyingContext:
      'high-interest users comparing granular feature and evidence depth before committing',
    trustProof: 'methodology transparency and comparative benchmarks',
    commonObjection: 'surface-level claims without mechanism detail',
  },
  {
    key: 'skeptical-first-time-buyers',
    label: 'Skeptical First-Time Buyers',
    buyingContext:
      'new category entrants requiring strong risk-reduction and proof before action',
    trustProof: 'safety disclosures and third-party validation',
    commonObjection: 'fear of overpromising and underdelivery',
  },
] as const;

const generatedCorpus: StarterRagDocument[] = thematicBriefs.flatMap((theme) =>
  personaAngles.map((persona) => ({
    title: `${theme.title} - ${persona.label}`,
    sourceType: 'trend-brief',
    industry: theme.industry,
    url: `https://example.com/reports/${theme.slug}-${persona.key}`,
    text: `This brief analyzes ${persona.label.toLowerCase()} in preventive wellness and adjacent markets. The main signal is that ${theme.primarySignal}. For this audience, the buying context centers on ${persona.buyingContext}. Trust increases when teams provide ${persona.trustProof}. The recurring objection is ${persona.commonObjection}, and the risk pattern shows that ${theme.riskNote}. Recommended go-to-market adjustment: ${theme.recommendedAction}.`,
  })),
);

export const starterRagCorpus: StarterRagDocument[] = [
  ...coreCorpus,
  ...generatedCorpus,
];
