/**
 * Create Account Handler
 * 
 * Skeleton: Handles CreateAccountCommand execution.
 * 🔒 NO IMPLEMENTATION - Abstract contract only
 */

import { CreateAccountCommand } from '../commands/CreateAccountCommand';

/**
 * Create Account Command Handler
 * 
 * Abstract handler for creating new accounts.
 * Implementations will coordinate with AccountRepository.
 */
export abstract class CreateAccountHandler {
  /**
   * Execute command to create account
   * 
   * TODO: Load Account repository, create aggregate, save events
   */
  abstract execute(command: CreateAccountCommand): Promise<string>;
}

// END OF FILE
