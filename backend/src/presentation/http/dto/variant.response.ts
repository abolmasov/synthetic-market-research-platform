import { Variant } from '../../../domain/hypothesis/variant';

export type VariantResponse = {
  id: string;
  hypothesisId: string;
  name: string;
  description: string | null;
  pricePoint: number | null;
  positioning: string | null;
  claims: string[] | null;
  changeSummary: string;
  content: string;
  version: number;
  status: string;
  expectedUplift: number | null;
  successMetric: string | null;
  risk: string | null;
  notes: string | null;
  createdAt: string;
};

export const toVariantResponse = (variant: Variant): VariantResponse => ({
  id: variant.id ?? '',
  hypothesisId: variant.hypothesisId,
  name: variant.name,
  description: variant.description ?? null,
  pricePoint: variant.pricePoint ?? null,
  positioning: variant.positioning ?? null,
  claims: variant.claims ?? null,
  changeSummary: variant.changeSummary,
  content: variant.content,
  version: variant.version,
  status: variant.status,
  expectedUplift: variant.expectedUplift ?? null,
  successMetric: variant.successMetric ?? null,
  risk: variant.risk ?? null,
  notes: variant.notes ?? null,
  createdAt: variant.createdAt?.toISOString() ?? new Date().toISOString(),
});
