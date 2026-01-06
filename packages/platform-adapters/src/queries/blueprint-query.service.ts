import type { DomainEvent } from '@core-engine';

/**
 * BlueprintQueryService
 *
 * Projection/read-model helper that scopes results to a blueprintId.
 */
export class BlueprintQueryService<TReadModel = unknown> {
  constructor(private readonly events: DomainEvent[] = []) {}

  withBlueprint(blueprintId: string): TReadModel[] {
    return this.events
      .filter(event => event.metadata.blueprintId === blueprintId)
      .map(() => ({} as TReadModel));
  }
}

// END OF FILE
