import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SESSION_CONTEXT } from '../session-context.token';

/**
 * CommandGuard
 *
 * Lightweight gating aligned with route metadata.
 * Guards commands without deriving ownership or ACL.
 */
export const commandGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const session = inject(SESSION_CONTEXT);

  if (!session.isAuthenticated || session.isExpired()) {
    return router.createUrlTree(['/passport/login'], { queryParams: { returnUrl: state.url } });
  }

  if (route.data?.['requireWorkspace'] && !session.workspaceId) {
    return router.createUrlTree(['/exception/403']);
  }

  const moduleKey = route.data?.['moduleKey'];
  if (moduleKey && (!Array.isArray(session.modules) || !session.modules.includes(moduleKey))) {
    return router.createUrlTree(['/exception/403']);
  }

  const requireOwnership = route.data?.['requireOwnership'] === true;
  if (requireOwnership && session.workspaceType === 'container') {
    const owners = Array.isArray(session.ownerAccountIds) ? session.ownerAccountIds.filter(Boolean) : [];
    if (owners.length === 0) {
      return router.createUrlTree(['/exception/403']);
    }
  }

  return true;
};

// END OF FILE
