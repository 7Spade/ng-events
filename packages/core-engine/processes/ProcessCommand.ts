/**
 * Process Command Interface
 *
 * Commands emitted by Process Managers to trigger actions.
 * Follows Command pattern with causality tracking.
 */

import { CausalityMetadata } from '../causality';

/**
 * Base interface for all process commands
 *
 * Commands are emitted by processes to trigger aggregate actions.
 * They carry causality metadata linking back to the triggering event.
 */
export interface ProcessCommand<TPayload = unknown> {
  /**
   * Unique command identifier
   */
  id: string;

  /**
   * Type of command (e.g., 'CreateAccount', 'AssignTask')
   */
  commandType: string;

  /**
   * Command payload data
   */
  data: TPayload;

  /**
   * Causality metadata tracking command origin
   */
  metadata: CausalityMetadata;
}

/**
 * Factory for creating process commands
 */
export class ProcessCommandFactory {
  /**
   * Create a new process command
   *
   * @param params - Command parameters
   * @returns ProcessCommand instance
   */
  static create<TPayload>(params: {
    id: string;
    commandType: string;
    data: TPayload;
    metadata: CausalityMetadata;
  }): ProcessCommand<TPayload> {
    return {
      id: params.id,
      commandType: params.commandType,
      data: params.data,
      metadata: params.metadata,
    };
  }
}

// END OF FILE
