import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HypothesisController } from '../presentation/http/hypothesis.controller';
import { VariantController } from '../presentation/http/variant.controller';
import { CreateHypothesisUseCase } from '../application/hypothesis/create-hypothesis.usecase';
import { ListHypothesesUseCase } from '../application/hypothesis/list-hypotheses.usecase';
import { GetHypothesisUseCase } from '../application/hypothesis/get-hypothesis.usecase';
import { UpdateHypothesisUseCase } from '../application/hypothesis/update-hypothesis.usecase';
import { DeleteHypothesisUseCase } from '../application/hypothesis/delete-hypothesis.usecase';
import { CreateVariantUseCase } from '../application/variant/create-variant.usecase';
import { ListVariantsUseCase } from '../application/variant/list-variants.usecase';
import { GetVariantUseCase } from '../application/variant/get-variant.usecase';
import { UpdateVariantUseCase } from '../application/variant/update-variant.usecase';
import { DeleteVariantUseCase } from '../application/variant/delete-variant.usecase';
import { HYPOTHESIS_REPOSITORY, VARIANT_REPOSITORY } from '../common/tokens';
import { TypeormHypothesisRepository } from '../infrastructure/persistence/typeorm/hypothesis.repository';
import { TypeormVariantRepository } from '../infrastructure/persistence/typeorm/variant.repository';
import { HypothesisOrmEntity } from '../infrastructure/persistence/typeorm/hypothesis.orm-entity';
import { VariantOrmEntity } from '../infrastructure/persistence/typeorm/variant.orm-entity';
import { InMemoryHypothesisRepository } from '../infrastructure/persistence/in-memory-hypothesis.repository';
import { InMemoryVariantRepository } from '../infrastructure/persistence/in-memory-variant.repository';
import { isDatabaseEnabled } from '../common/runtime-config';

const hypothesisImports = isDatabaseEnabled
  ? [TypeOrmModule.forFeature([HypothesisOrmEntity, VariantOrmEntity])]
  : [];
const hypothesisRepository = {
  provide: HYPOTHESIS_REPOSITORY,
  useClass: isDatabaseEnabled
    ? TypeormHypothesisRepository
    : InMemoryHypothesisRepository,
};
const variantRepository = {
  provide: VARIANT_REPOSITORY,
  useClass: isDatabaseEnabled
    ? TypeormVariantRepository
    : InMemoryVariantRepository,
};

@Module({
  imports: hypothesisImports,
  controllers: [HypothesisController, VariantController],
  providers: [
    CreateHypothesisUseCase,
    ListHypothesesUseCase,
    GetHypothesisUseCase,
    UpdateHypothesisUseCase,
    DeleteHypothesisUseCase,
    CreateVariantUseCase,
    ListVariantsUseCase,
    GetVariantUseCase,
    UpdateVariantUseCase,
    DeleteVariantUseCase,
    hypothesisRepository,
    variantRepository,
  ],
  exports: [HYPOTHESIS_REPOSITORY, VARIANT_REPOSITORY],
})
export class HypothesisModule {}
