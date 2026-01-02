/**
 * Firebase Angular Task Query Adapter
 *
 * 🌐 Frontend implementation for querying Task read models
 *
 * ✅ IMPORTANT: This file ONLY runs in Angular/browser
 * ✅ Uses @angular/fire (Client SDK wrapper)
 * ✅ Queries are subject to Security Rules
 * ❌ NEVER use firebase-admin in this file
 */

import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

// TODO: Import Task type from @saas-domain
interface Task {
  id: string;
  title: string;
  status: string;
  blueprintId: string;
}

/**
 * Task Query Adapter using @angular/fire
 *
 * Provides read-only access to Task read models.
 * All queries respect Firestore Security Rules.
 */
@Injectable({ providedIn: 'root' })
export class TaskQueryAdapter {
  private firestore = inject(Firestore);

  /**
   * Get task by ID
   * ⚠️ Subject to Security Rules
   */
  async getById(taskId: string): Promise<Task | null> {
    const taskRef = doc(this.firestore, 'tasks', taskId);
    const snapshot = await getDoc(taskRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() } as Task;
  }

  /**
   * Query tasks by blueprint
   * ⚠️ ALWAYS filter by blueprintId (multi-tenant boundary)
   */
  async getByBlueprint(blueprintId: string): Promise<Task[]> {
    const tasksRef = collection(this.firestore, 'tasks');
    const q = query(tasksRef, where('blueprintId', '==', blueprintId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data()
        }) as Task
    );
  }

  /**
   * Query tasks by status within a blueprint
   */
  async getByStatus(blueprintId: string, status: string): Promise<Task[]> {
    const tasksRef = collection(this.firestore, 'tasks');
    const q = query(tasksRef, where('blueprintId', '==', blueprintId), where('status', '==', status));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data()
        }) as Task
    );
  }
}

// END OF FILE
