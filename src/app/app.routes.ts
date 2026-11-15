import { Routes } from "@angular/router";
import { HomePage } from "./features/home/pages";
import { EmployeeOverviewPage } from "./features/time-off/employee/pages";
import { SupervisorOverviewPage } from "./features/time-off/supervisor/pages";

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'employee/overview', component: EmployeeOverviewPage },
  { path: 'supervisor/overview', component: SupervisorOverviewPage },
  { path: '**', redirectTo: '' },
];
