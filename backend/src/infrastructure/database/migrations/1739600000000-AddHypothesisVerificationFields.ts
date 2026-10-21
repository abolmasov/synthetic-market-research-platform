import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHypothesisVerificationFields1739600000000 implements MigrationInterface {
  name = 'AddHypothesisVerificationFields1739600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "hypotheses"
      ADD COLUMN IF NOT EXISTS "primaryMetric" character varying(40),
      ADD COLUMN IF NOT EXISTS "primaryMetricDirection" character varying(20),
      ADD COLUMN IF NOT EXISTS "primaryMetricThreshold" double precision,
      ADD COLUMN IF NOT EXISTS "guardrails" jsonb,
      ADD COLUMN IF NOT EXISTS "falsificationRule" text,
      ADD COLUMN IF NOT EXISTS "sampleSize" integer,
      ADD COLUMN IF NOT EXISTS "testDurationDays" integer,
      ADD COLUMN IF NOT EXISTS "decisionOutcome" character varying(20) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS "decisionReason" text,
      ADD COLUMN IF NOT EXISTS "lastEvaluatedAt" TIMESTAMP WITH TIME ZONE
    `);

    await queryRunner.query(`
      UPDATE "hypotheses"
      SET "decisionOutcome" = COALESCE("decisionOutcome", 'pending')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "hypotheses"
      DROP COLUMN IF EXISTS "lastEvaluatedAt",
      DROP COLUMN IF EXISTS "decisionReason",
      DROP COLUMN IF EXISTS "decisionOutcome",
      DROP COLUMN IF EXISTS "testDurationDays",
      DROP COLUMN IF EXISTS "sampleSize",
      DROP COLUMN IF EXISTS "falsificationRule",
      DROP COLUMN IF EXISTS "guardrails",
      DROP COLUMN IF EXISTS "primaryMetricThreshold",
      DROP COLUMN IF EXISTS "primaryMetricDirection",
      DROP COLUMN IF EXISTS "primaryMetric"
    `);
  }
}
