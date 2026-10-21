import { API_BASE_URL, apiFetch, parseApiError } from './client';
import type { CreateRunInput, Run, UpdateRunInput } from '../types';

export const createRun = async (input: CreateRunInput): Promise<Run> => {
  const response = await apiFetch(`${API_BASE_URL}/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create run');
  }

  return response.json() as Promise<Run>;
};

export const fetchRunsByHypothesis = async (
  hypothesisId: string,
): Promise<Run[]> => {
  const params = new URLSearchParams({ hypothesisId });
  const response = await apiFetch(`${API_BASE_URL}/runs?${params}`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load runs');
  }

  return response.json() as Promise<Run[]>;
};

export const getRun = async (id: string): Promise<Run> => {
  const response = await apiFetch(`${API_BASE_URL}/runs/${id}`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load run');
  }

  return response.json() as Promise<Run>;
};

export const updateRun = async (
  id: string,
  input: UpdateRunInput,
): Promise<Run> => {
  const response = await apiFetch(`${API_BASE_URL}/runs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to update run');
  }

  return response.json() as Promise<Run>;
};
