# Application-Level Interfaces

## Purpose

Define **application-layer abstractions** for infrastructure concerns. These are higher-level than domain Repository interfaces and may include cross-cutting concerns like UnitOfWork.

## Responsibilities

✅ **CAN DEFINE:**
- UnitOfWork pattern interface (transaction boundaries)
- Application-specific repository extensions
- Event bus abstractions for application layer
- Query interfaces (for CQRS Query side)

❌ **CANNOT:**
- Import Firebase SDK or platform code
- Include implementation details
- Depend on UI frameworks (Angular)

## Example Interfaces (NOT IMPLEMENTED)

```typescript
// Unit of Work pattern for transactional boundaries
export interface IUnitOfWork {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

// Application-level event bus
export interface IApplicationEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
}

// CQRS Query interface
export interface IQuery<TResult> {
  execute(): Promise<TResult>;
}
```

## Relationship to Domain Interfaces

- **Domain Repository** (in `core-engine/repositories/`): Aggregate-focused, pure domain
- **Application Interfaces** (HERE): Cross-cutting concerns, orchestration needs

## Phase 1.5 Status

**NOT IMPLEMENTED** - Awaiting future implementation phase.
This README defines purpose only.
