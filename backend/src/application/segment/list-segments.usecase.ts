import { Inject, Injectable } from '@nestjs/common';
import type { SegmentRepository } from '../../domain/segment/segment.repository';
import { SEGMENT_REPOSITORY } from '../../common/tokens';
import { Segment } from '../../domain/segment/segment';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';

@Injectable()
export class ListSegmentsUseCase {
  constructor(
    @Inject(SEGMENT_REPOSITORY)
    private readonly repository: SegmentRepository,
  ) {}

  execute(): Promise<Segment[]>;
  execute(pagination: PaginationOptions): Promise<PaginatedResult<Segment>>;
  execute(
    pagination?: PaginationOptions,
  ): Promise<Segment[] | PaginatedResult<Segment>> {
    if (pagination) {
      return this.repository.findAllPaginated(pagination);
    }
    return this.repository.findAll();
  }
}
