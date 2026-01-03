import { Injectable } from '@angular/core';
import { AccountRepository } from '@ng-events/core-engine';

/**
 * Account Command Service
 * Handles write operations for Account aggregate
 * SKELETON ONLY - No business logic implementation
 */
@Injectable({
  providedIn: 'root'
})
export class AccountCommandService {
  constructor(
    // Inject Repository interface (NOT Firestore implementation)
    // private readonly accountRepository: AccountRepository
  ) {}

  /**
   * Create new account
   * TODO: Load aggregate → execute business method → save
   */
  async createAccount(params: {
    ownerId: string;
    // Add other parameters
  }): Promise<void> {
    // TODO: Implement command flow
    // 1. accountRepository.load() or Aggregate.create()
    // 2. Execute business method
    // 3. accountRepository.save(aggregate)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Suspend account
   * TODO: Load aggregate → suspend() → save
   */
  async suspendAccount(accountId: string): Promise<void> {
    // TODO: Implement command flow
    throw new Error('Not implemented - skeleton only');
  }
}
