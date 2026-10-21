import { API_BASE_URL, apiFetch, parseApiError } from './client';
import type {
  CreateVariantInput,
  PaginatedResponse,
  UpdateVariantInput,
  Variant,
} from '../types';

export const fetchVariants = async (
  hypothesisId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Variant>> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await apiFetch(
    `${API_BASE_URL}/hypotheses/${hypothesisId}/variants?${params}`,
  );
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load variants');
  }

  return response.json() as Promise<PaginatedResponse<Variant>>;
};

export const getVariant = async (
  hypothesisId: string,
  id: string,
): Promise<Variant> => {
  const response = await apiFetch(
    `${API_BASE_URL}/hypotheses/${hypothesisId}/variants/${id}`,
  );
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load variant');
  }

  return response.json() as Promise<Variant>;
};

export const createVariant = async (
  hypothesisId: string,
  input: CreateVariantInput,
): Promise<Variant> => {
  const response = await apiFetch(
    `${API_BASE_URL}/hypotheses/${hypothesisId}/variants`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create variant');
  }

  return response.json() as Promise<Variant>;
};

export const updateVariant = async (
  hypothesisId: string,
  id: string,
  input: UpdateVariantInput,
): Promise<Variant> => {
  const response = await apiFetch(
    `${API_BASE_URL}/hypotheses/${hypothesisId}/variants/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to update variant');
  }

  return response.json() as Promise<Variant>;
};

export const deleteVariant = async (
  hypothesisId: string,
  id: string,
): Promise<void> => {
  const response = await apiFetch(
    `${API_BASE_URL}/hypotheses/${hypothesisId}/variants/${id}`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to delete variant');
  }
};
