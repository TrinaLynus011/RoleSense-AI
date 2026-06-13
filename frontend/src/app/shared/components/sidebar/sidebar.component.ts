import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (open()) {
      <div class="overlay" (click)="close.emit()"></div>
    }
    <aside class="sidebar" [class.open]="open()">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <span class="logo-text">RoleSense</span>
        </div>
        <button class="close-btn" (click)="close.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="close.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>
        <a routerLink="/search" routerLinkActive="active" class="nav-item" (click)="close.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Search
        </a>
        <a routerLink="/analytics" routerLinkActive="active" class="nav-item" (click)="close.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Analytics
        </a>
        <a routerLink="/resume" routerLinkActive="active" class="nav-item" (click)="close.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Resume Fit
          <span class="nav-badge">New</span>
        </a>
      </nav>
    </aside>
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      z-index: 199; backdrop-filter: blur(2px);
    }
    .sidebar {
      position: fixed; top: 0; left: 0; height: 100vh; width: 240px;
      background: var(--surface); border-right: 1px solid var(--border);
      z-index: 200; display: flex; flex-direction: column;
      transform: translateX(-100%); transition: transform 0.25s ease;
    }
    .sidebar.open { transform: translateX(0); }
    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px; border-bottom: 1px solid var(--border); height: 56px;
    }
    .logo { display: flex; align-items: center; gap: 8px; }
    .logo-icon {
      width: 30px; height: 30px; border-radius: 8px;
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      display: flex; align-items: center; justify-content: center; color: #fff;
    }
    .logo-text { font-size: 15px; font-weight: 700; color: var(--text); }
    .close-btn {
      background: none; border: none; color: var(--muted); cursor: pointer;
      padding: 4px; border-radius: 6px; display: flex; align-items: center;
    }
    .close-btn:hover { color: var(--text); background: var(--hover); }
    .sidebar-nav { display: flex; flex-direction: column; gap: 2px; padding: 12px 8px; }
    .nav-item {
      display: flex; align-items: center; gap: 10px; padding: 10px 12px;
      border-radius: 8px; color: var(--muted); text-decoration: none;
      font-size: 14px; font-weight: 500; transition: all 0.15s;
    }
    .nav-item:hover { color: var(--text); background: var(--hover); }
    .nav-item.active { color: var(--primary); background: var(--primary-bg); }
    .nav-badge { margin-left:auto; font-size:9px; font-weight:800; padding:2px 6px; border-radius:20px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; letter-spacing:0.3px; }
  `]
})
export class SidebarComponent {
  open = input<boolean>(false);
  close = output<void>();
}
