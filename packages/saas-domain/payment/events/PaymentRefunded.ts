import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

/**
 * PaymentRefunded Event Payload
 */
export interface PaymentRefundedPayload {
  /** Refund amount (may be partial) */
  refundAmount: number;
  /** Reason for refund */
  reason?: string;
  /** Timestamp of refund */
  refundedAt: string;
}

/**
 * PaymentRefunded Domain Event
 * 
 * Raised when a payment is refunded (full or partial).
 */
export type PaymentRefunded = DomainEvent<
  PaymentRefundedPayload,
  string,
  CausalityMetadata
> & {
  eventType: 'PaymentRefunded';
  aggregateType: 'PaymentEntity';
};
