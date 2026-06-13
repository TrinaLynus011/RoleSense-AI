import { Component, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  template: `
    <nav class="navbar">
      <div class="nav-left">
        <button class="sidebar-toggle" (click)="toggleSidebar.emit()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <a routerLink="/" class="logo">
          <div class="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <span class="logo-text">RoleSense</span>
          <span class="logo-badge">AI</span>
        </a>
      </div>
      <div class="nav-center">
        <a routerLink="/search" class="nav-link" routerLinkActive="active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Search
        </a>
        <a routerLink="/dashboard" class="nav-link" routerLinkActive="active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>
        <a routerLink="/analytics" class="nav-link" routerLinkActive="active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Analytics
        </a>
        <a routerLink="/resume" class="nav-link" routerLinkActive="active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
          Resume Fit
        </a>
      </div>
      <div class="nav-right">
        <button class="theme-btn" (click)="theme.toggle()" title="Toggle theme">
          @if (theme.current() === 'dark') {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          } @else {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
        @if (auth.user$ | async; as user) {
          <div class="user-menu">
            <div class="avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
            <button class="logout-btn" (click)="doLogout()" title="Sign out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        } @else {
          <a routerLink="/signin" class="btn-ghost-sm">Sign In</a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar { display:flex; align-items:center; height:56px; padding:0 20px; border-bottom:1px solid var(--border); background:var(--surface); position:sticky; top:0; z-index:100; gap:16px; }
    .nav-left { display:flex; align-items:center; gap:12px; }
    .sidebar-toggle { background:none; border:none; color:var(--muted); cursor:pointer; padding:6px; border-radius:8px; display:flex; align-items:center; }
    .sidebar-toggle:hover { color:var(--text); background:var(--hover); }
    .logo { display:flex; align-items:center; gap:8px; text-decoration:none; }
    .logo-icon { width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; color:#fff; }
    .logo-text { font-size:16px; font-weight:700; color:var(--text); letter-spacing:-0.3px; }
    .logo-badge { font-size:10px; font-weight:700; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; padding:1px 6px; border-radius:4px; letter-spacing:0.3px; }
    .nav-center { display:flex; align-items:center; gap:4px; flex:1; justify-content:center; }
    .nav-link { display:flex; align-items:center; gap:6px; padding:6px 14px; border-radius:8px; color:var(--muted); text-decoration:none; font-size:13px; font-weight:500; transition:all .15s; }
    .nav-link:hover { color:var(--text); background:var(--hover); }
    .nav-link.active { color:var(--primary); background:var(--primary-bg); }
    .nav-right { display:flex; align-items:center; gap:8px; }
    .theme-btn { background:none; border:1px solid var(--border); color:var(--muted); cursor:pointer; padding:7px; border-radius:8px; display:flex; align-items:center; transition:all .15s; }
    .theme-btn:hover { color:var(--text); border-color:var(--text-muted); }
    .user-menu { display:flex; align-items:center; gap:8px; }
    .avatar { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; }
    .logout-btn { background:none; border:1px solid var(--border); color:var(--muted); cursor:pointer; padding:6px; border-radius:8px; display:flex; align-items:center; transition:all .15s; }
    .logout-btn:hover { color:#ef4444; border-color:#ef4444; }
    .btn-ghost-sm { padding:6px 14px; border-radius:8px; border:1px solid var(--border); color:var(--text); text-decoration:none; font-size:13px; font-weight:500; transition:all .15s; }
    .btn-ghost-sm:hover { background:var(--hover); }
  `]
})
export class NavbarComponent {
  toggleSidebar = output<void>();
  constructor(public auth: AuthService, public theme: ThemeService, private router: Router) {}

  doLogout(): void {
    this.auth.logout();
    this.router.navigate(['/signin']);
  }
}
