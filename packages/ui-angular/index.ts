/**
 * @ng-events/ui-angular - Public API Surface
 *
 * This file serves as the main entry point for the @ng-events/ui-angular package.
 * It provides a unified API surface for external consumers by re-exporting
 * all public services, guards, helpers, components, and utilities.
 *
 * @packageDocumentation
 */

// ============================================================================
// Core Services
// ============================================================================

/**
 * I18N Service - Internationalization service for multi-language support
 * Extends AlainI18nBaseService to provide language switching and translation
 */
export { I18NService } from './src/app/core/i18n/i18n.service';

/**
 * Startup Service - Application initialization service
 * Handles app startup logic, user data loading, and initial configuration
 */
export { StartupService } from './src/app/core/startup/startup.service';

/**
 * Firebase Auth Bridge Service - Firebase authentication integration
 * Bridges Firebase Auth with Delon Auth system for unified authentication
 *
 * @deprecated Consider using platform-adapters/firebase/angular-fire instead
 */
export { FirebaseAuthBridgeService } from './src/app/core/auth/firebase-auth-bridge.service';

// ============================================================================
// Guards
// ============================================================================

/**
 * Start Page Guard - Functional route guard for dynamic start page loading
 * Implements CanActivateFn to control access to the application start page
 */
export { startPageGuard } from './src/app/core/start-page.guard';

// ============================================================================
// HTTP Interceptors & Network Utilities
// ============================================================================

/**
 * Default HTTP Interceptor - Global HTTP interceptor for request/response handling
 * Handles authentication headers, error responses, token refresh, and common HTTP operations
 */
export { defaultInterceptor } from './src/app/core/net/default.interceptor';

/**
 * Provide Bind Auth Refresh - Provider function for authentication token refresh
 * Configures automatic token refresh using @delon/auth refresh mechanism
 */
export { provideBindAuthRefresh } from './src/app/core/net/refresh-token';

/**
 * HTTP Helper Utilities - Reusable HTTP helper functions and constants
 * - AUTH_HEADER_KEY: Authorization header key
 * - REFRESH_HEADER_KEY: Refresh token header key
 * - CODEMESSAGE: HTTP status code to message mapping
 * - getAdditionalHeaders: Build consistent headers for requests
 * - checkStatus: Validate HTTP response status
 * - toLogin: Navigate to login page
 * - goTo: Navigate to specified URL
 */
export {
  AUTH_HEADER_KEY,
  REFRESH_HEADER_KEY,
  CODEMESSAGE,
  getAdditionalHeaders,
  checkStatus,
  toLogin,
  goTo,
  ReThrowHttpError
} from './src/app/core/net/helper';

// ============================================================================
// Application Providers
// ============================================================================

/**
 * Provide Startup - Provider function for application startup configuration
 * Registers StartupService with APP_INITIALIZER for application initialization
 */
export { provideStartup } from './src/app/core/startup/startup.service';

// ============================================================================
// Layout Components
// ============================================================================

/**
 * Basic Layout Component - Main application layout with header, sidebar, and content area
 * Provides the standard layout structure for authenticated application pages
 */
export { BasicComponent } from './src/app/layout/basic/basic.component';

/**
 * Blank Layout Component - Minimal layout without navigation or header
 * Useful for full-screen pages or pages that need custom layout
 */
export { BlankComponent } from './src/app/layout/blank/blank.component';

/**
 * Passport Layout Component - Authentication pages layout
 * Provides layout for login, register, and other passport-related pages
 */
export { PassportComponent } from './src/app/layout/passport/passport.component';

// ============================================================================
// Shared Modules & Imports
// ============================================================================

/**
 * Shared Imports - Collection of commonly used Angular modules and directives
 * Includes FormsModule, ReactiveFormsModule, Router modules, Delon modules, and Zorro modules
 */
export { SHARED_IMPORTS } from './src/app/shared/shared-imports';

/**
 * Shared Delon Modules - Collection of Delon ABC modules
 * Includes DelonFormModule, STModule, SVModule, SEModule, PageHeaderModule, ACL directives
 */
export { SHARED_DELON_MODULES } from './src/app/shared/shared-delon.module';

/**
 * Shared Zorro Modules - Collection of NG-ZORRO UI components
 * Includes commonly used Ant Design components for Angular
 */
export { SHARED_ZORRO_MODULES } from './src/app/shared/shared-zorro.module';

// ============================================================================
// Widgets & Form Components
// ============================================================================

/**
 * Schema Form Widgets - Custom widgets for @delon/form
 * Provides custom form field widgets that extend Delon form capabilities
 */
export { SF_WIDGETS } from './src/app/shared/json-schema/index';

/**
 * Simple Table Widgets - Custom widgets for @delon/abc/st
 * Provides custom column widgets for Delon's simple table component
 */
export { ST_WIDGETS } from './src/app/shared/st-widget/index';

/**
 * Cell Widgets - Custom widgets for @delon/abc/cell
 * Provides custom cell renderers for Delon's cell component
 */
export { CELL_WIDGETS } from './src/app/shared/cell-widget/index';

// ============================================================================
// Utilities
// ============================================================================

/**
 * Yuan Utility - Currency formatting utility for Chinese Yuan (RMB)
 * Provides helpers for formatting and displaying monetary values
 */
export { yuan } from './src/app/shared/utils/yuan';

// ============================================================================
// Adapters & Facades
// ============================================================================

/**
 * Core Engine Facade - Facade for @ng-events/core-engine integration
 * Provides Angular-specific facade for domain engine interactions
 */
export { CoreEngineFacade } from './src/app/adapters/core-engine.facade';

// ============================================================================
// Re-exports from Core Module
// ============================================================================

/**
 * Core Module Exports
 * Re-exports all public APIs from the core module barrel file
 */
export * from './src/app/core/index';

/**
 * Shared Module Exports
 * Re-exports all public APIs from the shared module barrel file
 */
export * from './src/app/shared/index';

/**
 * Adapters Module Exports
 * Re-exports all public APIs from the adapters module barrel file
 */
export * from './src/app/adapters/index';

/**
 * Layout Module Exports
 * Re-exports all public APIs from the layout module barrel file
 */
export * from './src/app/layout/index';
