import type { DomainEvent, EventStore } from '@core-engine';

/**
 * InMemoryEventStore
 *
 * Simple append-only store for demos/tests; adapters can replace with
 * durable implementations (Firestore, SQL, etc.).
 */
export class InMemoryEventStore implements EventStore {
  private readonly events: DomainEvent[] = [];

  async append<TData = unknown>(event: DomainEvent<TData>): Promise<void> {
    this.events.push(event);
  }

  async load<TData = unknown>(aggregateId: string): Promise<DomainEvent<TData>[]> {
    return this.events.filter(event => event.aggregateId === aggregateId) as DomainEvent<TData>[];
  }

  async loadByBlueprint<TData = unknown>(blueprintId: string): Promise<DomainEvent<TData>[]> {
    return this.events.filter(event => event.metadata.blueprintId === blueprintId) as DomainEvent<TData>[];
  }
}

// END OF FILE
