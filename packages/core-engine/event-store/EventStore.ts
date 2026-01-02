/**
 * Event Store Abstractions
 *
 * Core interfaces for event sourcing.
 * Implementation is provided by platform-adapters (e.g., Firebase, PostgreSQL).
 *
 * 🔒 IMPORTANT: This is pure TypeScript - NO framework dependencies allowed.
 */

import { CausalityMetadata } from '../causality';

/**
 * Base interface for all domain events
 *
 * Every event MUST include causality metadata for audit and replay.
 */
export interface DomainEvent<
  TData = unknown,
  TId = string,
  TMetadata extends CausalityMetadata = CausalityMetadata
> {
  /**
   * Unique event identifier
   */
  id: string;

  /**
   * ID of the aggregate this event belongs to
   */
  aggregateId: TId;

  /**
   * Type of aggregate (e.g., 'Task', 'Payment', 'Issue')
   */
  aggregateType: string;

  /**
   * Type of event (e.g., 'TaskCreated', 'PaymentProcessed')
   */
  eventType: string;

  /**
   * Event payload data
   */
  data: TData;

  /**
   * Causality metadata for tracking event chains
   */
  metadata: TMetadata;
}

/**
 * Event Store Interface
 *
 * Abstract interface for storing and retrieving domain events.
 *
 * ⚠️ Core-engine only defines the interface.
 * ✅ Platform-adapters provide the implementation.
 *
 * Generics align to TEvent (event shape) and TId (aggregate identifier)
 * per docs/泛型縮寫清單.md.
 */
export interface EventStore<
  TEvent extends DomainEvent = DomainEvent,
  TId = TEvent extends DomainEvent<unknown, infer A, any> ? A : string
> {
  /**
   * Append a new event to the event stream
   *
   * @param event - The domain event to store
   * @returns Promise that resolves when event is persisted
   */
  append(event: TEvent): Promise<void>;

  /**
   * Load all events for a specific stream (aggregate)
   *
   * @param streamId - The aggregate ID
   * @returns Promise with array of events in order
   */
  load(streamId: TId): Promise<TEvent[]>;

  /**
   * Load events by type
   *
   * @param eventType - The type of events to load
   * @param options - Optional filtering and pagination
   * @returns Promise with array of matching events
   */
  loadByType?(
    eventType: string,
    options?: {
      limit?: number;
      after?: string;
    }
  ): Promise<TEvent[]>;
}

/**
 * Stream identifier type
 */
export type StreamId = string;

/**
 * Event sequence number within a stream
 */
export type EventSequence = number;
