/**
 * Firebase Admin Projection Adapter
 * 
 * 🛠️ Backend implementation for building read models
 * 
 * ⚠️ IMPORTANT: This file should ONLY run in Node.js (Cloud Run / Functions)
 * ⚠️ NEVER import this in Angular/browser code
 * 
 * Builds projection (read models) from domain events.
 */

import { DomainEvent } from '@core-engine/event-store';

// TODO: Import firebase-admin
// import * as admin from 'firebase-admin';

/**
 * Firebase Admin Projection Builder
 * 
 * Subscribes to domain events and builds read models.
 * Uses firebase-admin for unrestricted access.
 */
export class FirebaseAdminProjectionBuilder<T> {
  // private firestore: admin.firestore.Firestore;
  
  constructor(
    private collectionName: string,
    private buildFromEvent: (event: DomainEvent) => Partial<T>
  ) {
    // TODO: Initialize firebase-admin
    // this.firestore = admin.firestore();
  }
  
  /**
   * Handle a domain event and update the read model
   */
  async handleEvent(event: DomainEvent): Promise<void> {
    // TODO: Implement using firebase-admin
    // const projection = this.buildFromEvent(event);
    // await this.firestore
    //   .collection(this.collectionName)
    //   .doc(event.aggregateId)
    //   .set(projection, { merge: true });
    
    console.log('FirebaseAdminProjectionBuilder.handleEvent:', event.eventType);
  }
  
  /**
   * Rebuild projection from event stream
   */
  async rebuild(streamId: string, events: DomainEvent[]): Promise<void> {
    // TODO: Implement batch rebuild using firebase-admin
    // const batch = this.firestore.batch();
    // events.forEach(event => {
    //   const projection = this.buildFromEvent(event);
    //   const docRef = this.firestore.collection(this.collectionName).doc(streamId);
    //   batch.set(docRef, projection, { merge: true });
    // });
    // await batch.commit();
    
    console.log('FirebaseAdminProjectionBuilder.rebuild:', streamId, events.length);
  }
}
