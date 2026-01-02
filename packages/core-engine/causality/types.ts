/**
 * Causality Tracking Types
 *
 * Provides correlation and causation tracking for event chains.
 * Ensures complete audit trail and enables event replay.
 */

/**
 * Unique identifier for tracking related events across the system
 */
export type CorrelationId = string;

/**
 * Identifier linking an event to its causing event
 */
export type CausationId = string;

/**
 * Timestamp in ISO 8601 format
 */
export type Timestamp = string;

/**
 * Causality metadata attached to every domain event
 * Enables tracking of event chains and causation relationships
 */
export interface CausalityMetadata {
  /**
   * ID of the parent event that caused this event
   */
  causedBy: CausationId;

  /**
   * User who triggered the action
   */
  causedByUser: string;

  /**
   * Action/command that caused this event
   */
  causedByAction: string;

  /**
   * When this event occurred
   */
  timestamp: Timestamp;

  /**
   * Multi-tenant boundary identifier
   * In SaaS context, typically the organization/workspace ID
   */
  blueprintId: string;

  /**
   * Correlation ID for tracking related events
   */
  correlationId?: CorrelationId;
}

/**
 * Factory for creating causality metadata
 */
export class CausalityMetadataFactory {
  static create(params: {
    causedBy: CausationId;
    causedByUser: string;
    causedByAction: string;
    blueprintId: string;
    correlationId?: CorrelationId;
  }): CausalityMetadata {
    return {
      ...params,
      timestamp: new Date().toISOString()
    };
  }
}
