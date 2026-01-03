/**
 * Create Account Command
 * 
 * Skeleton: User intent to create a new account.
 * 🔒 NO IMPLEMENTATION - Data structure only
 */

/**
 * Create Account Command
 * 
 * Represents user intent to create a new account in the system.
 */
export interface CreateAccountCommand {
  ownerId: string;
  status?: 'active' | 'suspended' | 'closed';
  blueprintId?: string;
}

// END OF FILE
