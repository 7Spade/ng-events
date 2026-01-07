/**
 * Domain Event Contracts
 *
 * Framework-agnostic event definitions carrying tenant (blueprintId)
 * and causality metadata for replayable event sourcing pipelines.
 */
export interface CausalityMetadata {
  readonly causedBy?: string;
  readonly causedByUser?: string;
  readonly causedByAction?: string;
  readonly blueprintId?: string;
}

export interface DomainEventMetadata extends CausalityMetadata {
  /**
   * The account that initiated this event (actor / who), distinct from workspace scope.
   */
  readonly actorAccountId?: string;
  /**
   * Event version within the aggregate stream.
   */
  readonly version?: number;
  /**
   * Idempotency key for duplicate detection across retries.
   */
  readonly idempotencyKey?: string;
  /**
   * Event creation timestamp (epoch millis).
   */
  readonly timestamp: number;
}

export interface DomainEvent<TData = unknown> {
  readonly id: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly eventType: string;
  readonly data: TData;
  readonly metadata: DomainEventMetadata;
}

export type DomainEventHandler<TData = unknown> = (event: DomainEvent<TData>) => void | Promise<void>;

// END OF FILE
