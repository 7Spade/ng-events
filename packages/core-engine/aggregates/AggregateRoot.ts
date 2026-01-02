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
export abstract class AggregateRoot {
  protected uncommittedEvents: DomainEvent[] = [];
  
  /**
   * Aggregate identifier
   */
  abstract readonly id: string;
  
  /**
   * Aggregate type name
   */
  abstract readonly type: string;
  
  /**
   * Get uncommitted events to be persisted
   */
  getUncommittedEvents(): DomainEvent[] {
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
  protected abstract applyEvent(event: DomainEvent): void;
  
  /**
   * Raise a new domain event
   * 
   * @param event - Event to raise
   */
  protected raiseEvent(event: DomainEvent): void {
    this.applyEvent(event);
    this.uncommittedEvents.push(event);
  }
  
  /**
   * Replay events to rebuild aggregate state
   * 
   * @param events - Historical events
   */
  replay(events: DomainEvent[]): void {
    events.forEach(event => this.applyEvent(event));
  }
}
