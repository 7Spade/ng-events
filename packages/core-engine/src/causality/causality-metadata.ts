/**
 * CausalityMetadata - Dedicated causality tracking types
 *
 * Causality metadata enables:
 * - Tracing event chains (which event caused which)
 * - Building causal graphs for debugging and analysis
 * - Understanding business process flows
 * - Audit trails for compliance
 *
 * Core Principles:
 * - Every event MUST have causality metadata
 * - Causality chains form directed acyclic graphs (DAGs)
 * - blueprintId enforces multi-tenant boundaries
 */

/**
 * CausalityChain - Represents the causal relationship between events
 */
export interface CausalityChain {
  /**
   * ID of the causing event or command
   */
  readonly causedBy: string;

  /**
   * ID of the account that triggered the action
   */
  readonly causedByUser: string;

  /**
   * Description of the action
   */
  readonly causedByAction: string;

  /**
   * Workspace boundary (multi-tenant isolation)
   */
  readonly blueprintId?: string;

  /**
   * When the causation occurred
   */
  readonly timestamp: string;
}

/**
 * CausalityGraph - For analyzing event causality chains
 * Used by projections and debugging tools
 */
export interface CausalityNode {
  /**
   * Event ID
   */
  readonly eventId: string;

  /**
   * Event type
   */
  readonly eventType: string;

  /**
   * Parent event/command ID
   */
  readonly parentId: string;

  /**
   * Child event IDs
   */
  readonly children: string[];

  /**
   * Depth in the causality tree
   */
  readonly depth: number;

  /**
   * Workspace boundary
   */
  readonly blueprintId?: string;
}

/**
 * Helper to create causality metadata from command metadata
 */
export function createCausalityFromCommand(
  commandId: string,
  commandType: string,
  actorAccountId: string,
  blueprintId?: string
): CausalityChain {
  return {
    causedBy: commandId,
    causedByUser: actorAccountId,
    causedByAction: commandType,
    blueprintId,
    timestamp: new Date().toISOString()
  };
}

/**
 * Helper to create causality metadata from parent event
 */
export function createCausalityFromEvent(
  parentEventId: string,
  actionDescription: string,
  actorAccountId: string,
  blueprintId?: string
): CausalityChain {
  return {
    causedBy: parentEventId,
    causedByUser: actorAccountId,
    causedByAction: actionDescription,
    blueprintId,
    timestamp: new Date().toISOString()
  };
}

// END OF FILE
