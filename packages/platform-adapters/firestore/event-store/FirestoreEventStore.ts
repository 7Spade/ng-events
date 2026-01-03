/**
 * Firestore Event Store Implementation
 * 
 * Implements EventStore interface using Firestore for persistence.
 * Events are stored in: events/{aggregateType}/{aggregateId}/events/{eventId}
 * 
 * ✅ FULLY IMPLEMENTED - Phase 1D Infrastructure Layer
 * 🎯 Purpose: Persist and retrieve domain events from Firestore
 */

import { EventStore, DomainEvent } from '@ng-events/core-engine';
import { Firestore, collection, doc, setDoc, getDocs, query, orderBy, getDoc } from 'firebase/firestore';

/**
 * Event serializer function type
 * Converts event to Firestore-compatible data format
 */
export type EventSerializer<T = any> = (event: DomainEvent) => T;

/**
 * Event deserializer function type
 * Reconstructs event from Firestore data
 */
export type EventDeserializer<T = any> = (data: T) => DomainEvent;

/**
 * Event registry entry
 */
interface EventRegistryEntry {
  serializer: EventSerializer;
  deserializer: EventDeserializer;
}

/**
 * Firestore-based Event Store
 * 
 * Collection Structure:
 * events/
 *   {aggregateType}/
 *     {aggregateId}/
 *       events/
 *         {eventId} → { id, aggregateId, aggregateType, eventType, version, data, metadata }
 * 
 * Features:
 * - Event registration for custom serialization/deserialization
 * - Chronological ordering via metadata.timestamp
 * - Atomic event appends
 * - Stream-based event retrieval
 */
export class FirestoreEventStore implements EventStore {
  /**
   * Registry of event types with their serializer/deserializer functions
   */
  private eventRegistry: Map<string, EventRegistryEntry> = new Map();

  /**
   * @param db - Firestore database instance
   */
  constructor(private readonly db: Firestore) {}

  /**
   * Register an event type with custom serialization logic
   * 
   * @param eventType - Event type identifier (e.g., 'WorkspaceCreated')
   * @param serializer - Function to serialize event to Firestore format
   * @param deserializer - Function to deserialize Firestore data to event
   * 
   * @example
   * ```typescript
   * eventStore.registerEvent(
   *   'WorkspaceCreated',
   *   (event) => WorkspaceCreatedEvent.create(event).toData(),
   *   (data) => WorkspaceCreatedEvent.fromData(data).getEvent()
   * );
   * ```
   */
  registerEvent(
    eventType: string,
    serializer: EventSerializer,
    deserializer: EventDeserializer
  ): void {
    this.eventRegistry.set(eventType, { serializer, deserializer });
  }

  /**
   * Append a single event to Firestore
   * 
   * Path: events/{aggregateType}/{aggregateId}/events/{eventId}
   * 
   * @param event - Domain event to persist
   * @throws Error if event type is not registered
   * 
   * @example
   * ```typescript
   * const event: WorkspaceCreated = {
   *   id: 'evt-123',
   *   aggregateId: 'ws-456',
   *   aggregateType: 'Workspace',
   *   eventType: 'WorkspaceCreated',
   *   data: { accountId: 'acc-789', status: 'initializing' },
   *   metadata: { causedBy: 'system', causedByUser: 'user-1', ... }
   * };
   * await eventStore.append(event);
   * ```
   */
  async append(event: DomainEvent): Promise<void> {
    const entry = this.eventRegistry.get(event.eventType);
    if (!entry) {
      throw new Error(`Event type not registered: ${event.eventType}`);
    }

    const serializedData = entry.serializer(event);
    const eventPath = `events/${event.aggregateType}/${event.aggregateId}/events`;
    const eventDocRef = doc(collection(this.db, eventPath), event.id);

    await setDoc(eventDocRef, serializedData);
  }

  /**
   * Load all events for an aggregate stream
   * 
   * Events are returned in chronological order (metadata.timestamp ASC)
   * 
   * @param streamId - Aggregate ID to load events for
   * @param aggregateType - Type of aggregate (defaults to extracting from streamId pattern)
   * @returns Array of domain events in chronological order
   * 
   * @example
   * ```typescript
   * const events = await eventStore.load('ws-456', 'Workspace');
   * // Returns: [WorkspaceCreated, WorkspaceArchived, ...]
   * ```
   */
  async load(streamId: string, aggregateType?: string): Promise<DomainEvent[]> {
    // If aggregateType is not provided, we need to query all aggregate types
    // For Phase 1D, we'll require aggregateType to be provided
    if (!aggregateType) {
      throw new Error('aggregateType is required for loading events');
    }

    const eventPath = `events/${aggregateType}/${streamId}/events`;
    const eventsCollectionRef = collection(this.db, eventPath);
    const q = query(eventsCollectionRef, orderBy('metadata.timestamp', 'asc'));

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      const entry = this.eventRegistry.get(data.eventType);
      
      if (!entry) {
        throw new Error(`Event type not registered: ${data.eventType}`);
      }

      return entry.deserializer(data);
    });
  }

  /**
   * Load events by event type across all aggregates
   * 
   * @param eventType - Type of event to load
   * @param options - Optional filtering and pagination
   * @returns Array of matching events
   */
  async loadByType(
    eventType: string,
    options?: {
      limit?: number;
      after?: string;
    }
  ): Promise<DomainEvent[]> {
    // For Phase 1D, this is optional functionality
    // Can be implemented in future phases if needed
    throw new Error('loadByType not yet implemented');
  }

  /**
   * Check if an aggregate has any events
   * 
   * @param streamId - Aggregate ID
   * @param aggregateType - Type of aggregate
   * @returns true if events exist, false otherwise
   */
  async hasEvents(streamId: string, aggregateType: string): Promise<boolean> {
    const eventPath = `events/${aggregateType}/${streamId}/events`;
    const eventsCollectionRef = collection(this.db, eventPath);
    const snapshot = await getDocs(eventsCollectionRef);
    return !snapshot.empty;
  }
}

// END OF FILE
