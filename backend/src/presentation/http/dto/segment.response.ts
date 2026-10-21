import {
  Segment,
  DemographicCriteria,
  PsychographicTraits,
  BehavioralPatterns,
} from '../../../domain/segment/segment';

export type SegmentResponse = {
  id: string;
  name: string;
  description: string;
  demographicCriteria: DemographicCriteria;
  psychographicTraits: PsychographicTraits;
  behavioralPatterns: BehavioralPatterns;
  createdAt: string;
  updatedAt: string;
};

export const toSegmentResponse = (segment: Segment): SegmentResponse => ({
  id: segment.id ?? '',
  name: segment.name,
  description: segment.description,
  demographicCriteria: segment.demographicCriteria,
  psychographicTraits: segment.psychographicTraits,
  behavioralPatterns: segment.behavioralPatterns,
  createdAt: segment.createdAt?.toISOString() ?? new Date().toISOString(),
  updatedAt: segment.updatedAt?.toISOString() ?? new Date().toISOString(),
});
