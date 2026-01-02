/**
 * Firebase Admin Adapters
 * 
 * 🛠️ Backend / Server-side adapters using firebase-admin
 * 
 * ⚠️ CRITICAL RULES:
 * - ONLY runs in Node.js (Cloud Run / Functions / Server)
 * - Uses firebase-admin SDK (NOT @angular/fire)
 * - Has Service Account privileges (god mode 👑)
 * - NEVER import in Angular/browser code
 */

export * from './event-store.adapter';
export * from './projection.adapter';
