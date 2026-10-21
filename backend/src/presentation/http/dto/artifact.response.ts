import {
  Artifact,
  ArtifactStage,
  ArtifactType,
} from '../../../domain/study/artifact';

export type ArtifactResponse = {
  id: string;
  runId: string;
  stage: ArtifactStage;
  type: ArtifactType;
  payload: Record<string, unknown>;
  createdAt: string;
};

export const toArtifactResponse = (artifact: Artifact): ArtifactResponse => ({
  id: artifact.id ?? '',
  runId: artifact.runId,
  stage: artifact.stage,
  type: artifact.type,
  payload: artifact.payload,
  createdAt: artifact.createdAt?.toISOString() ?? new Date().toISOString(),
});
