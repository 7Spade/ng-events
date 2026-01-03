import { Injectable } from '@angular/core';

/**
 * Account Query Service
 * Handles read operations for Account projections
 * SKELETON ONLY - No Firestore queries implementation
 */
@Injectable({
  providedIn: 'root'
})
export class AccountQueryService {
  constructor(
    // DO NOT inject AngularFirestore or any data source
    // Queries will use projections/Account collection
  ) {}

  /**
   * Find account by owner ID
   * TODO: Query projections/Account where ownerId = X
   * @returns Account projection data (NOT aggregate)
   */
  async findByOwnerId(ownerId: string): Promise<any | null> {
    // TODO: Firestore query implementation
    // Query: projections/Account where ownerId == ownerId
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Get account by ID
   * TODO: Query projections/Account by document ID
   * @returns Account projection data (NOT aggregate)
   */
  async getById(accountId: string): Promise<any | null> {
    // TODO: Firestore query implementation
    // Get: projections/Account/{accountId}
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Check if account exists
   * TODO: Query projections/Account to check existence
   */
  async exists(accountId: string): Promise<boolean> {
    // TODO: Firestore query implementation
    throw new Error('Not implemented - skeleton only');
  }
}
