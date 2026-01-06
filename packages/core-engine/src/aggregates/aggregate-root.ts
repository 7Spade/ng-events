/**
 * AggregateRoot - Base class for all domain aggregates
 *
 * Aggregates are consistency boundaries that:
 * - Enforce business invariants
 * - Produce domain events when state changes
 * - Maintain their own version for optimistic concurrency control
 *
 * Core Principles:
 * - State changes ONLY through events (event sourcing)
 * - All events include causality metadata
 * - Aggregates are loaded by replaying their event stream
 * - Changes are committed by persisting new events
 */

import { DomainEvent } from '../events/domain-event';

export abstract class AggregateRoot {
  /**
   * Unique identifier for this aggregate
   */
  protected readonly id: string;

  /**
   * Current version of the aggregate (for optimistic concurrency)
   */
  protected version: number = 0;

  /**
   * Pending events waiting to be persisted
   */
  private pendingEvents: DomainEvent[] = [];

  /**
   * Flag to track if aggregate has been modified
   */
  private isModified: boolean = false;

  constructor(id: string) {
    this.id = id;
  }

  /**
   * Get the aggregate ID
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Get the current version
   */
  public getVersion(): number {
    return this.version;
  }

  /**
   * Check if aggregate has uncommitted changes
   */
  public hasUncommittedChanges(): boolean {
    return this.pendingEvents.length > 0;
  }

  /**
   * Apply an event to update aggregate state
   * Used during event replay and when new events are raised
   *
   * @param event - The domain event to apply
   * @param isNew - Whether this is a new event (true) or being replayed (false)
   */
  protected applyEvent(event: DomainEvent, isNew: boolean = true): void {
    // Update internal state based on event
    this.when(event);

    // Increment version
    this.version++;

    // If this is a new event, add to pending events
    if (isNew) {
      this.pendingEvents.push(event);
      this.isModified = true;
    }
  }

  /**
   * Abstract method for event handlers
   * Subclasses implement this to update their state based on events
   *
   * @param event - The event to handle
   */
  protected abstract when(event: DomainEvent): void;

  /**
   * Get all pending events and clear the pending list
   * Called by repository after events are persisted
   *
   * @returns Array of uncommitted events
   */
  public pullEvents(): DomainEvent[] {
    const events = [...this.pendingEvents];
    this.pendingEvents = [];
    this.isModified = false;
    return events;
  }

  /**
   * Load aggregate from event stream
   * Replays all events to reconstruct current state
   *
   * @param events - Historical events for this aggregate
   */
  public loadFromHistory(events: DomainEvent[]): void {
    for (const event of events) {
      this.applyEvent(event, false);
    }
  }

  /**
   * Mark the aggregate as committed
   * Called after events are successfully persisted
   */
  public markEventsAsCommitted(): void {
    this.pendingEvents = [];
    this.isModified = false;
  }
}

// END OF FILE
