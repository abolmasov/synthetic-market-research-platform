import { API_BASE_URL, apiFetch, parseApiError } from './client';
import type { RagSource } from '../types';

export type RagStats = {
  totalChunks: number;
  bySourceType: Record<string, number>;
  byIndustry: Record<string, number>;
};

export type RagDocument = {
  id: string;
  title: string;
  sourceType: string;
  url: string | null;
  industry: string | null;
  uploadedFileName: string | null;
  chunks: number;
  createdAt: string;
  isLegacy: boolean;
};

export type IngestTextInput = {
  text: string;
  title: string;
  sourceType: string;
  url?: string;
  industry?: string;
};

export type IngestFileInput = {
  file: File;
  title?: string;
  sourceType: string;
  url?: string;
  industry?: string;
};

export type RagQueryResult = {
  hypothesis: string;
  sources: RagSource[];
};

export const queryRag = async (
  hypothesis: string,
): Promise<RagQueryResult> => {
  const response = await apiFetch(`${API_BASE_URL}/rag/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hypothesis }),
  });
  if (!response.ok) throw await parseApiError(response, 'Failed to query RAG');
  return response.json() as Promise<RagQueryResult>;
};

export const ingestText = async (
  input: IngestTextInput,
): Promise<{ chunksCreated: number }> => {
  const response = await apiFetch(`${API_BASE_URL}/rag/ingest/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await parseApiError(response, 'Failed to ingest text');
  return response.json() as Promise<{ chunksCreated: number }>;
};

export const ingestFile = async (
  input: IngestFileInput,
): Promise<{ chunksCreated: number; fileName: string }> => {
  const formData = new FormData();
  formData.append('file', input.file);
  if (input.title?.trim()) {
    formData.append('title', input.title.trim());
  }
  formData.append('sourceType', input.sourceType);
  if (input.url?.trim()) {
    formData.append('url', input.url.trim());
  }
  if (input.industry?.trim()) {
    formData.append('industry', input.industry.trim());
  }

  const response = await apiFetch(`${API_BASE_URL}/rag/ingest/file`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw await parseApiError(response, 'Failed to ingest file');
  return response.json() as Promise<{ chunksCreated: number; fileName: string }>;
};

export const fetchRagStats = async (): Promise<RagStats> => {
  const response = await apiFetch(`${API_BASE_URL}/rag/stats`);
  if (!response.ok) throw await parseApiError(response, 'Failed to load RAG stats');
  return response.json() as Promise<RagStats>;
};

export const clearAllDocuments = async (): Promise<{ deletedChunks: number }> => {
  const response = await apiFetch(`${API_BASE_URL}/rag/documents`, {
    method: 'DELETE',
  });
  if (!response.ok) throw await parseApiError(response, 'Failed to clear documents');
  return response.json() as Promise<{ deletedChunks: number }>;
};

export const fetchRagDocuments = async (): Promise<RagDocument[]> => {
  const response = await apiFetch(`${API_BASE_URL}/rag/documents`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load uploaded documents');
  }
  return response.json() as Promise<RagDocument[]>;
};

export const deleteRagDocument = async (
  documentId: string,
): Promise<{ deletedChunks: number }> => {
  const response = await apiFetch(
    `${API_BASE_URL}/rag/documents/${encodeURIComponent(documentId)}`,
    {
      method: 'DELETE',
    },
  );
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to delete document');
  }
  return response.json() as Promise<{ deletedChunks: number }>;
};
