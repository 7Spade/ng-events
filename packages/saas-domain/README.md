# SaaS Domain

🏢 **Pure TypeScript business domain models**

## Principles

This package contains business domain logic for the SaaS application:

- ✅ Pure TypeScript only
- ✅ Can depend on `@core-engine`
- ❌ NO Angular imports
- ❌ NO Firebase imports
- ❌ NO framework dependencies

## Domain Models

### 1. Task (`task/`)

Task management domain logic:

```typescript
import { Task } from '@saas-domain/task';

// Task aggregate, events, and business rules
// - TaskCreated, TaskUpdated, TaskCompleted events
// - Task assignment rules
// - Task status transitions
```

### 2. Payment (`payment/`)

Payment processing domain logic:

```typescript
import { Payment } from '@saas-domain/payment';

// Payment aggregate, events, and business rules
// - PaymentInitiated, PaymentProcessed, PaymentFailed events
// - Payment validation rules
// - Refund policies
```

### 3. Issue (`issue/`)

Issue tracking domain logic:

```typescript
import { Issue } from '@saas-domain/issue';

// Issue aggregate, events, and business rules
// - IssueCreated, IssueAssigned, IssueClosed events
// - Priority management
// - Workflow rules
```

## Dependencies

- `@core-engine` - Event sourcing infrastructure
- TypeScript only - No framework dependencies

## Usage

This package is imported by:

- ✅ `platform-adapters` - For event handling and persistence
- ✅ `ui-angular` (via adapters) - For business logic access
- ❌ Should NOT import framework-specific code

## Architecture

```
SaaS Domain → depends on → Core Engine
     ↓
     | (used by)
     ↓
Platform Adapters
     ↓
     | (used by)
     ↓
UI Angular
```

## License

MIT
