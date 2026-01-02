# Request Details
- Goal: Align generics for DomainEvent and AggregateRoot and add T/I/S aliases for account-domain aggregates per prompt.
- Files: packages/core-engine/event-store/EventStore.ts; packages/core-engine/aggregates/AggregateRoot.ts; account-domain aggregates (Account, Workspace, Membership, ModuleRegistry) and index exports if needed.
- Constraints: Type-only changes, keep comments, no runtime behavior changes, maintain // END OF FILE markers.
