import { Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(r => r.ADMIN_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: '/admin/dashboard',
  },
];
