import { Routes } from '@angular/router';
import { startPageGuard, sessionGuard } from '@core';

import { LayoutBasicComponent } from '../layout';

export const routes: Routes = [
  {
    path: '',
    component: LayoutBasicComponent,
    // Single guard pipeline: DA_SERVICE_TOKEN (@delon/auth) → ACLService
    // Avoid parallel guards to keep boundary consistent with #29/#41.
    canActivate: [startPageGuard, sessionGuard],
    canActivateChild: [sessionGuard],
    data: {
      acl: [],
      ability: [],
      requireWorkspace: false // Login onboarding still lacks workspace selection; re-enable when workspace projection is available.
      // TODO(Phase0-Account): future account-scoped ACL checks may consume accountId/accountType alongside workspace scope.
      // TODO(Phase3-Owner): routes requiring ownership should assert ownerAccountIds (user/org only) once projections are wired.
    },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/routes').then(m => m.routes)
      }
    ]
  },
  // passport
  { path: '', loadChildren: () => import('./passport/routes').then(m => m.routes) },
  { path: 'exception', loadChildren: () => import('./exception/routes').then(m => m.routes) },
  { path: '**', redirectTo: 'exception/404' }
];

// END OF FILE
