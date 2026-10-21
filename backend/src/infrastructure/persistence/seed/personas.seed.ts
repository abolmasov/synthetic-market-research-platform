import type {
  CognitiveProfile,
  DecisionStyle,
  Gender,
  HealthProfile,
  PersonalityProfile,
} from '../../../domain/persona/persona';

export interface SeedPersona {
  name: string;
  segment: string;
  age: number;
  gender: Gender;
  location: string;
  income: number;
  occupation: string;
  motivations: string[];
  barriers: string[];
  trustChannel: string;
  purchaseTriggers: string[];
  budgetRange: string;
  contextNotes: string;
  personality: PersonalityProfile;
  healthProfile: HealthProfile;
  cognitiveProfile: CognitiveProfile;
  decisionStyle: DecisionStyle;
}

export const seedPersonas: SeedPersona[] = [
  // 1. Sleepless Optimizer - High Achiever
  {
    name: 'Sarah Chen',
    segment: 'Sleepless Optimizers',
    age: 34,
    gender: 'female',
    location: 'San Francisco, CA',
    income: 185000,
    occupation: 'Product Manager',
    motivations: [
      'career advancement',
      'peak performance',
      'work-life balance',
    ],
    barriers: [
      'time constraints',
      'skepticism of supplements',
      'information overload',
    ],
    trustChannel: 'peer recommendations',
    purchaseTriggers: [
      'clinical studies',
      'executive testimonials',
      'money-back guarantee',
    ],
    budgetRange: '$50-100/month',
    contextNotes:
      'Works at a FAANG company, struggles with sleep due to high stress and screen time.',
    personality: {
      openness: 75,
      conscientiousness: 85,
      extraversion: 60,
      agreeableness: 55,
      neuroticism: 45,
    },
    healthProfile: {
      insomniaSeverity: 6,
      anxietyLevel: 5,
      chronicPain: 1,
      currentSupplements: ['multivitamin', 'vitamin D'],
    },
    cognitiveProfile: {
      lossAversion: 0.4,
      authorityBias: 0.7,
      socialProof: 0.6,
      statusQuoBias: 0.3,
      anchoring: 0.5,
      confirmationBias: 0.4,
    },
    decisionStyle: {
      system1Weight: 0.3,
      priceAnchor: 75,
      riskTolerance: 0.6,
    },
  },

  // 2. Anxious Professional
  {
    name: 'Michael Torres',
    segment: 'Anxious Professionals',
    age: 29,
    gender: 'male',
    location: 'New York, NY',
    income: 95000,
    occupation: 'Investment Banking Associate',
    motivations: ['stress reduction', 'better sleep', 'mental clarity'],
    barriers: ['fear of side effects', 'busy schedule', 'past failed attempts'],
    trustChannel: 'medical professionals',
    purchaseTriggers: [
      'doctor recommendation',
      'natural ingredients',
      'fast results',
    ],
    budgetRange: '$30-60/month',
    contextNotes: 'High-pressure job with long hours, uses alcohol to unwind.',
    personality: {
      openness: 55,
      conscientiousness: 70,
      extraversion: 45,
      agreeableness: 50,
      neuroticism: 75,
    },
    healthProfile: {
      insomniaSeverity: 7,
      anxietyLevel: 8,
      chronicPain: 2,
      currentSupplements: ['magnesium'],
    },
    cognitiveProfile: {
      lossAversion: 0.8,
      authorityBias: 0.8,
      socialProof: 0.5,
      statusQuoBias: 0.6,
      anchoring: 0.7,
      confirmationBias: 0.6,
    },
    decisionStyle: {
      system1Weight: 0.6,
      priceAnchor: 45,
      riskTolerance: 0.3,
    },
  },

  // 3. Budget Guardian - Value Seeker
  {
    name: 'Linda Martinez',
    segment: 'Budget Guardians',
    age: 42,
    gender: 'female',
    location: 'Phoenix, AZ',
    income: 52000,
    occupation: 'Elementary School Teacher',
    motivations: ['family health', 'value for money', 'natural solutions'],
    barriers: ['limited budget', 'too many options', 'distrust of marketing'],
    trustChannel: 'consumer reviews',
    purchaseTriggers: [
      'discounts',
      'family pack options',
      'proven ingredients',
    ],
    budgetRange: '$15-30/month',
    contextNotes:
      'Single mother of two, prioritizes family spending over personal wellness.',
    personality: {
      openness: 45,
      conscientiousness: 80,
      extraversion: 55,
      agreeableness: 75,
      neuroticism: 50,
    },
    healthProfile: {
      insomniaSeverity: 4,
      anxietyLevel: 5,
      chronicPain: 3,
      currentSupplements: [],
    },
    cognitiveProfile: {
      lossAversion: 0.9,
      authorityBias: 0.4,
      socialProof: 0.7,
      statusQuoBias: 0.7,
      anchoring: 0.8,
      confirmationBias: 0.5,
    },
    decisionStyle: {
      system1Weight: 0.4,
      priceAnchor: 20,
      riskTolerance: 0.2,
    },
  },

  // 4. Skeptical Analyst
  {
    name: 'David Park',
    segment: 'Skeptical Analysts',
    age: 38,
    gender: 'male',
    location: 'Seattle, WA',
    income: 145000,
    occupation: 'Data Scientist',
    motivations: [
      'evidence-based solutions',
      'optimization',
      'long-term health',
    ],
    barriers: ['requires proof', 'dislikes hype', 'analysis paralysis'],
    trustChannel: 'scientific journals',
    purchaseTriggers: [
      'peer-reviewed studies',
      'transparent ingredients',
      'data dashboards',
    ],
    budgetRange: '$40-80/month',
    contextNotes:
      'Will spend hours researching before any purchase. Tracks sleep with multiple devices.',
    personality: {
      openness: 80,
      conscientiousness: 90,
      extraversion: 35,
      agreeableness: 45,
      neuroticism: 40,
    },
    healthProfile: {
      insomniaSeverity: 5,
      anxietyLevel: 3,
      chronicPain: 0,
      currentSupplements: ['omega-3', 'vitamin D', 'magnesium glycinate'],
    },
    cognitiveProfile: {
      lossAversion: 0.5,
      authorityBias: 0.3,
      socialProof: 0.2,
      statusQuoBias: 0.4,
      anchoring: 0.3,
      confirmationBias: 0.7,
    },
    decisionStyle: {
      system1Weight: 0.15,
      priceAnchor: 60,
      riskTolerance: 0.5,
    },
  },

  // 5. Wellness Explorer
  {
    name: 'Emma Johnson',
    segment: 'Wellness Explorers',
    age: 27,
    gender: 'female',
    location: 'Austin, TX',
    income: 68000,
    occupation: 'Marketing Coordinator',
    motivations: ['holistic health', 'self-improvement', 'trying new things'],
    barriers: [
      'shiny object syndrome',
      'inconsistent routines',
      'social media influence',
    ],
    trustChannel: 'influencers and podcasts',
    purchaseTriggers: [
      'trending products',
      'aesthetic packaging',
      'community buzz',
    ],
    budgetRange: '$30-70/month',
    contextNotes:
      'Active on wellness TikTok, has tried many supplements with varying commitment.',
    personality: {
      openness: 90,
      conscientiousness: 45,
      extraversion: 80,
      agreeableness: 70,
      neuroticism: 55,
    },
    healthProfile: {
      insomniaSeverity: 3,
      anxietyLevel: 4,
      chronicPain: 1,
      currentSupplements: ['collagen', 'probiotics', 'ashwagandha'],
    },
    cognitiveProfile: {
      lossAversion: 0.3,
      authorityBias: 0.5,
      socialProof: 0.9,
      statusQuoBias: 0.2,
      anchoring: 0.4,
      confirmationBias: 0.5,
    },
    decisionStyle: {
      system1Weight: 0.75,
      priceAnchor: 50,
      riskTolerance: 0.8,
    },
  },

  // 6. Chronic Pain Sufferer
  {
    name: 'Robert Williams',
    segment: 'Chronic Pain Sufferers',
    age: 55,
    gender: 'male',
    location: 'Cleveland, OH',
    income: 78000,
    occupation: 'Construction Foreman',
    motivations: ['pain relief', 'better sleep', 'maintaining work ability'],
    barriers: [
      'medication interactions',
      'doctor skepticism',
      'tried everything',
    ],
    trustChannel: 'support groups',
    purchaseTriggers: [
      'pain relief claims',
      'no prescription needed',
      'real testimonials',
    ],
    budgetRange: '$40-100/month',
    contextNotes:
      'Chronic back pain from work injuries, current sleep is fragmented due to pain.',
    personality: {
      openness: 40,
      conscientiousness: 65,
      extraversion: 50,
      agreeableness: 60,
      neuroticism: 60,
    },
    healthProfile: {
      insomniaSeverity: 7,
      anxietyLevel: 4,
      chronicPain: 8,
      currentSupplements: ['glucosamine', 'turmeric'],
    },
    cognitiveProfile: {
      lossAversion: 0.6,
      authorityBias: 0.5,
      socialProof: 0.6,
      statusQuoBias: 0.5,
      anchoring: 0.6,
      confirmationBias: 0.6,
    },
    decisionStyle: {
      system1Weight: 0.5,
      priceAnchor: 70,
      riskTolerance: 0.4,
    },
  },

  // 7. New Parent
  {
    name: 'Jessica Adams',
    segment: 'New Parents',
    age: 32,
    gender: 'female',
    location: 'Denver, CO',
    income: 110000,
    occupation: 'Software Engineer',
    motivations: [
      'energy restoration',
      'safe while breastfeeding',
      'quick solutions',
    ],
    barriers: ['safety concerns', 'no time for research', 'exhaustion'],
    trustChannel: 'mommy blogs and forums',
    purchaseTriggers: [
      'safe for nursing',
      'pediatrician approved',
      'other mom reviews',
    ],
    budgetRange: '$25-50/month',
    contextNotes:
      '6-month-old baby, working remotely, severely sleep-deprived.',
    personality: {
      openness: 60,
      conscientiousness: 75,
      extraversion: 55,
      agreeableness: 80,
      neuroticism: 65,
    },
    healthProfile: {
      insomniaSeverity: 8,
      anxietyLevel: 6,
      chronicPain: 2,
      currentSupplements: ['prenatal vitamin', 'iron'],
    },
    cognitiveProfile: {
      lossAversion: 0.7,
      authorityBias: 0.7,
      socialProof: 0.8,
      statusQuoBias: 0.4,
      anchoring: 0.5,
      confirmationBias: 0.5,
    },
    decisionStyle: {
      system1Weight: 0.6,
      priceAnchor: 35,
      riskTolerance: 0.2,
    },
  },

  // 8. Senior Active
  {
    name: 'George Thompson',
    segment: 'Active Seniors',
    age: 67,
    gender: 'male',
    location: 'Scottsdale, AZ',
    income: 85000,
    occupation: 'Retired Engineer',
    motivations: [
      'maintaining independence',
      'quality sleep',
      'cognitive health',
    ],
    barriers: [
      'medication interactions',
      'technology barriers',
      'fixed income concerns',
    ],
    trustChannel: 'AARP and senior publications',
    purchaseTriggers: [
      'senior-specific formulas',
      'drug interaction info',
      'simple instructions',
    ],
    budgetRange: '$30-60/month',
    contextNotes:
      'Active golfer, takes multiple medications, wife manages household supplements.',
    personality: {
      openness: 50,
      conscientiousness: 85,
      extraversion: 60,
      agreeableness: 70,
      neuroticism: 35,
    },
    healthProfile: {
      insomniaSeverity: 5,
      anxietyLevel: 2,
      chronicPain: 4,
      currentSupplements: ['fish oil', 'CoQ10', 'vitamin B12'],
    },
    cognitiveProfile: {
      lossAversion: 0.7,
      authorityBias: 0.8,
      socialProof: 0.4,
      statusQuoBias: 0.8,
      anchoring: 0.7,
      confirmationBias: 0.5,
    },
    decisionStyle: {
      system1Weight: 0.35,
      priceAnchor: 45,
      riskTolerance: 0.3,
    },
  },

  // 9. Shift Worker
  {
    name: 'Maria Santos',
    segment: 'Shift Workers',
    age: 36,
    gender: 'female',
    location: 'Chicago, IL',
    income: 62000,
    occupation: 'ER Nurse',
    motivations: [
      'circadian rhythm management',
      'quick sleep onset',
      'non-drowsy wake-up',
    ],
    barriers: [
      'irregular schedule',
      'caffeine dependency',
      'medication timing',
    ],
    trustChannel: 'healthcare colleagues',
    purchaseTriggers: [
      'shift work specific',
      'fast-acting',
      'no hangover effect',
    ],
    budgetRange: '$20-45/month',
    contextNotes:
      'Rotates between day and night shifts, struggles with sleep schedule changes.',
    personality: {
      openness: 55,
      conscientiousness: 80,
      extraversion: 65,
      agreeableness: 75,
      neuroticism: 50,
    },
    healthProfile: {
      insomniaSeverity: 6,
      anxietyLevel: 5,
      chronicPain: 3,
      currentSupplements: ['melatonin'],
    },
    cognitiveProfile: {
      lossAversion: 0.5,
      authorityBias: 0.6,
      socialProof: 0.7,
      statusQuoBias: 0.4,
      anchoring: 0.5,
      confirmationBias: 0.4,
    },
    decisionStyle: {
      system1Weight: 0.55,
      priceAnchor: 30,
      riskTolerance: 0.5,
    },
  },

  // 10. Tech Executive
  {
    name: 'James Liu',
    segment: 'Tech Executives',
    age: 45,
    gender: 'male',
    location: 'Palo Alto, CA',
    income: 450000,
    occupation: 'VP of Engineering',
    motivations: ['biohacking', 'competitive edge', 'longevity'],
    barriers: [
      'too busy to optimize',
      'already tried premium solutions',
      'high expectations',
    ],
    trustChannel: 'biohacking communities',
    purchaseTriggers: [
      'cutting-edge ingredients',
      'personalized solutions',
      'executive endorsements',
    ],
    budgetRange: '$100-300/month',
    contextNotes:
      'Tracks everything with Oura ring, has tried most sleep supplements on market.',
    personality: {
      openness: 85,
      conscientiousness: 90,
      extraversion: 70,
      agreeableness: 40,
      neuroticism: 45,
    },
    healthProfile: {
      insomniaSeverity: 4,
      anxietyLevel: 4,
      chronicPain: 1,
      currentSupplements: ['NMN', 'resveratrol', 'glycine', 'apigenin'],
    },
    cognitiveProfile: {
      lossAversion: 0.3,
      authorityBias: 0.4,
      socialProof: 0.5,
      statusQuoBias: 0.2,
      anchoring: 0.3,
      confirmationBias: 0.6,
    },
    decisionStyle: {
      system1Weight: 0.25,
      priceAnchor: 150,
      riskTolerance: 0.7,
    },
  },

  // 11. College Student
  {
    name: 'Alex Rivera',
    segment: 'Students',
    age: 21,
    gender: 'non-binary',
    location: 'Boston, MA',
    income: 15000,
    occupation: 'Graduate Student',
    motivations: [
      'exam performance',
      'all-nighter recovery',
      'stress management',
    ],
    barriers: ['very limited budget', 'irregular lifestyle', 'peer pressure'],
    trustChannel: 'Reddit and student forums',
    purchaseTriggers: [
      'student discounts',
      'study aid claims',
      'viral recommendations',
    ],
    budgetRange: '$10-25/month',
    contextNotes:
      'PhD candidate in neuroscience, ironic sleep issues given research focus.',
    personality: {
      openness: 85,
      conscientiousness: 70,
      extraversion: 50,
      agreeableness: 65,
      neuroticism: 60,
    },
    healthProfile: {
      insomniaSeverity: 5,
      anxietyLevel: 7,
      chronicPain: 0,
      currentSupplements: ['caffeine pills', 'L-theanine'],
    },
    cognitiveProfile: {
      lossAversion: 0.6,
      authorityBias: 0.3,
      socialProof: 0.7,
      statusQuoBias: 0.3,
      anchoring: 0.6,
      confirmationBias: 0.4,
    },
    decisionStyle: {
      system1Weight: 0.5,
      priceAnchor: 15,
      riskTolerance: 0.6,
    },
  },

  // 12. Menopause Transition
  {
    name: 'Patricia Nelson',
    segment: 'Menopause Transition',
    age: 52,
    gender: 'female',
    location: 'Portland, OR',
    income: 92000,
    occupation: 'HR Director',
    motivations: ['hot flash relief', 'mood stability', 'uninterrupted sleep'],
    barriers: [
      'hormonal complexity',
      'embarrassment discussing',
      'conflicting information',
    ],
    trustChannel: 'OB/GYN and womens health sites',
    purchaseTriggers: [
      'menopause-specific',
      'hormone-free options',
      'cooling properties',
    ],
    budgetRange: '$35-75/month',
    contextNotes:
      'Night sweats disrupting sleep 4-5 times per night, considering HRT.',
    personality: {
      openness: 60,
      conscientiousness: 75,
      extraversion: 55,
      agreeableness: 70,
      neuroticism: 55,
    },
    healthProfile: {
      insomniaSeverity: 7,
      anxietyLevel: 5,
      chronicPain: 2,
      currentSupplements: ['black cohosh', 'evening primrose oil'],
    },
    cognitiveProfile: {
      lossAversion: 0.6,
      authorityBias: 0.7,
      socialProof: 0.5,
      statusQuoBias: 0.5,
      anchoring: 0.5,
      confirmationBias: 0.5,
    },
    decisionStyle: {
      system1Weight: 0.45,
      priceAnchor: 55,
      riskTolerance: 0.4,
    },
  },

  // 13. Fitness Enthusiast
  {
    name: 'Tyler Brooks',
    segment: 'Fitness Enthusiasts',
    age: 28,
    gender: 'male',
    location: 'Miami, FL',
    income: 75000,
    occupation: 'Personal Trainer',
    motivations: [
      'muscle recovery',
      'performance optimization',
      'clean ingredients',
    ],
    barriers: [
      'already taking many supplements',
      'worried about banned substances',
      'taste preferences',
    ],
    trustChannel: 'fitness influencers',
    purchaseTriggers: [
      'sport-certified',
      'recovery claims',
      'athlete endorsements',
    ],
    budgetRange: '$40-80/month',
    contextNotes:
      'Competes in amateur bodybuilding, strict about what goes into body.',
    personality: {
      openness: 65,
      conscientiousness: 85,
      extraversion: 80,
      agreeableness: 55,
      neuroticism: 35,
    },
    healthProfile: {
      insomniaSeverity: 3,
      anxietyLevel: 3,
      chronicPain: 2,
      currentSupplements: ['protein powder', 'creatine', 'BCAAs', 'ZMA'],
    },
    cognitiveProfile: {
      lossAversion: 0.4,
      authorityBias: 0.5,
      socialProof: 0.8,
      statusQuoBias: 0.3,
      anchoring: 0.4,
      confirmationBias: 0.5,
    },
    decisionStyle: {
      system1Weight: 0.5,
      priceAnchor: 60,
      riskTolerance: 0.6,
    },
  },

  // 14. Remote Worker
  {
    name: 'Aisha Patel',
    segment: 'Remote Workers',
    age: 31,
    gender: 'female',
    location: 'Nashville, TN',
    income: 88000,
    occupation: 'UX Designer',
    motivations: [
      'work-from-home balance',
      'screen fatigue relief',
      'consistent energy',
    ],
    barriers: [
      'blurred work-life boundaries',
      'sedentary lifestyle',
      'zoom fatigue',
    ],
    trustChannel: 'remote work communities',
    purchaseTriggers: [
      'productivity claims',
      'blue light mentions',
      'subscription convenience',
    ],
    budgetRange: '$25-55/month',
    contextNotes:
      'Has been remote for 4 years, bedroom doubles as office, struggles to disconnect.',
    personality: {
      openness: 70,
      conscientiousness: 65,
      extraversion: 40,
      agreeableness: 75,
      neuroticism: 50,
    },
    healthProfile: {
      insomniaSeverity: 5,
      anxietyLevel: 4,
      chronicPain: 3,
      currentSupplements: ['blue light glasses', 'vitamin D'],
    },
    cognitiveProfile: {
      lossAversion: 0.5,
      authorityBias: 0.4,
      socialProof: 0.6,
      statusQuoBias: 0.5,
      anchoring: 0.5,
      confirmationBias: 0.4,
    },
    decisionStyle: {
      system1Weight: 0.5,
      priceAnchor: 40,
      riskTolerance: 0.5,
    },
  },

  // 15. Frequent Traveler
  {
    name: 'Christopher Wright',
    segment: 'Frequent Travelers',
    age: 41,
    gender: 'male',
    location: 'Atlanta, GA',
    income: 135000,
    occupation: 'Management Consultant',
    motivations: [
      'jet lag management',
      'hotel sleep quality',
      'travel convenience',
    ],
    barriers: [
      'TSA restrictions',
      'inconsistent access',
      'multiple time zones',
    ],
    trustChannel: 'business travel blogs',
    purchaseTriggers: [
      'travel-friendly packaging',
      'jet lag claims',
      'premium airline partnerships',
    ],
    budgetRange: '$50-100/month',
    contextNotes:
      'Travels 150+ days per year, has tried everything from melatonin to prescription sleep aids.',
    personality: {
      openness: 70,
      conscientiousness: 80,
      extraversion: 75,
      agreeableness: 50,
      neuroticism: 45,
    },
    healthProfile: {
      insomniaSeverity: 6,
      anxietyLevel: 4,
      chronicPain: 2,
      currentSupplements: ['melatonin', 'magnesium'],
    },
    cognitiveProfile: {
      lossAversion: 0.4,
      authorityBias: 0.5,
      socialProof: 0.5,
      statusQuoBias: 0.3,
      anchoring: 0.4,
      confirmationBias: 0.4,
    },
    decisionStyle: {
      system1Weight: 0.4,
      priceAnchor: 75,
      riskTolerance: 0.6,
    },
  },
];
