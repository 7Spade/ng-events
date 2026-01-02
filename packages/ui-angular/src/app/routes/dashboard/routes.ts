import { Routes } from '@angular/router';

import { DashboardV1Component } from './v1/v1.component';

export const routes: Routes = [
  { path: '', redirectTo: 'v1', pathMatch: 'full' },
  { path: 'v1', component: DashboardV1Component }
];
