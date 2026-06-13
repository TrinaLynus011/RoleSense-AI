import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'signin', loadComponent: () => import('./pages/signin/signin.component').then(m => m.SigninComponent) },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard] },
  { path: 'search', loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent), canActivate: [AuthGuard] },
  { path: 'results', loadComponent: () => import('./pages/results/results.component').then(m => m.ResultsComponent), canActivate: [AuthGuard] },
  { path: 'analytics', loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent), canActivate: [AuthGuard] },
  { path: 'resume', loadComponent: () => import('./pages/resume/resume.component').then(m => m.ResumeComponent), canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];
