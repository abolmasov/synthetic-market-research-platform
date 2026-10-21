import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRagTable1739200000000 implements MigrationInterface {
  name = 'CreateRagTable1739200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Install pgvector extension if available
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "document_chunks" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(500) NOT NULL,
        "url" character varying(1000),
        "content" text NOT NULL,
        "embedding" vector(768) NOT NULL,
        "sourceType" character varying(50) NOT NULL,
        "industry" character varying(100),
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_document_chunks_id" PRIMARY KEY ("id")
      );
    `);

    // Add an HNSW index for faster vector similarity search
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_document_chunks_embedding" 
      ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_document_chunks_embedding";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "document_chunks";`);
  }
}
