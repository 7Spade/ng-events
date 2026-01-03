# Commands (User Intent Data Structures)

## Purpose

Commands represent **user intent** as pure data structures. They are NOT implementations - just typed contracts that describe what the user wants to do.

## Responsibilities

✅ **CAN BE:**
- Simple TypeScript interfaces or classes
- Data Transfer Objects (DTOs)
- Validation schemas (structure only, not implementation)

❌ **CANNOT:**
- Contain business logic
- Import domain aggregates directly
- Import platform-specific code
- Have methods beyond simple getters

## Example Structure (NOT IMPLEMENTED)

```typescript
// Account Domain Commands
export interface CreateAccountCommand {
  ownerId: string;
  email: string;
  displayName: string;
}

export interface CreateWorkspaceCommand {
  accountId: string;
  name: string;
  description?: string;
}

// SaaS Domain Commands
export interface CreateTaskCommand {
  workspaceId: string;  // MUST include for multi-tenant isolation
  title: string;
  description: string;
  assigneeId?: string;
}
```

## Phase 1.5 Status

**NOT IMPLEMENTED** - Awaiting future implementation phase.
This README defines structure only.
