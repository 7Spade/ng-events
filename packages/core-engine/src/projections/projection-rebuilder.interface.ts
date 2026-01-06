import type { DomainEvent } from '../events';
import type { Projection } from './projection.interface';

/**
 * ProjectionRebuilder
 *
 * Utility interface for replaying historical events to rebuild read models.
 */
export interface ProjectionRebuilder {
  rebuild(projection: Projection, events: DomainEvent[]): Promise<void>;
}

// END OF FILE
