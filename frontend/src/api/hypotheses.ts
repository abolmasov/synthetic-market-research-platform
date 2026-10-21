import { API_BASE_URL, apiFetch, parseApiError } from './client';
import type {
  CreateHypothesisInput,
  Hypothesis,
  PaginatedResponse,
  UpdateHypothesisInput,
} from '../types';

export const fetchHypotheses = async (
  studyId?: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Hypothesis>> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (studyId) {
    params.set('studyId', studyId);
  }
  const response = await apiFetch(`${API_BASE_URL}/hypotheses?${params}`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load hypotheses');
  }

  return response.json() as Promise<PaginatedResponse<Hypothesis>>;
};

export const getHypothesis = async (id: string): Promise<Hypothesis> => {
  const response = await apiFetch(`${API_BASE_URL}/hypotheses/${id}`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load hypothesis');
  }

  return response.json() as Promise<Hypothesis>;
};

export const createHypothesis = async (
  input: CreateHypothesisInput,
): Promise<Hypothesis> => {
  const response = await apiFetch(`${API_BASE_URL}/hypotheses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create hypothesis');
  }

  return response.json() as Promise<Hypothesis>;
};

export const updateHypothesis = async (
  id: string,
  input: UpdateHypothesisInput,
): Promise<Hypothesis> => {
  const response = await apiFetch(`${API_BASE_URL}/hypotheses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to update hypothesis');
  }

  return response.json() as Promise<Hypothesis>;
};

export const deleteHypothesis = async (id: string): Promise<void> => {
  const response = await apiFetch(`${API_BASE_URL}/hypotheses/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to delete hypothesis');
  }
};
