/**
 * Aggregate Root Base Class
 *
 * Base class for all domain aggregates.
 * Aggregates are consistency boundaries in DDD.
 *
 * Generics follow the T / I / S pattern from docs/泛型縮寫清單.md:
 * - TEvent: Event type for this aggregate
 * - TId: Aggregate identifier type
 * - SState: Internal state snapshot type
 */

import { DomainEvent } from '../event-store';

/**
 * Base class for aggregate roots
 *
 * Aggregates maintain internal state through event replay.
 */
export abstract class AggregateRoot<
  TEvent extends DomainEvent = DomainEvent,
  TId = TEvent extends DomainEvent<unknown, infer A, any> ? A : string,
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
