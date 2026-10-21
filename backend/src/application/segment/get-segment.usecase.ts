import { Inject, Injectable } from '@nestjs/common';
import type { SegmentRepository } from '../../domain/segment/segment.repository';
import { SEGMENT_REPOSITORY } from '../../common/tokens';
import { Segment } from '../../domain/segment/segment';

@Injectable()
export class GetSegmentUseCase {
  constructor(
    @Inject(SEGMENT_REPOSITORY)
    private readonly repository: SegmentRepository,
  ) {}

  async execute(id: string, workspaceId?: string): Promise<Segment | null> {
    return this.repository.findById(id, workspaceId);
  }
}
