export type AccountType = 'user' | 'organization' | 'bot';
export type AccountStatus = 'active' | 'suspended' | 'deleted';

export interface UserMetadata {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
}

export interface OrganizationMetadata {
  name?: string;
  billingEmail?: string;
  logoUrl?: string;
}

export interface BotMetadata {
  name?: string;
  ownerAccountId?: string;
  description?: string;
}

export type AccountMetadata = UserMetadata | OrganizationMetadata | BotMetadata;

/**
 * Account model scaffold (Phase 0)
 * Optional metadata fields are projection/adapter-populated and may be undefined until hydrated.
 */
export interface Account {
  accountId: string;
  accountType: AccountType;
  status: AccountStatus;
  createdAt: number;
  metadata: AccountMetadata;
}

// END OF FILE
