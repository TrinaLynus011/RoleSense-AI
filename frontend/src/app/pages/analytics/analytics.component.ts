import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AnalyticsChartsComponent } from '../../shared/components/analytics-charts/analytics-charts.component';
import { ApiService } from '../../core/services/api.service';
import { Analytics } from '../../core/models/user.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, AnalyticsChartsComponent, DecimalPipe],
  template: `
    <div class="shell">
      <app-sidebar [open]="sidebarOpen()" (close)="sidebarOpen.set(false)" />
      <div class="content">
        <app-navbar (toggleSidebar)="sidebarOpen.set(!sidebarOpen())" />
        <div class="main">
          <div class="page-header">
            <h1>Analytics</h1>
            <p class="subtitle">Recruiter insights from your candidate pool</p>
          </div>

          @if (loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading analytics…</p>
            </div>
          } @else if (data(); as d) {
            <div class="summary-cards">
              <div class="s-card">
                <span class="s-val">{{ d.total_candidates }}</span>
                <span class="s-label">Total Candidates</span>
              </div>
              <div class="s-card">
                <span class="s-val">{{ d.avg_score * 100 | number:'1.0-1' }}%</span>
                <span class="s-label">Avg Match Score</span>
              </div>
              <div class="s-card">
                <span class="s-val">{{ d.avg_experience }} yrs</span>
                <span class="s-label">Avg Experience</span>
              </div>
            </div>
            <app-analytics-charts [data]="d" />
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shell { display:flex; min-height:100vh; }
    .content { flex:1; display:flex; flex-direction:column; min-width:0; }
    .main { flex:1; max-width:960px; width:100%; margin:0 auto; padding:24px 20px; }
    .page-header { margin-bottom:20px; }
    .page-header h1 { font-size:22px; font-weight:700; color:var(--text); margin:0; }
    .subtitle { font-size:13px; color:var(--muted); margin:2px 0 0; }
    .loading-state { display:flex; flex-direction:column; align-items:center; padding:60px 20px; }
    .spinner { width:32px; height:32px; border:3px solid var(--border); border-top-color:var(--primary); border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .loading-state p { margin-top:12px; color:var(--muted); font-size:13px; }
    .summary-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px; }
    .s-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; text-align:center; }
    .s-val { display:block; font-size:22px; font-weight:700; color:var(--text); }
    .s-label { font-size:11px; color:var(--muted); margin-top:2px; }
    @media (max-width:640px) { .summary-cards { grid-template-columns:1fr; } }
  `]
})
export class AnalyticsComponent implements OnInit {
  sidebarOpen = signal(false);
  data = signal<Analytics | null>(null);
  loading = signal(true);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAnalytics().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }
}
