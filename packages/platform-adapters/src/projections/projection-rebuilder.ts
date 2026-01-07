import type { DomainEvent, Projection, ProjectionRebuilder } from '@core-engine';

/**
 * Simple projection rebuilder that replays events in order.
 */
export class SimpleProjectionRebuilder implements ProjectionRebuilder {
  async rebuildAll(projection: Projection, events: DomainEvent[]): Promise<void> {
    await this.replay(projection, events);
  }

  async rebuildFrom(projection: Projection, events: DomainEvent[], sinceTimestamp: number): Promise<void> {
    const filtered = events.filter(event => event.metadata.timestamp >= sinceTimestamp);
    await this.replay(projection, filtered);
  }

  async rebuildSelective(projection: Projection, events: DomainEvent[], aggregateIds: readonly string[]): Promise<void> {
    const idSet = new Set(aggregateIds);
    const filtered = events.filter(event => idSet.has(event.aggregateId));
    await this.replay(projection, filtered);
  }

  private async replay(projection: Projection, events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await projection.apply(event);
    }
  }
}

// END OF FILE
