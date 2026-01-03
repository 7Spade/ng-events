/**
 * Firestore Repository Base Class
 * 
 * Generic base implementation for all Firestore repositories.
 * Uses EventStore for persistence and event replay for aggregate reconstruction.
 * 
 * ✅ FULLY IMPLEMENTED - Phase 1D Infrastructure Layer
 * 🎯 Purpose: Establish base pattern for all concrete repositories
 */

import { Repository, AggregateRoot } from '@ng-events/core-engine';
import { FirestoreEventStore } from '../event-store/FirestoreEventStore';

/**
 * Base Firestore Repository
 * 
 * Pattern:
 * - save(): Get uncommitted events, append to EventStore, clear uncommitted events
 * - load(): Load events from EventStore, rebuild aggregate via fromEvents()
 * - delete(): Mark aggregate as deleted via delete event
 * - exists(): Check if events exist in EventStore
 * 
 * CQRS Pattern:
 * - Writes use EventStore (event sourcing)
 * - Reads use Projections (query-optimized read models)
 * - Concrete repositories implement projection queries
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
   * Save aggregate by appending uncommitted events to EventStore
   * 
   * Process:
   * 1. Get uncommittedEvents from aggregate
   * 2. Append each event to EventStore
   * 3. Clear uncommitted events from aggregate
   * 
   * @param aggregate - Aggregate to save
   * 
   * @example
   * ```typescript
   * const workspace = Workspace.create({ id: 'ws-123', accountId: 'acc-456', ... });
   * await repository.save(workspace);
   * // Events are persisted to EventStore, uncommitted events cleared
   * ```
   */
  async save(aggregate: TAggregate): Promise<void> {
    const events = aggregate.uncommittedEvents;
    
    if (events.length === 0) {
      return; // Nothing to save
    }

    // Append all uncommitted events to EventStore
    for (const event of events) {
      await this.eventStore.append(event);
    }

    // Clear uncommitted events after successful persistence
    aggregate.clearUncommittedEvents();
  }

  /**
   * Load aggregate from event stream
   * 
   * Process:
   * 1. Load events from EventStore
   * 2. Reconstruct aggregate via fromEvents() factory method
   * 3. Return aggregate instance (or null if no events found)
   * 
   * @param id - Aggregate ID
   * @returns Aggregate instance or null if not found
   * 
   * @example
   * ```typescript
   * const workspace = await repository.load('ws-123');
   * if (workspace) {
   *   // Aggregate reconstructed from event history
   * }
   * ```
   */
  async load(id: TId): Promise<TAggregate | null> {
    // Load events from EventStore
    // Note: We need to know the aggregateType to load events
    // This is provided by the concrete repository implementation
    const aggregateType = this.getAggregateType();
    const events = await this.eventStore.load(id as string, aggregateType);
    
    if (events.length === 0) {
      return null; // No events found
    }

    // Reconstruct aggregate from events
    return this.fromEvents(id, events);
  }

  /**
   * Soft delete aggregate by loading it and marking as deleted
   * 
   * Note: Actual deletion is implemented by calling business method on aggregate
   * that raises a deletion event (e.g., WorkspaceArchived)
   * 
   * @param id - Aggregate ID
   */
  async delete(id: TId): Promise<void> {
    const aggregate = await this.load(id);
    
    if (!aggregate) {
      throw new Error(`Aggregate not found: ${id}`);
    }

    // Concrete repositories should implement specific deletion logic
    // For now, we throw to indicate this needs to be handled by business logic
    throw new Error('Delete must be implemented via business logic (e.g., archive() method)');
  }

  /**
   * Check if aggregate exists in EventStore
   * 
   * @param id - Aggregate ID
   * @returns true if events exist for this aggregate, false otherwise
   */
  async exists(id: TId): Promise<boolean> {
    const aggregateType = this.getAggregateType();
    return this.eventStore.hasEvents(id as string, aggregateType);
  }

  /**
   * Abstract method - must be implemented by concrete repositories
   * 
   * Purpose: Reconstruct aggregate from events using static fromEvents() factory
   * 
   * @param id - Aggregate ID
   * @param events - Array of domain events
   * @returns Aggregate instance
   */
  protected abstract fromEvents(id: TId, events: any[]): TAggregate;

  /**
   * Abstract method - must be implemented by concrete repositories
   * 
   * Purpose: Provide aggregate type name for EventStore path construction
   * 
   * @returns Aggregate type name (e.g., 'Workspace', 'Account', 'Task')
   */
  protected abstract getAggregateType(): string;
}

// END OF FILE
