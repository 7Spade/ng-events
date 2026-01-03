/**
 * Firestore Repository Base Class
 * 
 * Generic base implementation for all Firestore repositories.
 * Uses EventStore for persistence and event replay for aggregate reconstruction.
 * 
 * 🔒 SKELETON ONLY - Method bodies are minimal/TODO
 * 🎯 Purpose: Establish base pattern for all concrete repositories
 */

import { Repository, AggregateRoot } from '@ng-events/core-engine';
import { FirestoreEventStore } from '../event-store/FirestoreEventStore';

/**
 * Base Firestore Repository
 * 
 * Pattern:
 * - save(): Append uncommitted events to EventStore
 * - load(): Load events from EventStore, rebuild aggregate via fromEvents()
 * - delete(): Append deletion event (soft delete)
 * 
 * @template TAggregate - Aggregate type
 * @template TId - ID type (usually string)
 */
export abstract class FirestoreRepository<
  TAggregate extends AggregateRoot<any, TId, any>,
  TId = string
> implements Repository<TAggregate, TId> {
  
  constructor(
    protected eventStore: FirestoreEventStore
  ) {}

  /**
   * Save aggregate by appending uncommitted events
   * 
   * TODO: Implement event persistence logic
   * 1. Get uncommittedEvents from aggregate
   * 2. Batch append to EventStore
   * 3. Clear uncommitted events
   */
  async save(aggregate: TAggregate): Promise<void> {
    // TODO: Implement save logic
    // const events = aggregate.uncommittedEvents;
    // for (const event of events) { await this.eventStore.append(event); }
    // aggregate.markEventsAsCommitted();
  }

  /**
   * Load aggregate from event stream
   * 
   * TODO: Implement event replay logic
   * 1. Load events from EventStore
   * 2. Call abstract fromEvents() method
   */
  async load(id: TId): Promise<TAggregate | null> {
    // TODO: Implement load logic
    // const events = await this.eventStore.load(id as string);
    // if (events.length === 0) return null;
    // return this.fromEvents(id, events);
    return null;
  }

  /**
   * Soft delete aggregate
   * 
   * TODO: Implement deletion event append
   */
  async delete(id: TId): Promise<void> {
    // TODO: Implement delete logic (append deletion event)
  }

  /**
   * Check if aggregate exists
   * 
   * TODO: Query EventStore or Projection
   */
  async exists(id: TId): Promise<boolean> {
    // TODO: Implement exists check
    return false;
  }

  /**
   * Abstract method - must be implemented by concrete repositories
   * 
   * Purpose: Reconstruct aggregate from events using static fromEvents()
   */
  protected abstract fromEvents(id: TId, events: any[]): TAggregate;
}

// END OF FILE
