import { AggregateRoot, CausalityMetadataFactory } from '@ng-events/core-engine';
import { generateAggregateId, generateEventId } from '@ng-events/core-engine/utils/id-generator';

import { PaymentCreated, PaymentCreatedPayload } from '../events/PaymentCreated';
import { PaymentProcessed, PaymentProcessedPayload } from '../events/PaymentProcessed';
import { PaymentRefunded, PaymentRefundedPayload } from '../events/PaymentRefunded';
import { PaymentId } from '../value-objects/PaymentId';
import { PaymentStatus } from '../value-objects/PaymentStatus';
import { Currency } from '../value-objects/Currency';

/**
 * PaymentEntity Aggregate State
 */
export interface PaymentState {
  paymentId: PaymentId;
  workspaceId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  description?: string;
  customerId?: string;
  transactionId?: string;
  refundAmount?: number;
  createdAt: string;
  processedAt?: string;
  refundedAt?: string;
}

/**
 * Union type of all Payment events
 */
export type PaymentEvent = PaymentCreated | PaymentProcessed | PaymentRefunded;

/**
 * PaymentEntity Aggregate Root
 * 
 * Represents a payment transaction within the Payment Module.
 * Follows the Module → Entity pattern.
 */
export class PaymentEntity extends AggregateRoot<PaymentEvent, PaymentId, PaymentState> {
  readonly id: PaymentId;
  readonly type = 'PaymentEntity';
  private state: PaymentState;

  private constructor(state: PaymentState) {
    super();
    this.id = state.paymentId;
    this.state = state;
  }

  /**
   * Factory method - Create a new Payment entity
   */
  static create(params: {
    workspaceId: string;
    amount: number;
    currency: Currency;
    description?: string;
    customerId?: string;
    causedBy: string;
    causedByUser: string;
  }): PaymentEntity {
    const paymentId = generateAggregateId();
    const now = new Date().toISOString();

    const payload: PaymentCreatedPayload = {
      workspaceId: params.workspaceId,
      amount: params.amount,
      currency: params.currency,
      status: 'pending',
      description: params.description,
      customerId: params.customerId,
    };

    const event: PaymentCreated = {
      id: generateEventId(),
      aggregateId: paymentId,
      aggregateType: 'PaymentEntity',
      eventType: 'PaymentCreated',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: params.causedBy,
        causedByUser: params.causedByUser,
        causedByAction: 'payment.create',
        blueprintId: params.workspaceId,
      }),
    };

    const initialState: PaymentState = {
      paymentId,
      workspaceId: payload.workspaceId,
      amount: payload.amount,
      currency: payload.currency as Currency,
      status: payload.status,
      description: payload.description,
      customerId: payload.customerId,
      createdAt: now,
    };

    const payment = new PaymentEntity(initialState);
    payment.raiseEvent(event);
    return payment;
  }

  /**
   * Factory method - Reconstruct Payment entity from event stream
   */
  static fromEvents(events: PaymentEvent[]): PaymentEntity {
    if (events.length === 0) {
      throw new Error('Cannot reconstruct PaymentEntity from empty event stream');
    }

    const firstEvent = events[0];
    if (firstEvent.eventType !== 'PaymentCreated') {
      throw new Error('First event must be PaymentCreated');
    }

    const payment = new PaymentEntity({
      paymentId: firstEvent.aggregateId,
      workspaceId: firstEvent.data.workspaceId,
      amount: firstEvent.data.amount,
      currency: firstEvent.data.currency as Currency,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    events.forEach(event => payment.applyEvent(event));
    return payment;
  }

  protected applyEvent(event: PaymentEvent): void {
    switch (event.eventType) {
      case 'PaymentCreated':
        this.state.workspaceId = event.data.workspaceId;
        this.state.amount = event.data.amount;
        this.state.currency = event.data.currency as Currency;
        this.state.status = event.data.status;
        this.state.description = event.data.description;
        this.state.customerId = event.data.customerId;
        this.state.createdAt = event.metadata.timestamp.toISOString();
        break;

      case 'PaymentProcessed':
        this.state.status = 'processed';
        this.state.processedAt = event.data.processedAt;
        this.state.transactionId = event.data.transactionId;
        break;

      case 'PaymentRefunded':
        this.state.status = 'refunded';
        this.state.refundAmount = event.data.refundAmount;
        this.state.refundedAt = event.data.refundedAt;
        break;

      default:
        const _exhaustive: never = event;
        throw new Error(`Unknown event type: ${(_exhaustive as any).eventType}`);
    }
  }

  /**
   * Process payment
   */
  process(params: {
    transactionId?: string;
    notes?: string;
    causedBy: string;
    causedByUser: string;
  }): void {
    if (this.state.status !== 'pending') {
      throw new Error('Can only process pending payments');
    }

    const payload: PaymentProcessedPayload = {
      processedAt: new Date().toISOString(),
      transactionId: params.transactionId,
      notes: params.notes,
    };

    const event: PaymentProcessed = {
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'PaymentEntity',
      eventType: 'PaymentProcessed',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: params.causedBy,
        causedByUser: params.causedByUser,
        causedByAction: 'payment.process',
        blueprintId: this.state.workspaceId,
      }),
    };

    this.raiseEvent(event);
  }

  /**
   * Refund payment
   */
  refund(params: {
    refundAmount: number;
    reason?: string;
    causedBy: string;
    causedByUser: string;
  }): void {
    if (this.state.status !== 'processed') {
      throw new Error('Can only refund processed payments');
    }

    if (params.refundAmount > this.state.amount) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    const payload: PaymentRefundedPayload = {
      refundAmount: params.refundAmount,
      reason: params.reason,
      refundedAt: new Date().toISOString(),
    };

    const event: PaymentRefunded = {
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'PaymentEntity',
      eventType: 'PaymentRefunded',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: params.causedBy,
        causedByUser: params.causedByUser,
        causedByAction: 'payment.refund',
        blueprintId: this.state.workspaceId,
      }),
    };

    this.raiseEvent(event);
  }

  // Getters
  get workspaceId(): string { return this.state.workspaceId; }
  get amount(): number { return this.state.amount; }
  get currency(): Currency { return this.state.currency; }
  get status(): PaymentStatus { return this.state.status; }
  get description(): string | undefined { return this.state.description; }
  get customerId(): string | undefined { return this.state.customerId; }
  get transactionId(): string | undefined { return this.state.transactionId; }
  get refundAmount(): number | undefined { return this.state.refundAmount; }
  get createdAt(): string { return this.state.createdAt; }
  get processedAt(): string | undefined { return this.state.processedAt; }
  get refundedAt(): string | undefined { return this.state.refundedAt; }

  // Helper methods
  get isPending(): boolean { return this.state.status === 'pending'; }
  get isProcessed(): boolean { return this.state.status === 'processed'; }
  get isRefunded(): boolean { return this.state.status === 'refunded'; }
  get isFailed(): boolean { return this.state.status === 'failed'; }
}

export type PaymentEntityState = PaymentState;
export type PaymentEntityEvent = PaymentEvent;
export type Payment = PaymentEntity;
