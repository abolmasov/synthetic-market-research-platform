import { API_BASE_URL, apiFetch, parseApiError } from './client';
import type {
  PaginatedResponse,
  Study,
  CreateStudyInput,
  UpdateStudyInput,
} from '../types';

export const fetchStudies = async (
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Study>> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await apiFetch(`${API_BASE_URL}/studies?${params}`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load studies');
  }

  return response.json() as Promise<PaginatedResponse<Study>>;
};

export const fetchStudy = async (id: string): Promise<Study> => {
  const response = await apiFetch(`${API_BASE_URL}/studies/${id}`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load study');
  }

  return response.json() as Promise<Study>;
};

export const createStudy = async (
  input: CreateStudyInput,
): Promise<Study> => {
  const response = await apiFetch(`${API_BASE_URL}/studies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create study');
  }

  return response.json() as Promise<Study>;
};

export const updateStudy = async (
  id: string,
  input: UpdateStudyInput,
): Promise<Study> => {
  const response = await apiFetch(`${API_BASE_URL}/studies/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to update study');
  }

  return response.json() as Promise<Study>;
};

export const deleteStudy = async (id: string): Promise<void> => {
  const response = await apiFetch(`${API_BASE_URL}/studies/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to delete study');
  }
};
