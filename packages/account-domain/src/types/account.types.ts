/**
 * Account Types
 *
 * Core types for the Account aggregate representing business actors in the system.
 *
 * Account Model (from architecture docs):
 * - Account is the unified business entity for User/Organization/Bot
 * - User: Can login, has email/OAuth, human interface
 * - Organization: Cannot login, managed by Users, container for accounts
 * - Bot: No UI, token-based, narrow permissions
 *
 * Core Principles:
 * - Account is the ONLY entity that participates in events
 * - User/Organization/Bot are identity sources, not domain participants
 * - All authorization is based on accountId, not user/org/bot directly
 */

/**
 * AccountType - Type of account identity source
 */
export type AccountType = 'user' | 'organization' | 'bot';

/**
 * AccountStatus - Lifecycle status of an account
 */
export type AccountStatus = 'active' | 'suspended' | 'deleted';

/**
 * UserMetadata - Additional data for user accounts
 */
export interface UserMetadata {
  /**
   * Display name
   */
  readonly displayName?: string;

  /**
   * Email address (for login and notifications)
   */
  readonly email?: string;

  /**
   * Avatar/profile image URL
   */
  readonly avatarUrl?: string;

  /**
   * Firebase Auth UID (for authentication)
   */
  readonly firebaseUid?: string;
}

/**
 * OrganizationMetadata - Additional data for organization accounts
 */
export interface OrganizationMetadata {
  /**
   * Organization name
   */
  readonly name: string;

  /**
   * Billing contact email
   */
  readonly billingEmail?: string;

  /**
   * Organization logo URL
   */
  readonly logoUrl?: string;

  /**
   * Organization description
   */
  readonly description?: string;
}

/**
 * BotMetadata - Additional data for bot accounts
 */
export interface BotMetadata {
  /**
   * Bot name/identifier
   */
  readonly name: string;

  /**
   * Account ID of the owner (User or Organization)
   */
  readonly ownerAccountId: string;

  /**
   * Description of bot purpose
   */
  readonly description?: string;

  /**
   * API token (hashed) - actual token stored securely elsewhere
   */
  readonly tokenHash?: string;
}

/**
 * Union type for account metadata
 */
export type AccountMetadata = UserMetadata | OrganizationMetadata | BotMetadata;

/**
 * Account State - Current state of an Account aggregate
 */
export interface AccountState {
  /**
   * Unique account identifier
   */
  readonly accountId: string;

  /**
   * Type of account
   */
  readonly accountType: AccountType;

  /**
   * Account status
   */
  readonly status: AccountStatus;

  /**
   * Creation timestamp
   */
  readonly createdAt: string;

  /**
   * Last update timestamp
   */
  readonly updatedAt?: string;

  /**
   * Type-specific metadata
   */
  readonly metadata: AccountMetadata;
}

// END OF FILE
