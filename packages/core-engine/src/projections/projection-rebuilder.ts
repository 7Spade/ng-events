import type { DomainEvent } from '../events';
import type { Projection } from './projection.interface';

export type ProjectionRebuildOnError = 'skip' | 'abort';

export interface ProjectionRebuildOptions {
  readonly onError?: ProjectionRebuildOnError;
}

/**
 * ProjectionRebuilder
 *
 * Supports full, incremental, and selective replay strategies while
 * preserving causality ordering.
 */
export interface ProjectionRebuilder {
  rebuildAll(projection: Projection, events: DomainEvent[], options?: ProjectionRebuildOptions): Promise<void>;
  rebuildFrom(projection: Projection, events: DomainEvent[], sinceTimestamp: number, options?: ProjectionRebuildOptions): Promise<void>;
  rebuildSelective(
    projection: Projection,
    events: DomainEvent[],
    aggregateIds: readonly string[],
    options?: ProjectionRebuildOptions
  ): Promise<void>;
}

// END OF FILE
