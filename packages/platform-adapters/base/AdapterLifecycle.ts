/**
 * AdapterLifecycle
 * 
 * Base interface defining adapter lifecycle contract.
 * 
 * 🔒 INTERFACE ONLY - NO IMPLEMENTATION
 * 📍 Location: platform-adapters/base (abstraction layer)
 * 
 * Clean Architecture Principle:
 * - Core-Engine depends on abstractions (this interface)
 * - Platform-Adapters implement this interface
 * - Dependency flows inward (Platform → Core)
 * 
 * Lifecycle Methods:
 * - initialize(): Setup adapter with configuration
 * - healthCheck(): Verify adapter connectivity and health
 * - dispose(): Clean up resources
 * - getName(): Adapter identification
 */

/**
 * Adapter Lifecycle Interface
 * 
 * Base contract for all platform-specific adapters.
 * All adapters must support initialization, health checking, and disposal.
 * 
 * @example
 * ```typescript
 * class FirestoreAdapter implements AdapterLifecycle {
 *   async initialize(config: any): Promise<void> {
 *     // Initialize Firestore connection
 *   }
 *   
 *   async healthCheck(): Promise<boolean> {
 *     // Check Firestore connectivity
 *     return true;
 *   }
 *   
 *   async dispose(): Promise<void> {
 *     // Cleanup Firestore resources
 *   }
 *   
 *   getName(): string {
 *     return 'FirestoreAdapter';
 *   }
 * }
 * ```
 */
export interface AdapterLifecycle {
  /**
   * Initialize adapter with configuration
   * 
   * Called once during adapter setup.
   * Should establish connections and prepare resources.
   * 
   * @param config - Platform-specific configuration
   * @returns Promise that resolves when initialization completes
   */
  initialize(config: any): Promise<void>;

  /**
   * Check adapter health and connectivity
   * 
   * Should perform a lightweight check to verify the adapter
   * is operational and can communicate with its platform.
   * 
   * @returns Promise<true> if healthy, Promise<false> otherwise
   */
  healthCheck(): Promise<boolean>;

  /**
   * Cleanup and dispose resources
   * 
   * Called during shutdown or adapter replacement.
   * Should close connections and free resources.
   * 
   * @returns Promise that resolves when disposal completes
   */
  dispose(): Promise<void>;

  /**
   * Get adapter name for identification
   * 
   * Used for logging, debugging, and adapter registry.
   * Should return a unique, human-readable name.
   * 
   * @returns Adapter name (e.g., 'FirestoreAdapter', 'SupabaseAdapter')
   */
  getName(): string;
}

// END OF FILE
