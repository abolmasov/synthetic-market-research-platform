import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStudiesTable1739300000000 implements MigrationInterface {
  name = 'CreateStudiesTable1739300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "studies" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(200) NOT NULL,
        "objective" text NOT NULL,
        "status" character varying(40) NOT NULL DEFAULT 'draft',
        "tags" text[],
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_studies_id" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "studies";`);
  }
}
