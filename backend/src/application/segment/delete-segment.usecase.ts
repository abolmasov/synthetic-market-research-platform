import { Inject, Injectable } from '@nestjs/common';
import type { SegmentRepository } from '../../domain/segment/segment.repository';
import { SEGMENT_REPOSITORY } from '../../common/tokens';

@Injectable()
export class DeleteSegmentUseCase {
  constructor(
    @Inject(SEGMENT_REPOSITORY)
    private readonly repository: SegmentRepository,
  ) {}

  async execute(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
