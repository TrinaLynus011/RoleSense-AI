import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { CandidateCardComponent } from '../../shared/components/candidate-card/candidate-card.component';
import { ApiService } from '../../core/services/api.service';
import { Candidate } from '../../core/models/user.model';
import * as XLSX from 'xlsx';

// Fail-safe resolver for SheetJS (xlsx) CJS/ESM interop in modern bundlers
const getXLSX = () => {
  const X = XLSX as any;
  const main = X.utils ? X : (X.default || X);
  return {
    utils: main.utils,
    write: main.write,
    writeFile: main.writeFile
  };
};

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, CandidateCardComponent],
  template: `
    <div class="shell">
      <app-sidebar [open]="sidebarOpen()" (close)="sidebarOpen.set(false)" />
      <div class="content">
        <app-navbar (toggleSidebar)="sidebarOpen.set(!sidebarOpen())" />

        @if (loading()) {
          <div class="loading-full">
            <div class="loading-inner">
              <div class="spinner-lg"></div>
              <h3>Analysing candidates with AI</h3>
              <p>Semantic ranking in progress…</p>
            </div>
          </div>
        } @else if (error()) {
          <div class="error-full">
            <div class="error-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3>Something went wrong</h3>
            <p>{{ error() }}</p>
            <button class="btn-primary" (click)="router.navigate(['/search'])">Back to Search</button>
          </div>
        } @else {
          <!-- Hero stats bar -->
          <div class="stats-bar">
            <div class="stats-inner">
              <button class="btn-back-inline" (click)="router.navigate(['/search'])">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Search
              </button>
              <div class="stats-divider"></div>
              <div class="stat-item">
                <span class="stat-val">{{ candidates().length }}</span>
                <span class="stat-lbl">Ranked</span>
              </div>
              <div class="stat-item hi">
                <span class="stat-val">{{ highCount() }}</span>
                <span class="stat-lbl">High Fit</span>
              </div>
              <div class="stat-item">
                <span class="stat-val">{{ avgScore() }}%</span>
                <span class="stat-lbl">Avg Score</span>
              </div>
              <div class="stat-item">
                <span class="stat-val">{{ topScore() }}%</span>
                <span class="stat-lbl">Top Score</span>
              </div>
              <div class="stats-actions">
                <div class="filter-pills">
                  @for (f of filters; track f.value) {
                    <button class="pill" [class.active]="activeFilter() === f.value" (click)="activeFilter.set(f.value)">
                      {{ f.label }}
                    </button>
                  }
                </div>
                <div class="export-menu" (mouseleave)="exportOpen.set(false)">
                  <button class="btn-export" (click)="exportOpen.set(!exportOpen())">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  @if (exportOpen()) {
                    <div class="export-dropdown">
                      <button class="export-item" (click)="exportCSV(); exportOpen.set(false)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Download CSV
                      </button>
                      <button class="export-item" (click)="exportXLSX(); exportOpen.set(false)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                        Download XLSX
                      </button>
                      <button class="export-item" (click)="exportJSON(); exportOpen.set(false)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                        Download JSON
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="page-body">
            <div class="results-header">
              <div>
                <h1>Results</h1>
                <p class="sub">{{ filteredCandidates().length }} candidates · filtered by <strong>{{ activeFilter() }}</strong></p>
              </div>
            </div>

            @if (filteredCandidates().length === 0) {
              <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <p>No candidates match this filter.</p>
                <button class="btn-ghost-sm" (click)="activeFilter.set('all')">Clear filter</button>
              </div>
            } @else {
              <div class="candidates-grid stagger-children">
                @for (c of filteredCandidates(); track c.rank) {
                  <app-candidate-card [candidate]="c" />
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .shell { display:flex; min-height:100vh; }
    .content { flex:1; display:flex; flex-direction:column; min-width:0; background:var(--bg); }

    /* Loading */
    .loading-full { flex:1; display:flex; align-items:center; justify-content:center; min-height:calc(100vh - 56px); }
    .loading-inner { display:flex; flex-direction:column; align-items:center; gap:16px; text-align:center; }
    .spinner-lg { width:48px; height:48px; border:4px solid var(--border); border-top-color:var(--primary); border-radius:50%; animation:spin .9s linear infinite; }
    .loading-inner h3 { font-size:16px; font-weight:600; color:var(--text); }
    .loading-inner p { font-size:13px; color:var(--muted); }
    @keyframes spin { to { transform:rotate(360deg); } }

    /* Error */
    .error-full { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; text-align:center; padding:40px; }
    .error-icon { color:#ef4444; }
    .error-full h3 { font-size:18px; font-weight:700; color:var(--text); }
    .error-full p { font-size:13px; color:var(--muted); max-width:360px; }

    /* Stats bar */
    .stats-bar { background:var(--surface); border-bottom:1px solid var(--border); padding:0 24px; position:sticky; top:56px; z-index:50; }
    .stats-inner { display:flex; align-items:center; gap:0; height:52px; max-width:100%; }
    .btn-back-inline { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:8px; background:none; border:1px solid var(--border); color:var(--muted); font-size:12px; font-weight:500; cursor:pointer; white-space:nowrap; }
    .btn-back-inline:hover { color:var(--text); border-color:var(--text-muted); }
    .stats-divider { width:1px; height:28px; background:var(--border); margin:0 20px; flex-shrink:0; }
    .stat-item { display:flex; flex-direction:column; align-items:center; padding:0 18px; border-right:1px solid var(--border); }
    .stat-item:last-of-type { border-right:none; }
    .stat-val { font-size:18px; font-weight:800; color:var(--text); line-height:1; }
    .stat-lbl { font-size:10px; color:var(--muted); margin-top:1px; text-transform:uppercase; letter-spacing:0.4px; }
    .stat-item.hi .stat-val { color:#22c55e; }
    .stats-actions { margin-left:auto; display:flex; align-items:center; gap:10px; }
    .filter-pills { display:flex; gap:4px; }
    .pill { padding:5px 12px; border-radius:20px; border:1px solid var(--border); background:none; color:var(--muted); font-size:11px; font-weight:500; cursor:pointer; transition:all .15s; }
    .pill:hover { border-color:var(--primary); color:var(--primary); }
    .pill.active { background:var(--primary); border-color:var(--primary); color:#fff; }
    .btn-export { display:inline-flex; align-items:center; gap:5px; padding:6px 12px; border-radius:8px; border:1px solid var(--border); background:none; color:var(--muted); font-size:12px; cursor:pointer; }
    .btn-export:hover { background:var(--hover); color:var(--text); }
    .export-menu { position:relative; }
    .export-dropdown { position:absolute; top:calc(100% + 6px); right:0; background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:4px; min-width:160px; z-index:200; box-shadow:0 8px 24px rgba(0,0,0,.3); animation:scaleIn .15s ease; }
    @keyframes scaleIn { from { opacity:0; transform:scale(.95) translateY(-4px); } to { opacity:1; transform:scale(1) translateY(0); } }
    .export-item { display:flex; align-items:center; gap:8px; width:100%; padding:8px 12px; border:none; background:none; color:var(--text); font-size:12px; font-weight:500; cursor:pointer; border-radius:7px; text-align:left; }
    .export-item:hover { background:var(--hover); color:var(--primary); }

    /* Body */
    .page-body { padding:28px 28px 40px; }
    .results-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
    .results-header h1 { font-size:24px; font-weight:800; color:var(--text); margin:0; }
    .sub { font-size:13px; color:var(--muted); margin-top:2px; }
    .sub strong { color:var(--text); font-weight:600; }

    /* Grid */
    .candidates-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(460px,1fr)); gap:14px; }

    /* Empty */
    .empty-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:60px 20px; color:var(--muted); }
    .btn-ghost-sm { padding:6px 14px; border-radius:8px; border:1px solid var(--border); background:none; color:var(--muted); font-size:12px; cursor:pointer; }
    .btn-ghost-sm:hover { color:var(--text); }

    /* Buttons */
    .btn-primary { padding:10px 22px; border-radius:10px; border:none; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; font-size:13px; font-weight:600; cursor:pointer; }

    @media (max-width:900px) {
      .candidates-grid { grid-template-columns:1fr; }
      .page-body { padding:20px 16px 32px; }
      .filter-pills { display:none; }
    }
    @media (max-width:640px) {
      .stats-bar { overflow-x:auto; }
      .stats-inner { min-width:560px; }
    }
  `]
})
export class ResultsComponent implements OnInit {
  sidebarOpen = signal(false);
  candidates = signal<Candidate[]>([]);
  loading = signal(true);
  error = signal('');
  activeFilter = signal<string>('all');
  exportOpen = signal(false);

