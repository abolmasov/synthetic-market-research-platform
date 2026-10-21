import {
  Simulation,
  SimulationDecision,
  SimulationSummary,
} from '../../../domain/simulation/simulation';
import { RagSource } from '../../../domain/rag/rag-source';

export type SimulationResponse = {
  id: string;
  hypothesis: string;
  hypothesisId: string | null;
  status: string;
  summary: SimulationSummary;
  decisions: SimulationDecision[];
  ragSources: RagSource[];
  topSignals: string[];
  objections: string[];
  createdAt: string;
  completedAt: string | null;
};

export const toSimulationResponse = (
  simulation: Simulation,
): SimulationResponse => ({
  id: simulation.id ?? '',
  hypothesis: simulation.hypothesis,
  hypothesisId: simulation.hypothesisId ?? null,
  status: simulation.status,
  summary: simulation.summary,
  decisions: simulation.decisions,
  ragSources: simulation.ragSources,
  topSignals: simulation.topSignals,
  objections: simulation.objections,
  createdAt: simulation.createdAt?.toISOString() ?? new Date().toISOString(),
  completedAt: simulation.completedAt
    ? simulation.completedAt.toISOString()
    : null,
});
