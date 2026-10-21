import { API_BASE_URL, apiFetch, parseApiError } from './client';
import type { CreatePersonaInput, PaginatedResponse, Persona, UpdatePersonaInput } from '../types';

export const fetchPersonas = async (
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Persona>> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await apiFetch(`${API_BASE_URL}/personas?${params}`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load personas');
  }

  return response.json() as Promise<PaginatedResponse<Persona>>;
};

export const createPersona = async (
  input: CreatePersonaInput,
): Promise<Persona> => {
  const response = await apiFetch(`${API_BASE_URL}/personas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create persona');
  }

  return response.json() as Promise<Persona>;
};

export const updatePersona = async (
  id: string,
  input: UpdatePersonaInput,
): Promise<Persona> => {
  const response = await apiFetch(`${API_BASE_URL}/personas/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to update persona');
  }

  return response.json() as Promise<Persona>;
};

export const deletePersona = async (id: string): Promise<void> => {
  const response = await apiFetch(`${API_BASE_URL}/personas/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to delete persona');
  }
};

export type BulkImportResult = {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  personas: Persona[];
};

export const bulkImportPersonas = async (
  csvContent: string,
): Promise<BulkImportResult> => {
  const response = await apiFetch(`${API_BASE_URL}/personas/bulk-import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ csvContent }),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to import personas');
  }

  return response.json() as Promise<BulkImportResult>;
};

export const downloadPersonaTemplate = (): void => {
  window.open(`${API_BASE_URL}/personas/template/csv`, '_blank');
};
