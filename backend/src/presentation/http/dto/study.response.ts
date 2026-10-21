import { Study } from '../../../domain/study/study';

export type StudyResponse = {
  id: string;
  name: string;
  objective: string;
  status: string;
  tags: string[] | null;
  createdAt: string;
};

export const toStudyResponse = (study: Study): StudyResponse => ({
  id: study.id ?? '',
  name: study.name,
  objective: study.objective,
  status: study.status,
  tags: study.tags ?? null,
  createdAt: study.createdAt?.toISOString() ?? new Date().toISOString(),
});
