/**
 * IRepositoryAdapter
 * 
 * Skeleton: Interface for repository platform adapters.
 * 🔒 NO IMPLEMENTATION - Interface only
 */

import { IAdapter } from './IAdapter';

/**
 * Repository Adapter Interface
 * 
 * Extends base adapter with repository-specific operations.
 * Supports transaction management and query capabilities.
 */
export interface IRepositoryAdapter extends IAdapter {
  /**
   * Begin transaction for atomic operations
   */
  beginTransaction(): Promise<any>;

  /**
   * Commit transaction
   */
  commit(transaction: any): Promise<void>;

  /**
   * Rollback transaction
   */
  rollback(transaction: any): Promise<void>;

  /**
   * Execute query with optional transaction context
   */
  query(queryString: string, params?: any, transaction?: any): Promise<any>;

  /**
   * Get connection status
   */
  isConnected(): boolean;
}

// END OF FILE
