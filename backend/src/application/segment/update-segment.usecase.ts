import { Inject, Injectable } from '@nestjs/common';
import type { SegmentRepository } from '../../domain/segment/segment.repository';
import {
  Segment,
  DemographicCriteria,
  PsychographicTraits,
  BehavioralPatterns,
} from '../../domain/segment/segment';
import { SEGMENT_REPOSITORY } from '../../common/tokens';

export type UpdateSegmentInput = {
  name?: string;
  description?: string;
  demographicCriteria?: DemographicCriteria;
  psychographicTraits?: PsychographicTraits;
  behavioralPatterns?: BehavioralPatterns;
};

@Injectable()
export class UpdateSegmentUseCase {
  constructor(
    @Inject(SEGMENT_REPOSITORY)
    private readonly repository: SegmentRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateSegmentInput,
  ): Promise<Segment | null> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }

    const updated = Segment.rehydrate({
      id: existing.id ?? id,
      createdAt: existing.createdAt ?? new Date(),
      updatedAt: new Date(),
      name: input.name ?? existing.name,
      description: input.description ?? existing.description,
      demographicCriteria:
        input.demographicCriteria ?? existing.demographicCriteria,
      psychographicTraits:
        input.psychographicTraits ?? existing.psychographicTraits,
      behavioralPatterns:
        input.behavioralPatterns ?? existing.behavioralPatterns,
    });

    return this.repository.update(updated);
  }
}
