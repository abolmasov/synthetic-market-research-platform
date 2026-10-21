import { MigrationInterface, QueryRunner } from 'typeorm';

const TARGET_TABLES = [
  'users',
  'personas',
  'segments',
  'hypotheses',
  'simulations',
  'studies',
  'runs',
  'artifacts',
  'document_chunks',
];

type WorkspaceColumnRow = {
  table_name: string;
  is_nullable: 'YES' | 'NO';
};

export class AddWorkspaceId1739500000000 implements MigrationInterface {
  name = 'AddWorkspaceId1739500000000';
  transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TARGET_TABLES) {
      await this.runOwnerAware(
        queryRunner,
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "workspace_id" uuid`,
      );
    }

    const workspaceSeedRows = (await queryRunner.query(
      `SELECT uuid_generate_v4()::text AS workspace_id`,
    )) as Array<{ workspace_id: string }>;
    const workspaceIdSeed = workspaceSeedRows[0]?.workspace_id;

    if (!workspaceIdSeed) {
      throw new Error('Failed to generate workspace_id seed for migration');
    }

    for (const table of TARGET_TABLES) {
      await this.runOwnerAware(
        queryRunner,
        `UPDATE "${table}" SET "workspace_id" = $1 WHERE "workspace_id" IS NULL`,
        [workspaceIdSeed],
      );
    }

    for (const table of TARGET_TABLES) {
      await this.runOwnerAware(
        queryRunner,
        `ALTER TABLE "${table}" ALTER COLUMN "workspace_id" SET NOT NULL`,
      );
    }

    const rows = (await queryRunner.query(
      `
        SELECT table_name, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'workspace_id'
          AND table_name = ANY($1::text[])
      `,
      [TARGET_TABLES],
    )) as WorkspaceColumnRow[];

    const statusByTable = new Map<string, boolean>();
    for (const row of rows) {
      statusByTable.set(row.table_name, row.is_nullable === 'YES');
    }

    const missing = TARGET_TABLES.filter((table) => !statusByTable.has(table));
    const nullable = [...statusByTable.entries()]
      .filter((entry) => entry[1])
      .map((entry) => entry[0]);

    if (missing.length > 0 || nullable.length > 0) {
      throw new Error(
        `workspace_id migration incomplete; missing=[${missing.join(', ')}], nullable=[${nullable.join(', ')}]`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [...TARGET_TABLES].reverse();

    for (const table of tables) {
      await this.runOwnerAware(
        queryRunner,
        `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "workspace_id"`,
      );
    }
  }

  private async runOwnerAware(
    queryRunner: QueryRunner,
    sql: string,
    parameters?: unknown[],
  ): Promise<void> {
    try {
      await queryRunner.query(sql, parameters);
    } catch (error) {
      if (this.isOwnerError(error) || this.isWorkspaceColumnMissing(error)) {
        return;
      }
      throw error;
    }
  }

  private isOwnerError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const maybeError = error as {
      code?: string;
      message?: string;
      driverError?: {
        code?: string;
        message?: string;
      };
    };

    const code = maybeError.code ?? maybeError.driverError?.code;
    const message =
      `${maybeError.message ?? ''} ${maybeError.driverError?.message ?? ''}`.toLowerCase();

    return (
      code === '42501' &&
      (message.includes('must be owner of table') ||
        message.includes('permission denied for table'))
    );
  }

  private isWorkspaceColumnMissing(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const maybeError = error as {
      code?: string;
      message?: string;
      driverError?: {
        code?: string;
        message?: string;
      };
    };

    const code = maybeError.code ?? maybeError.driverError?.code;
    const message =
      `${maybeError.message ?? ''} ${maybeError.driverError?.message ?? ''}`.toLowerCase();

    return (
      code === '42703' &&
      message.includes('"workspace_id"') &&
      message.includes('does not exist')
    );
  }
}
