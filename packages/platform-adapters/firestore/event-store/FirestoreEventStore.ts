/**
 * Firestore Event Store Implementation
 * 
 * Implements EventStore interface using Firestore for persistence.
 * Events are stored in: events/{aggregateType}/{aggregateId}/events/{eventId}
 * 
 * 🔒 SKELETON ONLY - Method bodies are minimal/TODO
 * 🎯 Purpose: Establish structure for Firestore event persistence
 */

import { EventStore, DomainEvent } from '@ng-events/core-engine';

/**
 * Firestore-based Event Store
 * 
 * Collection Structure:
 * events/
 *   {aggregateType}/
 *     {aggregateId}/
 *       events/
 *         {eventId} → { id, aggregateId, eventType, data, metadata, version }
 */
export class FirestoreEventStore implements EventStore {
  /**
   * Append event to Firestore
   * 
   * TODO: Implement actual Firestore persistence
   * Path: events/{event.aggregateType}/{event.aggregateId}/events/{event.id}
   */
  async append(event: DomainEvent): Promise<void> {
    // TODO: Firestore write implementation
    // await firestore.doc(`events/${event.aggregateType}/${event.aggregateId}/events/${event.id}`).set(event)
  }

  /**
   * Load all events for a stream (aggregate)
   * 
   * TODO: Implement Firestore query
   * Query: events/{aggregateType}/{streamId}/events ORDER BY metadata.timestamp ASC
   */
  async load(streamId: string): Promise<DomainEvent[]> {
    // TODO: Firestore query implementation
    // const snapshot = await firestore.collection(`events/.../events`).orderBy('metadata.timestamp').get()
    return [];
  }
}

// END OF FILE
