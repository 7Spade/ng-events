# First Vertical Slice: Workspace

## Why Workspace is First

Workspace is designated as the **first vertical slice** for end-to-end implementation because:

1. **Multi-Tenant Boundary**: WorkspaceId is the ONLY isolation boundary for all SaaS operations
2. **Dependency Priority**: All SaaS entities (Task, Payment, Issue) require valid WorkspaceId
3. **Architecture Validation**: Proves the Event Sourcing + CQRS + Projection pattern end-to-end
4. **Minimal Dependencies**: Only depends on Account (which already exists in skeleton)

## Vertical Slice Scope

A complete Workspace vertical slice includes:

### Domain Layer (core-engine + account-domain)
- ✅ Workspace aggregate (DONE - skeleton exists)
- ✅ Workspace events (DONE - skeleton exists)
- ✅ Workspace value objects (DONE - skeleton exists)

### Application Layer (core-engine/application)
- ⏳ CreateWorkspaceCommand (TO DO)
- ⏳ CreateWorkspaceHandler (TO DO)
- ⏳ UpdateWorkspaceCommand (TO DO)
- ⏳ DeleteWorkspaceCommand (TO DO)

### Infrastructure Layer (platform-adapters)
- ✅ WorkspaceRepository (DONE - skeleton exists)
- ✅ FirestoreEventStore for Workspace (DONE - skeleton exists)
- ✅ WorkspaceProjectionBuilder (DONE - skeleton exists)

### UI Layer (ui-angular)
- ✅ WorkspaceCommandService (DONE - skeleton exists)
- ✅ WorkspaceQueryService (DONE - skeleton exists)
- ⏳ Workspace feature components (TO DO)
- ⏳ Workspace routing (TO DO)

## Implementation Order

1. **Application Layer**: Define Commands and Handlers
2. **Infrastructure Implementation**: Implement Repository with actual Firestore SDK
3. **Projection Implementation**: Implement WorkspaceProjectionBuilder with actual Firestore writes
4. **UI Implementation**: Implement Angular components and services with actual DI
5. **End-to-End Testing**: Validate complete flow from UI → Command → Aggregate → Event → Projection → Query → UI

## Success Criteria

Workspace vertical slice is complete when:

- [ ] User can create a workspace via UI
- [ ] Event is stored in Firestore events/{Workspace}/{workspaceId}/events
- [ ] Projection is updated in Firestore projections/Workspace
- [ ] User can query workspace via UI (reads from projection)
- [ ] All queries correctly filter by workspaceId
- [ ] Complete audit trail exists in event stream

## Next Vertical Slices

After Workspace is complete, implement in order:

1. **Membership** (depends on Workspace + Account)
2. **Task** (SaaS entity, validates workspace isolation)
3. **Payment** (financial compliance validation)
4. **Issue** (completes SaaS domain)

## Phase 1.5 Status

**MARKED FOR IMPLEMENTATION** - This document declares Workspace as the first vertical slice.
Implementation will occur in future phases, NOT in Phase 1.5.
