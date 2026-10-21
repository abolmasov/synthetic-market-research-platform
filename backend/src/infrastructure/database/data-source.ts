import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
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
import { AuthAndSchemaDriftFix1739100000000 } from './migrations/1739100000000-AuthAndSchemaDriftFix';
import { CreateRagTable1739200000000 } from './migrations/1739200000000-CreateRagTable';
import { CreateStudiesTable1739300000000 } from './migrations/1739300000000-CreateStudiesTable';
import { CreateRunArtifactTables1739400000000 } from './migrations/1739400000000-CreateRunArtifactTables';
import { AddWorkspaceId1739500000000 } from './migrations/1739500000000-AddWorkspaceId';
import { AddHypothesisVerificationFields1739600000000 } from './migrations/1739600000000-AddHypothesisVerificationFields';

loadEnv();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'smr',
  password: process.env.DB_PASSWORD ?? 'smr',
  database: process.env.DB_NAME ?? 'smr',
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
  migrationsTransactionMode: 'each',
  migrationsTableName: 'typeorm_migrations_admin',
  synchronize: false,
});

export default dataSource;