  filters = [
    { label: 'All', value: 'all' },
    { label: '🟢 High', value: 'High' },
    { label: '🟡 Medium', value: 'Medium' },
    { label: '🔴 Low', value: 'Low' },
  ];

  filteredCandidates = computed(() => {
    const f = this.activeFilter();
    if (f === 'all') return this.candidates();
    return this.candidates().filter(c => c.confidence.label === f);
  });

  highCount = computed(() => this.candidates().filter(c => c.confidence.label === 'High').length);
  avgScore = computed(() => {
    const c = this.candidates();
    if (!c.length) return 0;
    return Math.round(c.reduce((s, x) => s + x.match_percent, 0) / c.length);
  });
  topScore = computed(() => this.candidates()[0]?.match_percent ?? 0);

  constructor(public router: Router, private location: Location, private api: ApiService) {}

  ngOnInit(): void {
    const state = this.location.getState() as any;
    let params = state?.params;
    if (!params?.job_description) {
      const stored = sessionStorage.getItem('lastSearchParams');
      if (stored) { try { params = JSON.parse(stored); } catch { /* */ } }
    }
    if (!params?.job_description) { this.router.navigate(['/search']); return; }
    sessionStorage.removeItem('lastSearchParams');

    this.api.rankCandidates(params).subscribe({
      next: r => { this.candidates.set(r.candidates); this.loading.set(false); },
      error: e => { this.error.set(e.error?.detail || 'Ranking failed. Please try again.'); this.loading.set(false); },
    });
  }

