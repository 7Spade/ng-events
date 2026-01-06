/**
 * EventStore - Interface for event persistence
 *
 * Event stores are append-only logs that:
 * - Store all domain events
 * - Support event replay for aggregate reconstruction
 * - Enable event sourcing patterns
 *
 * Core Principles:
 * - Append-only (events are never modified or deleted)
 * - Support optimistic concurrency control via version checking
 * - Enable querying by aggregate ID or stream
 */

import { DomainEvent } from '../events/domain-event';

/**
 * EventStore interface for persisting and retrieving domain events
 */
export interface EventStore {
  /**
   * Append new events to the event store
   *
   * @param aggregateId - ID of the aggregate producing the events
   * @param events - Events to append
   * @param expectedVersion - Expected current version (for optimistic concurrency)
   * @throws ConcurrencyException if expectedVersion doesn't match
   */
  append(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void>;

  /**
   * Load all events for a specific aggregate
   *
   * @param aggregateId - ID of the aggregate to load
   * @returns Array of events in order
   */
  load(aggregateId: string): Promise<DomainEvent[]>;

  /**
   * Load events for an aggregate from a specific version
   *
   * @param aggregateId - ID of the aggregate to load
   * @param fromVersion - Starting version (exclusive)
   * @returns Array of events after the specified version
   */
  loadFromVersion(aggregateId: string, fromVersion: number): Promise<DomainEvent[]>;

  /**
   * Get all events of a specific type
   * Useful for building projections
   *
   * @param eventType - Type of events to retrieve
   * @param fromTimestamp - Optional starting timestamp
   * @returns Array of matching events
   */
  getEventsByType(eventType: string, fromTimestamp?: string): Promise<DomainEvent[]>;

  /**
   * Get all events for a workspace (blueprintId)
   * Used for workspace-scoped projections and queries
   *
   * @param blueprintId - Workspace boundary ID
   * @param fromTimestamp - Optional starting timestamp
   * @returns Array of events for this workspace
   */
  getEventsByWorkspace(blueprintId: string, fromTimestamp?: string): Promise<DomainEvent[]>;
}

// END OF FILE
