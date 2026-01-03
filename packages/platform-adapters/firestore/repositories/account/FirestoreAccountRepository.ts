/**
 * Firestore Account Repository
 * 
 * Implements AccountRepository using Firestore EventStore.
 * 
 * 🔒 SKELETON ONLY - Query methods return empty/null
 * 🎯 Purpose: Establish AccountRepository structure
 */

import { AccountRepository } from '@ng-events/account-domain/account/repositories/AccountRepository';
import { Account, AccountEvent } from '@ng-events/account-domain/account/aggregates/Account';
import { AccountStatus } from '@ng-events/account-domain/account/events/AccountCreated';
import { FirestoreRepository } from '../FirestoreRepository';

/**
 * Firestore-based Account Repository
 * 
 * Event Sourcing Pattern:
 * - save/load use EventStore (inherited from FirestoreRepository)
 * - Queries use Projection collections (TODO)
 */
export class FirestoreAccountRepository 
  extends FirestoreRepository<Account, string> 
  implements AccountRepository {

  /**
   * Rebuild Account from events
   */
  protected fromEvents(id: string, events: any[]): Account {
    return Account.fromEvents(events as AccountEvent[]);
  }

  /**
   * Find accounts by owner ID
   * 
   * TODO: Query projections/Account WHERE ownerId = X
   */
  async findByOwnerId(ownerId: string): Promise<Account[]> {
    // TODO: Query Projection
    return [];
  }

  /**
   * Find all active accounts
   * 
   * TODO: Query projections/Account WHERE status = 'active'
   */
  async findActiveAccounts(): Promise<Account[]> {
    // TODO: Query Projection
    return [];
  }

  /**
   * Find accounts by status
   * 
   * TODO: Query projections/Account WHERE status = X
   */
  async findByStatus(status: AccountStatus): Promise<Account[]> {
    // TODO: Query Projection
    return [];
  }

  /**
   * Count accounts
   * 
   * TODO: COUNT projections/Account WHERE status = X
   */
  async count(status?: AccountStatus): Promise<number> {
    // TODO: Query Projection
    return 0;
  }
}

// END OF FILE
