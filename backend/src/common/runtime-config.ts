import { config as loadEnv } from 'dotenv';

loadEnv();

const normalizeFlag = (value?: string): string | undefined =>
  value?.trim().toLowerCase();

const dbEnabledFlag = normalizeFlag(process.env.DB_ENABLED);
const dbHost = process.env.DB_HOST?.trim();

export const isDatabaseEnabled =
  dbEnabledFlag === 'true'
    ? true
    : dbEnabledFlag === 'false'
      ? false
      : Boolean(dbHost);