  exportJSON(): void {
    try {
      const blob = new Blob([JSON.stringify(this.candidates(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rolesense_rankings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('JSON Export failed:', e);
      alert('JSON Export failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  private _toRows(): Record<string, any>[] {
    return this.candidates().map(c => ({
      Rank: c.rank,
      Name: c.name,
      'Match %': c.match_percent,
      Confidence: c.confidence.label,
      Location: c.location ?? '',
      Experience: c.experience ?? '',
      Skills: (c.skills ?? []).join(', '),
      'Semantic Similarity': +(c.score_breakdown?.['semantic_similarity'] ?? 0).toFixed(3),
      'Skills Match': +(c.score_breakdown?.['skills_match'] ?? 0).toFixed(3),
      'Experience Match': +(c.score_breakdown?.['experience_match'] ?? 0).toFixed(3),
      'Qualification Match': +(c.score_breakdown?.['qualification_match'] ?? 0).toFixed(3),
      'English Proficiency': +(c.score_breakdown?.['english_proficiency'] ?? 0).toFixed(3),
      'Behavioral Signals': +(c.score_breakdown?.['behavioral_signals'] ?? 0).toFixed(3),
      'Location Match': +(c.score_breakdown?.['location_match'] ?? 0).toFixed(3),
      'Sector Match': +(c.score_breakdown?.['sector_match'] ?? 0).toFixed(3),
      Recommendation: c.explanation?.recommendation ?? '',
    }));
  }

  exportCSV(): void {
    try {
      const { utils } = getXLSX();
      const rows = this._toRows();
      const ws = utils.json_to_sheet(rows);
      const csv = utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rolesense_rankings.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('CSV Export failed:', e);
      alert('CSV Export failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  exportXLSX(): void {
    try {
      const { utils, write } = getXLSX();
      const rows = this._toRows();
      const ws = utils.json_to_sheet(rows);

      // Column widths
      ws['!cols'] = [
        { wch: 6 }, { wch: 24 }, { wch: 10 }, { wch: 12 }, { wch: 20 },
        { wch: 14 }, { wch: 40 }, { wch: 18 }, { wch: 14 }, { wch: 18 },
        { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 14 },
        { wch: 40 },
      ];

      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Rankings');
      
      const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rolesense_rankings.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('XLSX Export failed:', e);
      alert('XLSX Export failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  }
}
