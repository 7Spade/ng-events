/**
 * Firebase Admin Event Store Adapter
 *
 * 🛠️ Backend implementation using firebase-admin SDK
 *
 * ⚠️ IMPORTANT: This file should ONLY run in Node.js (Cloud Run / Functions)
 * ⚠️ NEVER import this in Angular/browser code
 *
 * Implements the EventStore interface from @core-engine
 */

import { DomainEvent, EventStore } from '@core-engine/event-store';

// TODO: Import firebase-admin (NOT @angular/fire)
// import * as admin from 'firebase-admin';

/**
 * Firebase Admin Event Store Implementation
 *
 * Uses firebase-admin to write events to Firestore.
 * Runs with Service Account credentials (god mode 👑).
 */
export class FirebaseAdminEventStore implements EventStore {
  // private firestore: admin.firestore.Firestore;

  constructor() {
    // TODO: Initialize firebase-admin
    // this.firestore = admin.firestore();
  }

  /**
   * Append event to Firestore using admin SDK
   * Bypasses all Security Rules
   */
  async append(event: DomainEvent): Promise<void> {
    // TODO: Implement using firebase-admin
    // await this.firestore
    //   .collection('events')
    //   .doc(event.id)
    //   .set({
    //     ...event,
    //     createdAt: admin.firestore.FieldValue.serverTimestamp()
    //   });

    console.log('FirebaseAdminEventStore.append:', event.eventType);
  }

  /**
   * Load events by stream ID using admin SDK
   */
  async load(streamId: string): Promise<DomainEvent[]> {
    // TODO: Implement using firebase-admin
    // const snapshot = await this.firestore
    //   .collection('events')
    //   .where('aggregateId', '==', streamId)
    //   .orderBy('metadata.timestamp', 'asc')
    //   .get();

    // return snapshot.docs.map(doc => doc.data() as DomainEvent);

    console.log('FirebaseAdminEventStore.load:', streamId);
    return [];
  }
}
