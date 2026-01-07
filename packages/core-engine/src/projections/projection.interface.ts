import type { DomainEvent } from '../events';

/**
 * Projection
 *
 * Read model updater that reacts to domain events.
 */
export interface Projection<TReadModel = unknown> {
  readonly name: string;
  /**
   * Apply an incoming domain event to the read model.
   */
  apply(event: DomainEvent): Promise<TReadModel | void> | TReadModel | void;
}

/**
 * ProjectionHandler
 *
 * Adapter-facing abstraction for registering projection updaters.
 */
export interface ProjectionHandler {
  handle(event: DomainEvent): Promise<void>;
}

// END OF FILE
