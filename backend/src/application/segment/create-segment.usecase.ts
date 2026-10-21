import { Inject, Injectable } from '@nestjs/common';
import type { SegmentRepository } from '../../domain/segment/segment.repository';
import {
  Segment,
  DemographicCriteria,
  PsychographicTraits,
  BehavioralPatterns,
} from '../../domain/segment/segment';
import { SEGMENT_REPOSITORY } from '../../common/tokens';

export type CreateSegmentInput = {
  workspaceId?: string | null;
  name: string;
  description: string;
  demographicCriteria: DemographicCriteria;
  psychographicTraits: PsychographicTraits;
  behavioralPatterns: BehavioralPatterns;
};

@Injectable()
export class CreateSegmentUseCase {
  constructor(
    @Inject(SEGMENT_REPOSITORY)
    private readonly repository: SegmentRepository,
  ) {}

  async execute(input: CreateSegmentInput): Promise<Segment> {
    const segment = Segment.create({
      workspaceId: input.workspaceId ?? null,
      name: input.name,
      description: input.description,
      demographicCriteria: input.demographicCriteria,
      psychographicTraits: input.psychographicTraits,
      behavioralPatterns: input.behavioralPatterns,
    });

    return this.repository.create(segment);
  }
}
