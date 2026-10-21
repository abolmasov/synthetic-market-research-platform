import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserOrmEntity } from '../persistence/typeorm/user.orm-entity';
import { PersonaOrmEntity } from '../persistence/typeorm/persona.orm-entity';
import { SimulationOrmEntity } from '../persistence/typeorm/simulation.orm-entity';
import { HypothesisOrmEntity } from '../persistence/typeorm/hypothesis.orm-entity';
import { VariantOrmEntity } from '../persistence/typeorm/variant.orm-entity';
import { SegmentOrmEntity } from '../persistence/typeorm/segment.orm-entity';
import { DocumentChunkOrmEntity } from '../persistence/typeorm/document-chunk.orm-entity';
import { StudyOrmEntity } from '../persistence/typeorm/study.orm-entity';
import { RunOrmEntity } from '../persistence/typeorm/run.orm-entity';
import { ArtifactOrmEntity } from '../persistence/typeorm/artifact.orm-entity';
import { MigrationRunnerService } from './migration-runner.service';
import { AuthAndSchemaDriftFix1739100000000 } from './migrations/1739100000000-AuthAndSchemaDriftFix';
import { CreateRagTable1739200000000 } from './migrations/1739200000000-CreateRagTable';
import { CreateStudiesTable1739300000000 } from './migrations/1739300000000-CreateStudiesTable';
import { CreateRunArtifactTables1739400000000 } from './migrations/1739400000000-CreateRunArtifactTables';
import { AddWorkspaceId1739500000000 } from './migrations/1739500000000-AddWorkspaceId';
import { AddHypothesisVerificationFields1739600000000 } from './migrations/1739600000000-AddHypothesisVerificationFields';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USER', 'smr'),
        password: configService.get<string>('DB_PASSWORD', 'smr'),
        database: configService.get<string>('DB_NAME', 'smr'),
        autoLoadEntities: false,
        entities: [
          UserOrmEntity,
          PersonaOrmEntity,
          SimulationOrmEntity,
          HypothesisOrmEntity,
          VariantOrmEntity,
          SegmentOrmEntity,
          DocumentChunkOrmEntity,
          StudyOrmEntity,
          RunOrmEntity,
          ArtifactOrmEntity,
        ],
        migrations: [
          AuthAndSchemaDriftFix1739100000000,
          CreateRagTable1739200000000,
          CreateStudiesTable1739300000000,
          CreateRunArtifactTables1739400000000,
          AddWorkspaceId1739500000000,
          AddHypothesisVerificationFields1739600000000,
        ],
        migrationsTableName: 'typeorm_migrations',
        synchronize:
          configService.get<string>('DB_SYNC', 'false').toLowerCase() ===
          'true',
      }),
    }),
  ],
  providers: [MigrationRunnerService],
})
export class TypeormDatabaseModule {}
