import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

/**
 * PaymentCreated Event Payload
 */
export interface PaymentCreatedPayload {
  /** Workspace where the payment belongs */
  workspaceId: string;
  /** Payment amount */
  amount: number;
  /** Currency code (ISO 4217) */
  currency: string;
  /** Initial payment status */
  status: 'pending' | 'processed' | 'refunded' | 'failed';
  /** Optional payment description */
  description?: string;
  /** Optional customer ID */
  customerId?: string;
}

/**
 * PaymentCreated Domain Event
 * 
 * Raised when a new payment is created within a workspace.
 */
export type PaymentCreated = DomainEvent<
  PaymentCreatedPayload,
  string,
  CausalityMetadata
> & {
  eventType: 'PaymentCreated';
  aggregateType: 'PaymentEntity';
};
