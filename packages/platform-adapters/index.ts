/**
 * Platform Adapters
 *
 * 🔧 Technical implementations - The ONLY place that can touch SDKs
 *
 * Critical Rules:
 * - firebase/admin: 🛠️ Backend (firebase-admin ONLY)
 * - firebase/angular-fire: 🌐 Frontend (@angular/fire ONLY)
 * - NEVER mix the two!
 *
 * SDK Separation:
 * - @angular/fire = User perspective (browser, client)
 * - firebase-admin = System perspective (Node.js, server)
 */

// Firebase Adapters

// Auth Adapters
export * from './src/auth/auth-state.service';
export * from './src/auth/auth-adapter.service';

// Notification Adapters

// Analytics Adapters

// AI Adapters

// Session Context Adapter (skeleton)
export * from './src/session/session-context.adapter';
// Facades
export * from './src/facades/workspace.facade';
export * from './src/facades/membership.facade';
// Queries
export * from './src/queries/blueprint-query.service';
// Event store implementation
export * from './src/event-store/in-memory-event-store';
// Projection tools
export * from './src/projections/projection-rebuilder';
