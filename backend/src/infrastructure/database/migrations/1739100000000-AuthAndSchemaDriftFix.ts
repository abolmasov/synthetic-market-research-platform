import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthAndSchemaDriftFix1739100000000 implements MigrationInterface {
  name = 'AuthAndSchemaDriftFix1739100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL,
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "name" character varying(255) NOT NULL,
        "role" character varying(50) NOT NULL DEFAULT 'analyst',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "personas"
      ADD COLUMN IF NOT EXISTS "segmentId" uuid;
    `);

    await queryRunner.query(`
      ALTER TABLE "hypotheses"
      ADD COLUMN IF NOT EXISTS "successCriteria" character varying(120);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "segments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(120) NOT NULL,
        "description" text NOT NULL,
        "demographicCriteria" jsonb NOT NULL,
        "psychographicTraits" jsonb NOT NULL,
        "behavioralPatterns" jsonb NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_segments_id" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "simulations"
      ADD COLUMN IF NOT EXISTS "hypothesisId" uuid;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'hypotheses' AND column_name = 'successMetric'
        ) THEN
          UPDATE "hypotheses"
          SET "successCriteria" = COALESCE("successCriteria", "successMetric")
          WHERE "successMetric" IS NOT NULL;

          ALTER TABLE "hypotheses"
          DROP COLUMN "successMetric";
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      DECLARE
        table_record RECORD;
        sequence_record RECORD;
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'smr_app') THEN
          FOR table_record IN
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public' AND tableowner = current_user
          LOOP
            EXECUTE format(
              'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO smr_app',
              table_record.tablename
            );
          END LOOP;

          FOR sequence_record IN
            SELECT sequencename
            FROM pg_sequences
            WHERE schemaname = 'public' AND sequenceowner = current_user
          LOOP
            EXECUTE format(
              'GRANT USAGE, SELECT ON SEQUENCE public.%I TO smr_app',
              sequence_record.sequencename
            );
          END LOOP;

          IF current_user = 'admin' THEN
            ALTER DEFAULT PRIVILEGES FOR ROLE admin IN SCHEMA public
            GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO smr_app;

            ALTER DEFAULT PRIVILEGES FOR ROLE admin IN SCHEMA public
            GRANT USAGE, SELECT ON SEQUENCES TO smr_app;
          END IF;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "simulations"
      DROP COLUMN IF EXISTS "hypothesisId";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "segments";
    `);

    await queryRunner.query(`
      ALTER TABLE "hypotheses"
      ADD COLUMN IF NOT EXISTS "successMetric" character varying(120);
    `);

    await queryRunner.query(`
      UPDATE "hypotheses"
      SET "successMetric" = COALESCE("successMetric", "successCriteria")
      WHERE "successCriteria" IS NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "hypotheses"
      DROP COLUMN IF EXISTS "successCriteria";
    `);

    await queryRunner.query(`
      ALTER TABLE "personas"
      DROP COLUMN IF EXISTS "segmentId";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "users";
    `);
  }
}
