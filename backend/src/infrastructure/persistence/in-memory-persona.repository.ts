import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PersonaRepository } from '../../domain/persona/persona.repository';
import { Persona } from '../../domain/persona/persona';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';
import { buildPaginatedResult } from '../../common/pagination';

@Injectable()
export class InMemoryPersonaRepository implements PersonaRepository {
  private readonly personas = new Map<string, Persona>();

  create(persona: Persona): Promise<Persona> {
    const id = randomUUID();
    const createdAt = new Date();
    const created = Persona.rehydrate({
      id,
      createdAt,
      name: persona.name,
      segment: persona.segment,
      segmentId: persona.segmentId ?? null,
      motivations: persona.motivations,
      barriers: persona.barriers,
      trustChannel: persona.trustChannel,
      purchaseTriggers: persona.purchaseTriggers,
      budgetRange: persona.budgetRange,
      contextNotes: persona.contextNotes ?? null,
      age: persona.age ?? null,
      location: persona.location ?? null,
      income: persona.income ?? null,
      gender: persona.gender ?? null,
      occupation: persona.occupation ?? null,
      personality: persona.personality ?? null,
      healthProfile: persona.healthProfile ?? null,
      cognitiveProfile: persona.cognitiveProfile ?? null,
      decisionStyle: persona.decisionStyle ?? null,
    });

    this.personas.set(id, created);
    return Promise.resolve(created);
  }

  findAll(workspaceId?: string): Promise<Persona[]> {
    const all = [...this.personas.values()].filter(
      (p) => !workspaceId || p.workspaceId === workspaceId,
    );
    return Promise.resolve(
      all.sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      ),
    );
  }

  findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<Persona>> {
    const all = [...this.personas.values()].sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
    const start = (options.page - 1) * options.limit;
    const data = all.slice(start, start + options.limit);
    return Promise.resolve(
      buildPaginatedResult(data, all.length, options.page, options.limit),
    );
  }

  findById(id: string, workspaceId?: string): Promise<Persona | null> {
    const persona = this.personas.get(id) ?? null;
    if (!persona) return Promise.resolve(null);
    if (workspaceId && persona.workspaceId !== workspaceId)
      return Promise.resolve(null);
    return Promise.resolve(persona);
  }

  update(persona: Persona): Promise<Persona> {
    if (persona.id) {
      this.personas.set(persona.id, persona);
    }
    return Promise.resolve(persona);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.personas.delete(id));
  }
}
