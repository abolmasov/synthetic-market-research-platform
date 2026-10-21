import type { SegmentProps } from '../../../domain/segment/segment';

export type SeedSegment = Omit<SegmentProps, 'id' | 'createdAt' | 'updatedAt'>;

export const seedSegments: SeedSegment[] = [
  {
    name: 'Sleep-Deprived Professionals',
    description:
      'Urban professionals with high stress and reduced sleep quality who value productivity gains.',
    demographicCriteria: {
      ageRange: { min: 27, max: 45 },
      incomeRange: { min: 80, max: 250 },
      locations: ['San Francisco', 'New York', 'Seattle', 'Austin'],
      occupations: ['Product Manager', 'Software Engineer', 'Consultant'],
    },
    psychographicTraits: {
      motivations: ['peak performance', 'stress reduction', 'better focus'],
      barriers: [
        'skepticism of supplements',
        'busy schedule',
        'overwhelming options',
      ],
      values: ['evidence-based products', 'time efficiency', 'convenience'],
      lifestyleAttributes: [
        'high screen time',
        'hybrid work',
        'late-night work',
      ],
    },
    behavioralPatterns: {
      purchaseTriggers: [
        'clinical evidence',
        'peer recommendations',
        'clear ROI claims',
      ],
      trustChannels: [
        'linkedin peers',
        'expert newsletters',
        'workplace communities',
      ],
      decisionStyle: 'analytical',
      brandLoyalty: 'medium',
      priceAnchor: 60,
    },
  },
  {
    name: 'Budget-Conscious Families',
    description:
      'Parents balancing household budgets who prioritize practical and affordable wellness solutions.',
    demographicCriteria: {
      ageRange: { min: 30, max: 52 },
      incomeRange: { min: 35, max: 95 },
      locations: ['Phoenix', 'Dallas', 'Columbus', 'Nashville'],
      occupations: ['Teacher', 'Nurse', 'Operations Coordinator'],
    },
    psychographicTraits: {
      motivations: ['family wellbeing', 'good value', 'safe ingredients'],
      barriers: [
        'price sensitivity',
        'brand distrust',
        'limited time for research',
      ],
      values: ['reliability', 'affordability', 'clarity'],
      lifestyleAttributes: ['family-first planning', 'coupon usage'],
    },
    behavioralPatterns: {
      purchaseTriggers: [
        'discount bundles',
        'positive reviews',
        'money-back guarantee',
      ],
      trustChannels: ['consumer review sites', 'parent groups', 'friends'],
      decisionStyle: 'value-driven',
      brandLoyalty: 'high',
      priceAnchor: 30,
    },
  },
  {
    name: 'Wellness Early Adopters',
    description:
      'Trend-sensitive consumers who actively experiment with new wellness routines and products.',
    demographicCriteria: {
      ageRange: { min: 22, max: 38 },
      incomeRange: { min: 45, max: 140 },
      locations: ['Los Angeles', 'Miami', 'Austin', 'Denver'],
      occupations: ['Marketing Specialist', 'Creator', 'Fitness Coach'],
    },
    psychographicTraits: {
      motivations: [
        'self-optimization',
        'holistic routines',
        'social validation',
      ],
      barriers: ['inconsistency', 'trend fatigue', 'information noise'],
      values: ['innovation', 'community', 'identity signaling'],
      lifestyleAttributes: [
        'active social media presence',
        'multiple routines',
      ],
    },
    behavioralPatterns: {
      purchaseTriggers: [
        'creator endorsements',
        'new launch offers',
        'aesthetic packaging',
      ],
      trustChannels: ['instagram creators', 'wellness podcasts', 'tiktok'],
      decisionStyle: 'social',
      brandLoyalty: 'low',
      priceAnchor: 55,
    },
  },
];
