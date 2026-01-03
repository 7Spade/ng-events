/**
 * RepositoryAdapterCapability
 * 
 * Interface defining repository-specific adapter capabilities.
 * 
 * 🔒 INTERFACE ONLY - NO IMPLEMENTATION
 * 📍 Location: platform-adapters/base (abstraction layer)
 * 
 * Clean Architecture Principle:
 * - Core-Engine depends on abstractions (this interface)
 * - Platform-Adapters implement this interface
 * - Dependency flows inward (Platform → Core)
 * 
 * Capabilities:
 * - Transaction management (begin/commit/rollback)
 * - Query execution
 * - Connection status
 */

import { AdapterLifecycle } from './AdapterLifecycle';

/**
 * Repository Adapter Capability Interface
 * 
 * Extends base adapter lifecycle with repository-specific operations.
 * Supports transactional operations and query capabilities.
 * 
 * Use Cases:
 * - Event Store persistence
 * - Projection storage
 * - Aggregate snapshots
 * - Query optimization
 * 
 * @example
 * ```typescript
 * class FirestoreRepositoryAdapter implements RepositoryAdapterCapability {
 *   async beginTransaction(): Promise<any> {
 *     return db.runTransaction(transaction => transaction);
 *   }
 *   
 *   async commit(transaction: any): Promise<void> {
 *     // Firestore auto-commits on transaction success
 *   }
 *   
 *   async rollback(transaction: any): Promise<void> {
 *     throw new Error('Transaction failed');
 *   }
 *   
 *   async query(queryString: string, params?: any): Promise<any> {
 *     // Execute Firestore query
 *   }
 *   
 *   isConnected(): boolean {
 *     return this.firestoreInstance !== null;
 *   }
 * }
 * ```
 */
export interface RepositoryAdapterCapability extends AdapterLifecycle {
  /**
   * Begin transaction for atomic operations
   * 
   * Should create a new transaction context that can be
   * passed to subsequent query operations.
   * 
   * @returns Promise resolving to transaction context
   */
  beginTransaction(): Promise<any>;

  /**
   * Commit transaction
   * 
   * Persists all operations performed within the transaction.
   * Should fail if transaction was already rolled back.
   * 
   * @param transaction - Transaction context from beginTransaction()
   * @returns Promise that resolves when commit completes
   */
  commit(transaction: any): Promise<void>;

  /**
   * Rollback transaction
   * 
   * Discards all operations performed within the transaction.
   * Should clean up transaction resources.
   * 
   * @param transaction - Transaction context from beginTransaction()
   * @returns Promise that resolves when rollback completes
   */
  rollback(transaction: any): Promise<void>;

  /**
   * Execute query with optional transaction context
   * 
   * Should support platform-specific query syntax.
   * If transaction is provided, query should execute within that context.
   * 
   * @param queryString - Platform-specific query string
   * @param params - Optional query parameters
   * @param transaction - Optional transaction context
   * @returns Promise resolving to query results
   */
  query(queryString: string, params?: any, transaction?: any): Promise<any>;

  /**
   * Get connection status
   * 
   * Should perform a lightweight check without network calls.
   * Use healthCheck() for deeper connectivity verification.
   * 
   * @returns true if adapter is connected, false otherwise
   */
  isConnected(): boolean;
}

// END OF FILE
