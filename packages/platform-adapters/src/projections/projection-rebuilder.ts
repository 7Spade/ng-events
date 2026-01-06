import type { DomainEvent, Projection, ProjectionRebuilder } from '@core-engine';

/**
 * Simple projection rebuilder that replays events in order.
 */
export class SimpleProjectionRebuilder implements ProjectionRebuilder {
  async rebuild(projection: Projection, events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await projection.apply(event);
    }
  }
}

// END OF FILE
