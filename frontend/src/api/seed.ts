import { API_BASE_URL, apiFetch, parseApiError } from './client';

export type SeedMode = 'demo' | 'random';

export type SeedOptions = {
  mode?: SeedMode;
  overwrite?: boolean;
  count?: number;
};

export type SeedStats = {
  created: number;
  skipped: number;
  total: number;
};

export type ClearStats = {
  deleted: number;
};

export type SeedAllResult = {
  personas: SeedStats;
  segments: SeedStats;
  hypotheses: SeedStats;
  simulations: SeedStats;
  ragDocuments?: SeedStats;
};

export type ClearAllResult = {
  personas: ClearStats;
  segments: ClearStats;
  hypotheses: ClearStats;
  simulations: ClearStats;
  ragChunks?: ClearStats;
};

const postSeed = async (
  resource: string,
  options?: SeedOptions,
): Promise<SeedStats> => {
  const response = await apiFetch(`${API_BASE_URL}/seed/${resource}`, {
    method: 'POST',
    headers: options ? { 'Content-Type': 'application/json' } : undefined,
    body: options ? JSON.stringify(options) : undefined,
  });

  if (!response.ok) {
    throw await parseApiError(response, `Failed to seed ${resource}`);
  }

  return response.json() as Promise<SeedStats>;
};

const postClear = async (resource: string): Promise<ClearStats> => {
  const response = await apiFetch(`${API_BASE_URL}/seed/clear/${resource}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw await parseApiError(response, `Failed to clear ${resource}`);
  }

  return response.json() as Promise<ClearStats>;
};

export const seedPersonas = (options?: SeedOptions) => postSeed('personas', options);
export const seedSegments = (options?: SeedOptions) => postSeed('segments', options);
export const seedHypotheses = (options?: SeedOptions) => postSeed('hypotheses', options);
export const seedSimulations = (options?: SeedOptions) => postSeed('simulations', options);

export const clearPersonas = () => postClear('personas');
export const clearSegments = () => postClear('segments');
export const clearHypotheses = () => postClear('hypotheses');
export const clearSimulations = () => postClear('simulations');

export const clearAll = async (): Promise<ClearAllResult> => {
  const response = await apiFetch(`${API_BASE_URL}/seed/clear/all`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to clear all data');
  }

  return response.json() as Promise<ClearAllResult>;
};

export const seedAll = async (): Promise<SeedAllResult> => {
  const response = await apiFetch(`${API_BASE_URL}/seed/all`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to seed all demo data');
  }

  return response.json() as Promise<SeedAllResult>;
};
