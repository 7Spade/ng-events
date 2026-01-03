/**
 * Base Projection Builder
 * 
 * Abstract base class for all projection builders.
 * Handles event dispatching and projection updates.
 * 
 * SKELETON ONLY - Method bodies are TODO
 */

import { DomainEvent } from '../../../core-engine/event-store/EventStore';

/**
 * Base projection builder interface
 * All concrete builders extend this
 */
export abstract class ProjectionBuilder<TProjection> {
  /**
   * Handle domain event and update projection
   * Dispatches to specific event handlers
   * 
   * @param event - Domain event to handle
   */
  async handleEvent(event: DomainEvent): Promise<void> {
    // TODO: Implement event type dispatching
    // switch (event.eventType) { ... }
  }

  /**
   * Rebuild projection from event stream
   * 
   * @param aggregateId - Aggregate ID to rebuild
   * @param events - Event stream for aggregate
   */
  async rebuildProjection(aggregateId: string, events: DomainEvent[]): Promise<void> {
    // TODO: Implement projection rebuild from events
    // Clear existing → replay all events in order
  }

  /**
   * Get projection by ID
   * 
   * @param id - Projection ID
   */
  abstract getProjection(id: string): Promise<TProjection | null>;

  /**
   * Save projection
   * 
   * @param projection - Projection to save
   */
  abstract saveProjection(projection: TProjection): Promise<void>;

  /**
   * Delete projection
   * 
   * @param id - Projection ID to delete
   */
  abstract deleteProjection(id: string): Promise<void>;
}

// END OF FILE
