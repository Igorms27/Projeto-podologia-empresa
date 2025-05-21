import { Routes } from '@angular/router';

import { adminGuard, adminOnlyGuard } from '../guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'cashier',
    loadComponent: () =>
      import('./components/cashier/cashier.component').then(m => m.CashierComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'agenda',
    loadComponent: () =>
      import('./components/agenda-admin/agenda-admin.component').then(m => m.AgendaAdminComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/user-management/user-management.component').then(
        m => m.UserManagementComponent
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'monthly-summary/:year/:month',
    loadComponent: () =>
      import('./components/monthly-summary/monthly-summary.component').then(
        m => m.MonthlySummaryComponent
      ),
    canActivate: [adminOnlyGuard],
  },
  // Adicione uma rota curinga para redirecionar para o dashboard
  {
    path: '**',
    redirectTo: '',
  },
];
