<!-- markdownlint-disable-file -->

# Task Research Notes: ng-events architecture skeleton and auth chain

## Research Executed

### File Analysis

- ng-events_Architecture.md
  - Captures full target architecture: multi-tenant chain Account → Workspace (blueprintId) → Module → Entity, event-sourcing with causality metadata, package skeletons, and auth chain @angular/fire/auth → @delon/auth → DA_SERVICE_TOKEN → @delon/acl.
- packages/ (core-engine, account-domain, saas-domain, platform-adapters, ui-angular)
  - Monorepo layout already present; only core-engine src has session-context interface; other domains are stubs (no src), platform-adapters holds session/auth adapters, ui-angular contains Angular SPA code and auth bridge.
- .github/instructions/auth-flow.instructions.yml, account-domain.instructions.yml
  - Enforce single auth flow, DA_SERVICE_TOKEN for domain services, no SDK leakage into domains; domain logic isolated and exposed via index.ts.
- packages/ui-angular/src/app/core/auth/firebase-auth-bridge.service.ts
  - Concrete example of auth chain bridge syncing Firebase Auth to @delon/auth token service; ensures single listener and token propagation.
- packages/core-engine/src/session/session-context.interface.ts
  - Defines session context contract including optional blueprintId for tenant boundary.

### Code Search Results

- "DA_SERVICE_TOKEN"
  - Found in auth instructions, ui-angular auth components (login/lock), helper utilities, and auth bridge; confirms DA_SERVICE_TOKEN is the injection token for token service and guard pipeline.
- "blueprintId"
  - Present only in core-engine README and session-context interface, indicating tenant key is defined but not yet wired across domains/adapters.

### External Research

- #githubRepo:"7Spade/ng-events auth DA_SERVICE_TOKEN skeleton"
  - Not executed; internal architecture document and repo sources already define required flow.
- #fetch:https://angular.dev/guide/standalone-components
  - Reference for standalone Angular components; aligns with ui-angular instructions to use standalone + signals.

### Project Conventions

- Standards referenced: .github/instructions/auth-flow.instructions.yml, account-domain.instructions.yml, angular instructions (standalone + signals), dependency-injection guidance.
- Instructions followed: enforce auth chain @angular/fire/auth → @delon/auth → DA_SERVICE_TOKEN → @delon/acl; domain isolation with DA_SERVICE_TOKEN entry; multi-tenant blueprintId through commands/events per architecture doc.

## Key Discoveries

### Project Structure

- Monorepo packages already scaffolded: core-engine, account-domain, saas-domain, platform-adapters, ui-angular. Only core-engine contains code (session-context interface); other domains are empty stubs. Platform-adapters include session/auth adapter; ui-angular hosts SPA with multiple DA_SERVICE_TOKEN usages and Firebase auth bridge.
- Architecture doc prescribes strict dependency flow: ui-angular → platform-adapters → domain (account/saas) → core-engine → storage/event bus; adapters are sole place for SDKs (@angular/fire, firebase-admin).

### Implementation Patterns

- Auth chain: Firebase Auth events are bridged into @delon/auth via DA_SERVICE_TOKEN, then ACL via @delon/acl guards. Single listener pattern to avoid duplicate onAuthStateChanged.
- Multi-tenant: blueprintId represents workspace boundary; commands/events must carry blueprintId and causality metadata; Account → Workspace → Module → Entity enforced by membership/ACL policies (currently not implemented in code).
- Adapters expected to expose DA_SERVICE_TOKEN facades that enrich commands with auth claims and blueprintId before invoking domain services.

### Complete Examples

```typescript
// packages/ui-angular/src/app/core/auth/firebase-auth-bridge.service.ts
@Injectable({ providedIn: 'root' })
export class FirebaseAuthBridgeService {
  private auth = inject(Auth);
  private tokenService = inject<ITokenService>(DA_SERVICE_TOKEN);
  private authState$ = new ReplaySubject<User | null>(1);
  private unsubscribeFn?: Unsubscribe;

  init(): void {
    if (this.unsubscribeFn) return;
    this.unsubscribeFn = onAuthStateChanged(this.auth, async (user) => {
      await this.syncToken(user);
      this.authState$.next(user);
    });
    void this.syncToken(this.auth.currentUser);
    this.authState$.next(this.auth.currentUser);
  }

  async refreshToken(): Promise<string> { /* syncs Firebase token into @delon/auth */ }
}
```

### API and Schema Documentation

- SessionContext (packages/core-engine/src/session/session-context.interface.ts) defines optional `blueprintId` plus standard identity fields; serves as blueprint for propagating tenant boundary through DA_SERVICE_TOKEN services and ACL.

### Configuration Examples

```text
packages/
  core-engine/ (event store & causality contracts; current: session-context.interface.ts)
  account-domain/ (Account, Workspace, Membership aggregates) [stub]
  saas-domain/ (Task/Issue/etc aggregates) [stub]
  platform-adapters/ (auth/session adapters; expected firebase/admin + angular-fire facades)
  ui-angular/ (SPA with DA_SERVICE_TOKEN guards, auth bridge, features)
```

### Technical Requirements

- Enforce Account → Workspace (blueprintId) → Module → Entity chain with membership/ACL enforcement.
- Implement auth pipeline @angular/fire/auth → @delon/auth → DA_SERVICE_TOKEN → @delon/acl, reusing centralized token service and guards.
- Build skeletons per architecture doc: event-sourcing contracts in core-engine; domain aggregates/commands/events for account-domain and saas-domain; adapter facades providing DA_SERVICE_TOKEN entry points; Angular facades/guards consuming adapters.

## Recommended Approach

Adopt the architecture doc’s layered skeleton: keep domains pure TypeScript with event-sourcing contracts from core-engine, expose all UI/backend entry through platform-adapters wired to DA_SERVICE_TOKEN, and propagate blueprintId/causality metadata through commands/events. Scaffold missing src trees for account-domain and saas-domain (aggregates, commands, events, projections, policies) plus adapter facades (angular-fire/admin) that enrich commands with auth claims and blueprintId before calling domain services. Ensure ui-angular uses standalone + signals components with ACL guards fed by the centralized auth bridge.

## Implementation Guidance

- **Objectives**: Establish package skeletons matching Architecture.md; wire auth chain and tenant metadata (blueprintId) through adapters into domains using DA_SERVICE_TOKEN.
- **Key Tasks**:
  - Create src trees for account-domain and saas-domain with placeholder aggregates/commands/events aligned to Account → Workspace → Module → Entity.
  - Extend core-engine contracts (events/causality/projections) from Architecture.md to support event sourcing and metadata.
  - Add platform-adapters facades (client/admin) that translate UI DTOs, inject auth claims, and enforce blueprintId before invoking domain services; expose DA_SERVICE_TOKEN provider.
  - Update ui-angular facades/guards to rely exclusively on adapter services and ACL permissions derived from blueprintId and membership projections.
- **Dependencies**: Auth chain components (@angular/fire/auth, @delon/auth, DA_SERVICE_TOKEN, @delon/acl); core-engine contracts; membership/ACL policies in account-domain.
- **Success Criteria**: Monorepo reflects prescribed skeleton, all auth paths use single bridge and DA_SERVICE_TOKEN, commands/events carry blueprintId/causality metadata, and UI consumes adapter facades with ACL guards honoring the Account → Workspace → Module → Entity hierarchy.
