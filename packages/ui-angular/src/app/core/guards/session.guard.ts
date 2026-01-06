import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ACLService } from '@delon/acl';

import { SESSION_CONTEXT } from '../session-context.token';

/**
 * SessionGuard
 *
 * Enforces the Identity → SessionContext → ACL boundary.
 * No direct token or Firebase access; all session data flows through SessionContext.
 */
export const sessionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const session = inject(SESSION_CONTEXT);
  const acl = inject(ACLService);

  if (!session.isAuthenticated || session.isExpired()) {
    return router.createUrlTree(['/passport/login'], { queryParams: { returnUrl: state.url } });
  }

  if (route.data?.['requireWorkspace'] && !session.workspaceId) {
    return router.createUrlTree(['/exception/403']);
  }

  if (route.data?.['requireBlueprint'] && !session.blueprintId) {
    return router.createUrlTree(['/exception/403']);
  }

  const moduleKey = route.data?.['moduleKey'];
  if (moduleKey) {
    const modules = Array.isArray(session.modules) ? session.modules : [];
    if (!modules.includes(moduleKey)) {
      return router.createUrlTree(['/exception/403']);
    }
  }

  const requireOwnership = route.data?.['requireOwnership'] === true;
  if (requireOwnership && session.workspaceType === 'container') {
    const owners = Array.isArray(session.ownerAccountIds) ? session.ownerAccountIds.filter(Boolean) : [];
    if (owners.length === 0) {
      return router.createUrlTree(['/exception/403']);
    }
  }

  const aclRules = route.data?.['acl'];
  if (aclRules && !acl.can(aclRules)) {
    return router.createUrlTree(['/exception/403']);
  }

  // TODO(Phase0-Account): optional future actor-based assertions when accountId/accountType is required by route metadata.
  // TODO(EventSourcing): carry actorAccountId breadcrumb (Account → Workspace → Module → Entity → Event) without enforcing actor constraints.
  // TODO(Phase3): hook in event-sourced projection refresh if needed (assert-only; no derivation here)
  return true;
};

// END OF FILE
