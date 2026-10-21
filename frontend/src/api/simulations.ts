import { API_BASE_URL, apiFetch, parseApiError } from './client';
import type { PaginatedResponse, RunSimulationInput, Simulation } from '../types';

export type SimulationReportMetadata = {
  reportId: string;
  schemaVersion: string;
  templateVersion: string;
  generatedAt: string;
  generator: string;
  simulationId: string;
  simulationSnapshotHash: string;
  decisionCount: number;
};

export type SimulationReportHeaderMetadata = {
  reportId: string;
  schemaVersion: string;
  templateVersion: string;
  generatedAt: string;
  simulationSnapshotHash: string;
};

const readReportMetadataHeaders = (
  headers: Headers,
): SimulationReportHeaderMetadata | null => {
  const reportId = headers.get('X-Report-Id');
  const schemaVersion = headers.get('X-Report-Schema-Version');
  const templateVersion = headers.get('X-Report-Template-Version');
  const generatedAt = headers.get('X-Report-Generated-At');
  const simulationSnapshotHash = headers.get('X-Report-Snapshot-Hash');

  if (
    !reportId ||
    !schemaVersion ||
    !templateVersion ||
    !generatedAt ||
    !simulationSnapshotHash
  ) {
    return null;
  }

  return {
    reportId,
    schemaVersion,
    templateVersion,
    generatedAt,
    simulationSnapshotHash,
  };
};

const parseFilenameFromDisposition = (
  contentDisposition: string | null,
  fallbackName: string,
): string => {
  if (!contentDisposition) {
    return fallbackName;
  }

  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (!match?.[1]) {
    return fallbackName;
  }

  return match[1];
};

const triggerBlobDownload = (blob: Blob, filename: string): void => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
};

export const runSimulation = async (
  input: RunSimulationInput,
): Promise<Simulation> => {
  const response = await apiFetch(`${API_BASE_URL}/simulations`, {
    method: 'POST',
    timeoutMs: 210000,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(
      response,
      'Failed to run simulation. Please review your input and try again.',
    );
  }

  return response.json() as Promise<Simulation>;
};

export const fetchSimulations = async (
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Simulation>> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await apiFetch(`${API_BASE_URL}/simulations?${params}`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load simulations');
  }

  return response.json() as Promise<PaginatedResponse<Simulation>>;
};

export const fetchSimulationById = async (id: string): Promise<Simulation> => {
  const response = await apiFetch(`${API_BASE_URL}/simulations/${id}`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load simulation details');
  }

  return response.json() as Promise<Simulation>;
};

export const downloadSimulationCsv = async (
  id: string,
): Promise<SimulationReportHeaderMetadata | null> => {
  const response = await apiFetch(`${API_BASE_URL}/simulations/${id}/export/csv`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to export simulation CSV');
  }

  const headerMetadata = readReportMetadataHeaders(response.headers);
  const blob = await response.blob();
  const filename = parseFilenameFromDisposition(
    response.headers.get('Content-Disposition'),
    `simulation-${id}.csv`,
  );
  triggerBlobDownload(blob, filename);

  if (!headerMetadata) {
    return null;
  }

  return headerMetadata;
};

export const downloadSimulationPdf = async (
  id: string,
): Promise<SimulationReportHeaderMetadata | null> => {
  const response = await apiFetch(`${API_BASE_URL}/simulations/${id}/report/pdf`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to export simulation PDF report');
  }

  const headerMetadata = readReportMetadataHeaders(response.headers);
  const blob = await response.blob();
  const filename = parseFilenameFromDisposition(
    response.headers.get('Content-Disposition'),
    `simulation-${id}-report.pdf`,
  );
  triggerBlobDownload(blob, filename);

  if (!headerMetadata) {
    return null;
  }

  return headerMetadata;
};

export const fetchSimulationReportMetadata = async (
  id: string,
): Promise<SimulationReportMetadata> => {
  const response = await apiFetch(`${API_BASE_URL}/simulations/${id}/report/metadata`);
  if (!response.ok) {
    throw await parseApiError(response, 'Failed to load report metadata');
  }

  return response.json() as Promise<SimulationReportMetadata>;
};
