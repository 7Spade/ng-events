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
 * 
 * Clean Architecture:
 * - base/: Interface definitions (contracts) - Core depends on these
 * - */: Concrete implementations - Platform adapters implement base contracts
 */

// Base Abstractions (Interfaces)
export * from './base';

// Firebase Adapters
export * from './firebase/admin';
export * from './firebase/angular-fire';

// Auth Adapters
export * from './auth';

// Notification Adapters
export * from './notification';

// Analytics Adapters
export * from './analytics';

// AI Adapters
export * from './ai';
