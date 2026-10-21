import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRunArtifactTables1739400000000 implements MigrationInterface {
  name = 'CreateRunArtifactTables1739400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "runs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "hypothesisId" uuid NOT NULL,
        "panelId" uuid,
        "variantIds" text array NOT NULL,
        "stage" character varying(4) NOT NULL,
        "status" character varying(40) NOT NULL,
        "config" jsonb NOT NULL,
        "startedAt" TIMESTAMP WITH TIME ZONE,
        "completedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_runs_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "artifacts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "runId" uuid NOT NULL,
        "stage" character varying(4) NOT NULL,
        "type" character varying(40) NOT NULL,
        "payload" jsonb NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_artifacts_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "artifacts"`);
    await queryRunner.query(`DROP TABLE "runs"`);
  }
}
