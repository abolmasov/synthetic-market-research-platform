import { API_BASE_URL, apiFetch, parseApiError } from './client';
import type {
  CreateSegmentInput,
  GeneratePersonasInput,
  GeneratePersonasResult,
  PaginatedResponse,
  Segment,
  UpdateSegmentInput,
} from '../types';

export const fetchSegments = async (
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Segment>> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await apiFetch(`${API_BASE_URL}/segments?${params}`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load segments');
  }

  return response.json() as Promise<PaginatedResponse<Segment>>;
};

export const getSegment = async (id: string): Promise<Segment> => {
  const response = await apiFetch(`${API_BASE_URL}/segments/${id}`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load segment');
  }

  return response.json() as Promise<Segment>;
};

export const createSegment = async (
  input: CreateSegmentInput,
): Promise<Segment> => {
  const response = await apiFetch(`${API_BASE_URL}/segments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create segment');
  }

  return response.json() as Promise<Segment>;
};

export const updateSegment = async (
  id: string,
  input: UpdateSegmentInput,
): Promise<Segment> => {
  const response = await apiFetch(`${API_BASE_URL}/segments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to update segment');
  }

  return response.json() as Promise<Segment>;
};

export const deleteSegment = async (id: string): Promise<void> => {
  const response = await apiFetch(`${API_BASE_URL}/segments/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to delete segment');
  }
};

export const generatePersonasFromSegment = async (
  segmentId: string,
  input: GeneratePersonasInput,
): Promise<GeneratePersonasResult> => {
  const response = await apiFetch(
    `${API_BASE_URL}/segments/${segmentId}/generate-personas`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw await parseApiError(
      response,
      'Failed to generate personas from segment',
    );
  }

  return response.json() as Promise<GeneratePersonasResult>;
};
