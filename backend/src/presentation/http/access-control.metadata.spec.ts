import { ArtifactController } from './artifact.controller';
import { HypothesisController } from './hypothesis.controller';
import { PersonaController } from './persona.controller';
import { RagController } from './rag.controller';
import { RunController } from './run.controller';
import { SeedController } from './seed.controller';
import { SegmentController } from './segment.controller';
import { SimulationController } from './simulation.controller';
import { StudyController } from './study.controller';
import { VariantController } from './variant.controller';
import { ROLES_KEY } from './guards/roles.guard';

function getRolesForMethod(
  controllerPrototype: object,
  methodName: string,
): string[] | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(
    controllerPrototype,
    methodName,
  );
  if (!descriptor || typeof descriptor.value !== 'function') {
    return undefined;
  }

  return Reflect.getMetadata(ROLES_KEY, descriptor.value as object) as
    string[] | undefined;
}

describe('Access control metadata', () => {
  it('applies explicit read roles on core entity controllers', () => {
    expect(getRolesForMethod(PersonaController.prototype, 'list')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
    expect(getRolesForMethod(PersonaController.prototype, 'get')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
    expect(getRolesForMethod(SegmentController.prototype, 'list')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
    expect(getRolesForMethod(SegmentController.prototype, 'get')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
    expect(getRolesForMethod(HypothesisController.prototype, 'list')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
    expect(getRolesForMethod(HypothesisController.prototype, 'get')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
    expect(getRolesForMethod(StudyController.prototype, 'list')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
    expect(getRolesForMethod(StudyController.prototype, 'get')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
  });

  it('applies explicit read roles on simulation flow endpoints', () => {
    expect(getRolesForMethod(SimulationController.prototype, 'list')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
    expect(getRolesForMethod(SimulationController.prototype, 'get')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
    expect(
      getRolesForMethod(SimulationController.prototype, 'exportCsv'),
    ).toEqual(['admin', 'analyst', 'viewer']);
    expect(
      getRolesForMethod(SimulationController.prototype, 'exportPdf'),
    ).toEqual(['admin', 'analyst', 'viewer']);
    expect(
      getRolesForMethod(SimulationController.prototype, 'reportMetadata'),
    ).toEqual(['admin', 'analyst', 'viewer']);
  });

  it('applies explicit read roles on nested resources', () => {
    expect(getRolesForMethod(VariantController.prototype, 'list')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
    expect(getRolesForMethod(VariantController.prototype, 'get')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
    expect(getRolesForMethod(RunController.prototype, 'list')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
    expect(getRolesForMethod(RunController.prototype, 'get')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
    expect(getRolesForMethod(ArtifactController.prototype, 'list')).toEqual([
      'admin',
      'analyst',
      'viewer',
    ]);
  });

  it('restricts RAG query and stats to analyst/admin roles', () => {
    expect(getRolesForMethod(RagController.prototype, 'query')).toEqual([
      'admin',
      'analyst',
    ]);
    expect(getRolesForMethod(RagController.prototype, 'stats')).toEqual([
      'admin',
      'analyst',
    ]);
  });

  it('restricts seed endpoints to admin role at controller level', () => {
    expect(
      Reflect.getMetadata(ROLES_KEY, SeedController) as string[] | undefined,
    ).toEqual(['admin']);
  });
});
