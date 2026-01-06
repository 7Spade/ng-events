export * from './i18n/i18n.service';
export * from './net/index';
export * from './startup/startup.service';
export * from './start-page.guard';
export * from './guards/session.guard';
export * from './guards/command.guard';
export * from './session-context.interface';
export * from './session-context.token';
export * from './auth/delon-session-context.adapter';

// 🔄 Re-export FirebaseAuthAdapter from platform-adapters for backward compatibility
// Original: './auth/firebase-auth-bridge.service'
// New location: '@platform-adapters/firebase/angular-fire'
