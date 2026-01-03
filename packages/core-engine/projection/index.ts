/**
 * Projection (Read Model) Definitions
 *
 * Read models are derived from domain events.
 *
 * ⚠️ Core-engine only defines the SHAPE of read models.
 * ✅ Platform-adapters build and query read models.
 */

/**
 * Domain event interface (minimal definition for projection layer)
 */
export interface DomainEvent {
  readonly id: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly eventType: string;
  readonly data: any;
  readonly metadata: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Base interface for projection builders
 * 
 * Projection builders transform domain events into query-optimized read models.
 * They listen to events and update Firestore projections accordingly.
 * 
 * @example
 * ```typescript
 * class WorkspaceProjectionBuilder implements ProjectionBuilder {
 *   async handleEvent(event: DomainEvent): Promise<void> {
 *     switch (event.eventType) {
 *       case 'WorkspaceCreated':
 *         await this.handleWorkspaceCreated(event);
 *         break;
 *       case 'WorkspaceArchived':
 *         await this.handleWorkspaceArchived(event);
 *         break;
 *     }
 *   }
 * }
 * ```
 */
export interface ProjectionBuilder {
  /**
   * Handle a domain event and update the projection
   * 
   * This is the main entry point for projection updates.
   * Implementations should dispatch to specific event handlers.
   * 
   * @param event - Domain event to handle
   */
  handleEvent(event: DomainEvent): Promise<void>;

  /**
   * Rebuild projection from event stream (optional)
   * 
   * Useful for fixing corrupted projections or adding new projection types.
   * 
   * @param aggregateId - Aggregate ID to rebuild
   * @param events - Complete event stream for the aggregate
   */
  rebuild?(aggregateId: string, events: DomainEvent[]): Promise<void>;
}

/**
 * Read model query interface
 *
 * Defines how to query read models.
 * Implementation provided by platform-adapters.
 */
export interface ReadModelQuery<T> {
  /**
   * Get a read model by ID
   */
  getById(id: string): Promise<T | null>;

  /**
   * Query read models with filters
   */
  query(filters: Record<string, any>): Promise<T[]>;
}
