/**
 * Projection (Read Model) Definitions
 * 
 * Read models are derived from domain events.
 * 
 * ⚠️ Core-engine only defines the SHAPE of read models.
 * ✅ Platform-adapters build and query read models.
 */

/**
 * Base interface for projection builders
 */
export interface ProjectionBuilder<T> {
  /**
   * Project events into a read model
   * 
   * @param events - Events to project
   * @returns The projected read model
   */
  project(events: any[]): T;
  
  /**
   * Handle a single event update
   * 
   * @param model - Current read model state
   * @param event - New event to apply
   * @returns Updated read model
   */
  handleEvent(model: T, event: any): T;
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
