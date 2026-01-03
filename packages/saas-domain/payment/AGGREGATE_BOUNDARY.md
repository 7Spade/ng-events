# Payment Aggregate Boundary

## Aggregate Root

**Payment** - Represents a financial transaction within a Workspace

## Structure

```
Payment/
├── PaymentId (Value Object) - Unique identifier
├── WorkspaceId (Foreign Key) - MANDATORY multi-tenant boundary
├── Amount (Value Object) - Payment amount with currency
├── PayerId (Foreign Key) - Account making payment
├── PaymentMethod (Value Object) - Payment method details
├── Status (Value Object) - Payment status (Pending, Processing, Completed, Failed, Refunded)
├── TransactionId (Value Object) - External payment gateway transaction ID
└── Events: PaymentInitiated, PaymentProcessed, PaymentCompleted, PaymentFailed, PaymentRefunded
```

## Responsibilities

✅ **Payment OWNS:**
- Payment lifecycle and status tracking
- Financial transaction details
- Payment method information
- Integration with payment gateway (abstraction)

❌ **Payment CANNOT:**
- Directly modify Account balance (different aggregate/context)
- Directly access Workspace metadata
- Directly trigger Task or Issue creation (different aggregates)

## Aggregate Invariants

- PaymentId is immutable after creation
- **WorkspaceId is MANDATORY** (multi-tenant isolation)
- Amount must be positive
- Currency must be valid ISO 4217 code
- Status transitions must follow payment workflow
- Once Completed or Refunded, payment cannot change status

## Value Objects

- `PaymentId`: Unique identifier for payment
- `Amount`: Monetary value with currency (e.g., USD 100.00)
- `PaymentMethod`: Payment method details (Card, BankTransfer, Crypto)
- `Status`: Enumerated status (Pending, Processing, Completed, Failed, Refunded)
- `TransactionId`: External gateway transaction reference

## Domain Events

- `PaymentInitiated`: Fired when payment is created
- `PaymentProcessed`: Fired when payment gateway processes payment
- `PaymentCompleted`: Fired when payment succeeds
- `PaymentFailed`: Fired when payment fails
- `PaymentRefunded`: Fired when payment is refunded

## Relationships to Other Aggregates

- **Workspace**: Payment belongs to one Workspace (N:1)
- **Account**: Payment is made by one Account (N:1)
- **External Gateway**: Payment integrates with external payment service (abstraction)

## Multi-Tenant Boundary (CRITICAL)

**Payment MUST be isolated by workspaceId:**

✅ **MUST DO:**
- Include `workspaceId` in ALL queries
- Validate `workspaceId` in command handlers
- Include `workspaceId` in projection schemas
- Filter by `workspaceId` in repository queries
- Audit trails include `workspaceId`

❌ **NEVER:**
- Use `accountId` or `ownerId` for isolation
- Query payments across workspaces without explicit authorization
- Expose payment details outside workspace context

## Query Patterns

```typescript
// ✅ CORRECT: Workspace-scoped query
findByWorkspaceId(workspaceId: string): Promise<Payment[]>
findByStatus(workspaceId: string, status: PaymentStatus): Promise<Payment[]>
calculateTotal(workspaceId: string, dateRange: DateRange): Promise<number>

// ❌ WRONG: Missing workspace isolation
findByStatus(status: PaymentStatus): Promise<Payment[]>
```

## Financial Compliance Note

Payment aggregate must maintain audit trail for:
- PCI-DSS compliance (payment card data)
- SOX compliance (financial reporting)
- LGPD/GDPR compliance (personal financial data)

All events must be immutable and preserve complete payment history.

## Phase 1.5 Status

**STRUCTURE DECLARED** - Implementation exists in `packages/saas-domain/payment/`
This document clarifies boundaries, multi-tenant requirements, and compliance needs.
NO code changes.
