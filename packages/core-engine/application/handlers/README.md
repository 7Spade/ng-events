# Command Handlers (Domain Orchestration Abstractions)

## Purpose

CommandHandlers define **abstract orchestration contracts** for executing commands. They bridge UI intent (Commands) with domain logic (Aggregates).

## Responsibilities

✅ **CAN DO:**
- Define abstract handler interfaces
- Specify orchestration flow (load → execute → save) via method signatures
- Coordinate multiple aggregates for cross-aggregate workflows
- Return Result types or domain events

❌ **CANNOT DO:**
- Contain actual implementation (abstract/interface only)
- Import Firebase SDK or AngularFire
- Import Angular framework code
- Include business rules (those are in aggregates)

## Pattern (NOT IMPLEMENTED)

```typescript
// Abstract handler interface example
export abstract class CommandHandler<TCommand, TResult> {
  abstract execute(command: TCommand): Promise<Result<TResult>>;
}

// Account domain handler example
export abstract class CreateAccountHandler 
  extends CommandHandler<CreateAccountCommand, AccountCreatedEvent> {
  // Implementation in platform-adapters layer
}

// SaaS domain handler example
export abstract class CreateTaskHandler 
  extends CommandHandler<CreateTaskCommand, TaskCreatedEvent> {
  // Implementation in platform-adapters layer
  // MUST validate workspaceId for multi-tenant isolation
}
```

## Standard Flow

All handlers follow this orchestration pattern:

```
1. Load aggregate (or create new)
2. Execute business method on aggregate
3. Save aggregate (append events to EventStore)
4. Return Result<Event>
```

## Phase 1.5 Status

**NOT IMPLEMENTED** - Awaiting future implementation phase.
This README defines pattern only.
