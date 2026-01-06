import type { DomainEvent } from '../events';

/**
 * Utility helper to visualize causality chains (E1 ⇒ E2 ⇒ E3).
 * Implementations may render graphs or simple breadcrumb arrays.
 */
export function buildCausalityChain(events: DomainEvent[]): string[] {
  return events.map(event => {
    const causedBy = event.metadata.causedBy ? ` ⇐ ${event.metadata.causedBy}` : '';
    const blueprint = event.metadata.blueprintId ? ` [${event.metadata.blueprintId}]` : '';
    return `${event.aggregateType}#${event.aggregateId}:${event.eventType}${blueprint}${causedBy}`;
  });
}

// END OF FILE
