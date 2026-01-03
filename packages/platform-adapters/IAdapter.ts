/**
 * IAdapter
 * 
 * Skeleton: Base interface for all platform adapters.
 * 🔒 NO IMPLEMENTATION - Interface only
 */

/**
 * Adapter Interface
 * 
 * Base contract for platform-specific adapters.
 * All adapters must support initialization and health checking.
 */
export interface IAdapter {
  /**
   * Initialize adapter with configuration
   */
  initialize(config: any): Promise<void>;

  /**
   * Check adapter health and connectivity
   */
  healthCheck(): Promise<boolean>;

  /**
   * Cleanup and dispose resources
   */
  dispose(): Promise<void>;

  /**
   * Get adapter name for identification
   */
  getName(): string;
}

// END OF FILE
