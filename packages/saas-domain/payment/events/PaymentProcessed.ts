import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

/**
 * PaymentProcessed Event Payload
 */
export interface PaymentProcessedPayload {
  /** Timestamp of processing */
  processedAt: string;
  /** Transaction ID from payment gateway */
  transactionId?: string;
  /** Optional processing notes */
  notes?: string;
}

/**
 * PaymentProcessed Domain Event
 * 
 * Raised when a payment is successfully processed.
 */
export type PaymentProcessed = DomainEvent<
  PaymentProcessedPayload,
  string,
  CausalityMetadata
> & {
  eventType: 'PaymentProcessed';
  aggregateType: 'PaymentEntity';
};
