import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { Analytics } from '../../core/models/user.model';

interface Metric {
  label: string; value: string; change: string; icon: string; color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NavbarComponent, SidebarComponent, AsyncPipe, DecimalPipe],
  template: `
    <div class="shell" [class.sidebar-open]="sidebarOpen()">
      <app-sidebar [open]="sidebarOpen()" (close)="sidebarOpen.set(false)" />
      <div class="content">
        <app-navbar (toggleSidebar)="sidebarOpen.set(!sidebarOpen())" />
        <div class="main">
          <div class="page-header">
            <div>
              <h1>Dashboard</h1>
              <p class="subtitle">Welcome back, {{ (auth.user$ | async)?.name }}</p>
            </div>
            <a routerLink="/search" class="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              New Search
            </a>
          </div>

          <div class="metrics-grid">
            @for (m of metrics(); track m.label) {
              <div class="metric-card" [style.--accent]="m.color">
                <div class="metric-icon" [style.background]="m.color + '1a'" [style.color]="m.color">
                  <span [innerHTML]="safeIcon(m.icon)"></span>
                </div>
                <div class="metric-info">
                  <span class="metric-value" [style.color]="m.color">{{ m.value }}</span>
                  <span class="metric-label">{{ m.label }}</span>
                </div>
                <span class="metric-change">{{ m.change }}</span>
              </div>
            }
          </div>

          <div class="quick-actions">
            <h2>Quick Actions</h2>
            <div class="actions-grid">
              <a routerLink="/search" class="action-card">
                <div class="action-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </div>
                <h3>Search Candidates</h3>
                <p>Rank candidates against any job description</p>
              </a>
              <a routerLink="/analytics" class="action-card">
                <div class="action-icon" style="background:rgba(34,197,94,0.1);color:#22c55e;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </div>
                <h3>View Analytics</h3>
                <p>Explore talent pool insights and trends</p>
              </a>
            </div>
          </div>

          @if (analytics(); as a) {
            <div class="insights">
              <h2>Pool Insights</h2>
              <div class="insight-grid">
                <div class="insight-card high">
                  <span class="insight-num">{{ a.high_confidence }}</span>
                  <span class="insight-text">High Confidence</span>
                </div>
                <div class="insight-card medium">
                  <span class="insight-num">{{ a.medium_confidence }}</span>
                  <span class="insight-text">Medium Confidence</span>
                </div>
                <div class="insight-card low">
                  <span class="insight-num">{{ a.low_confidence }}</span>
                  <span class="insight-text">Low Confidence</span>
                </div>
                <div class="insight-card avg">
                  <span class="insight-num">{{ a.avg_score * 100 | number:'1.0-0' }}%</span>
                  <span class="insight-text">Avg Match Score</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shell { display:flex; min-height:100vh; }
    .content { flex:1; display:flex; flex-direction:column; min-width:0; }
    .main { flex:1; max-width:960px; width:100%; margin:0 auto; padding:24px 20px; }
    .page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
    .page-header h1 { font-size:22px; font-weight:700; color:var(--text); margin:0; }
    .subtitle { font-size:13px; color:var(--muted); margin:2px 0 0; }
    .btn-primary { display:inline-flex; align-items:center; gap:6px; padding:10px 18px; border-radius:8px; border:none; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; font-size:13px; font-weight:600; text-decoration:none; cursor:pointer; }
    .metrics-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; margin-bottom:28px; }
    .metric-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; display:flex; align-items:center; gap:12px; }
    .metric-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .metric-icon span { display:flex; align-items:center; justify-content:center; }
    .metric-info { flex:1; display:flex; flex-direction:column; }
    .metric-value { font-size:20px; font-weight:700; line-height:1; }
    .metric-label { font-size:11px; color:var(--muted); margin-top:2px; }
    .metric-change { font-size:11px; color:var(--muted); }
    .quick-actions { margin-bottom:28px; }
    h2 { font-size:16px; font-weight:600; color:var(--text); margin:0 0 12px; }
    .actions-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .action-card { padding:20px; border-radius:12px; border:1px solid var(--border); background:var(--card); text-decoration:none; transition:all .2s; }
    .action-card:hover { border-color:var(--primary); transform:translateY(-1px); }
    .action-icon { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:10px; }
    .action-card h3 { font-size:14px; font-weight:600; color:var(--text); margin:0 0 4px; }
    .action-card p { font-size:12px; color:var(--muted); margin:0; }
    .insight-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
    .insight-card { padding:16px; border-radius:12px; border:1px solid var(--border); text-align:center; background:var(--card); }
    .insight-num { display:block; font-size:24px; font-weight:700; margin-bottom:4px; }
    .insight-card.high .insight-num { color:#22c55e; }
    .insight-card.medium .insight-num { color:#eab308; }
    .insight-card.low .insight-num { color:#ef4444; }
    .insight-card.avg .insight-num { color:#6366f1; }
    .insight-text { font-size:11px; color:var(--muted); }
    @media (max-width:640px) { .actions-grid,.insight-grid { grid-template-columns:1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  sidebarOpen = signal(false);
  metrics = signal<Metric[]>([
    { label:'Candidates Indexed', value:'740', change:'+640 this month', color:'#6366f1', icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    { label:'Searches Performed', value:'12', change:'This session', color:'#22c55e', icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' },
    { label:'High Confidence', value:'—', change:'Run a search', color:'#f59e0b', icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
    { label:'Avg Score', value:'—', change:'Run a search', color:'#8b5cf6', icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
  ]);
  analytics = signal<Analytics | null>(null);

  constructor(public auth: AuthService, private api: ApiService, private sanitizer: DomSanitizer) {}

  safeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  ngOnInit(): void {
    this.api.getAnalytics().subscribe({
      next: a => {
        this.analytics.set(a);
        this.metrics.update(m => m.map(mm => {
          if (mm.label === 'High Confidence') return { ...mm, value: String(a.high_confidence), change: `${a.high_confidence} candidates` };
          if (mm.label === 'Avg Score') return { ...mm, value: `${(a.avg_score * 100).toFixed(0)}%`, change: `from ${a.total_candidates} candidates` };
          return mm;
        }));
      },
      error: () => {},
    });
  }
}
