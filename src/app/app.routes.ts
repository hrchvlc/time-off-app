import { Routes } from '@angular/router';
import { Role, roleGuard } from '@timeoff/shared';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages').then((m) => m.HomePage),
  },
  {
    path: 'employee/overview',
    canActivate: [roleGuard(Role.Employee)],
    loadComponent: () => import('./features/time-off/employee/pages').then((m) => m.EmployeeOverviewPage),
  },
  {
    path: 'supervisor/overview',
    canActivate: [roleGuard(Role.Supervisor)],
    loadComponent: () => import('./features/time-off/supervisor/pages').then((m) => m.SupervisorOverviewPage),
  },
  { path: '**', redirectTo: '' },
];
