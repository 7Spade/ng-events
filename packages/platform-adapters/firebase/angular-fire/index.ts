/**
 * Firebase Angular-Fire Adapters
 *
 * 🌐 Frontend / Client-side adapters using @angular/fire
 *
 * ✅ CRITICAL RULES:
 * - ONLY runs in Angular/browser
 * - Uses @angular/fire SDK (NOT firebase-admin)
 * - All queries subject to Security Rules
 * - User perspective (not god mode)
 * - NEVER import firebase-admin
 */

export * from './auth.adapter';
export * from './task.query.adapter';
