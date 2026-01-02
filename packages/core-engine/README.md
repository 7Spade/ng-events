# Core Engine

💎 **Pure TypeScript domain core with ZERO framework dependencies**

## Principles

> **核心永遠不知道 Angular 是什麼**

This package contains the pure domain logic and event sourcing infrastructure:

- ❌ NO Angular imports
- ❌ NO Firebase imports  
- ❌ NO framework-specific code
- ✅ Pure TypeScript only
- ✅ Framework-agnostic

## What's Inside

### 1. Causality Tracking (`causality/`)

Correlation and causation tracking for event chains:

```typescript
import { CausalityMetadata, CausalityMetadataFactory } from '@core-engine/causality';

const metadata = CausalityMetadataFactory.create({
  causedBy: 'parent-event-id',
  causedByUser: 'user-123',
  causedByAction: 'CreateTask',
  blueprintId: 'workspace-456'
});
```

### 2. Event Store (`event-store/`)

Abstract interface for event persistence:

```typescript
import { EventStore, DomainEvent } from '@core-engine/event-store';

interface EventStore {
  append(event: DomainEvent): Promise<void>;
  load(streamId: string): Promise<DomainEvent[]>;
}
```

**Note:** Core-engine only defines the interface. Platform-adapters provide the implementation.

### 3. Aggregates (`aggregates/`)

Base class for domain aggregates:

```typescript
import { AggregateRoot } from '@core-engine/aggregates';

class TaskAggregate extends AggregateRoot {
  // Aggregate implementation
  protected applyEvent(event: DomainEvent): void {
    // Apply event to state
  }
}
```

### 4. Projections (`projection/`)

Read model definitions (not implementations):

```typescript
import { ProjectionBuilder, ReadModelQuery } from '@core-engine/projection';

// Define the shape - implementation is in platform-adapters
interface TaskReadModel {
  id: string;
  title: string;
  status: string;
}
```

## Usage

This package is imported by:

- ✅ `saas-domain` - Domain models and business rules
- ✅ `platform-adapters` - Technical implementations
- ❌ Should NOT be imported directly by UI layer

## Architecture Rule

```
Core Engine → ZERO dependencies
     ↑
     | (implements interfaces)
     |
Platform Adapters → Firebase, Angular, etc.
```

**If you see Angular or Firebase imports in this package = architecture violation! 🚨**

## License

MIT
