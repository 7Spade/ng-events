/**
 * Aggregate Root Base Class
 *
 * Base class for all domain aggregates.
 * Aggregates are consistency boundaries in DDD.
 */

import { DomainEvent } from '../event-store';

/**
 * Base class for aggregate roots
 *
 * Aggregates maintain internal state through event replay.
 */
export abstract class AggregateRoot<
  TId = string,
  TEvent extends DomainEvent<unknown, TId> = DomainEvent<unknown, TId>,
  SState = unknown
> {
  protected uncommittedEvents: TEvent[] = [];
  protected state?: SState;

  /**
   * Aggregate identifier
   */
  abstract readonly id: TId;

  /**
   * Aggregate type name
   */
  abstract readonly type: string;

  /**
   * Get uncommitted events to be persisted
   */
  getUncommittedEvents(): TEvent[] {
    return [...this.uncommittedEvents];
  }

  /**
   * Clear uncommitted events after persistence
   */
  clearUncommittedEvents(): void {
    this.uncommittedEvents = [];
  }

  /**
   * Apply an event to update aggregate state
   *
   * @param event - Event to apply
   */
  protected abstract applyEvent(event: TEvent): void;

  /**
   * Raise a new domain event
   *
   * @param event - Event to raise
   */
  protected raiseEvent(event: TEvent): void {
    this.applyEvent(event);
    this.uncommittedEvents.push(event);
  }

  /**
   * Replay events to rebuild aggregate state
   *
   * @param events - Historical events
   */
  replay(events: TEvent[]): void {
    events.forEach(event => this.applyEvent(event));
  }
}
