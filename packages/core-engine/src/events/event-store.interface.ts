import type { DomainEvent } from './domain-event';

/**
 * EventStore (interface)
 *
 * Minimal abstraction for append-only event storage with optional
 * causality-aware replay. Concrete implementations live in adapters.
 */
export interface EventStore {
  append<TData = unknown>(event: DomainEvent<TData>): Promise<void>;
  load<TData = unknown>(aggregateId: string): Promise<DomainEvent<TData>[]>;
  /**
   * Optional: load events by tenant boundary.
   */
  loadByBlueprint?<TData = unknown>(blueprintId: string): Promise<DomainEvent<TData>[]>;
}

// END OF FILE
