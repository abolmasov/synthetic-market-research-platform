import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SegmentController } from '../presentation/http/segment.controller';
import { CreateSegmentUseCase } from '../application/segment/create-segment.usecase';
import { ListSegmentsUseCase } from '../application/segment/list-segments.usecase';
import { GetSegmentUseCase } from '../application/segment/get-segment.usecase';
import { UpdateSegmentUseCase } from '../application/segment/update-segment.usecase';
import { DeleteSegmentUseCase } from '../application/segment/delete-segment.usecase';
import { GeneratePersonasFromSegmentUseCase } from '../application/segment/generate-personas-from-segment.usecase';
import { SEGMENT_REPOSITORY } from '../common/tokens';
import { TypeormSegmentRepository } from '../infrastructure/persistence/typeorm/segment.repository';
import { SegmentOrmEntity } from '../infrastructure/persistence/typeorm/segment.orm-entity';
import { InMemorySegmentRepository } from '../infrastructure/persistence/in-memory-segment.repository';
import { isDatabaseEnabled } from '../common/runtime-config';
import { PersonaModule } from './persona.module';

const segmentImports = isDatabaseEnabled
  ? [TypeOrmModule.forFeature([SegmentOrmEntity])]
  : [];
const segmentRepository = {
  provide: SEGMENT_REPOSITORY,
  useClass: isDatabaseEnabled
    ? TypeormSegmentRepository
    : InMemorySegmentRepository,
};

@Module({
  imports: [...segmentImports, forwardRef(() => PersonaModule)],
  controllers: [SegmentController],
  providers: [
    CreateSegmentUseCase,
    ListSegmentsUseCase,
    GetSegmentUseCase,
    UpdateSegmentUseCase,
    DeleteSegmentUseCase,
    GeneratePersonasFromSegmentUseCase,
    segmentRepository,
  ],
  exports: [SEGMENT_REPOSITORY],
})
export class SegmentModule {}
