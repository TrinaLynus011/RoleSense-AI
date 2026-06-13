import { Component, input, signal } from '@angular/core';
import { Candidate } from '../../../core/models/user.model';
import { MatchScoreBadgeComponent } from '../match-score-badge/match-score-badge.component';

@Component({
  selector: 'app-candidate-card',
  standalone: true,
  imports: [MatchScoreBadgeComponent],
  template: `
    <div class="card" [class.expanded]="expanded()">
      <div class="card-header" (click)="expanded.set(!expanded())">
        <!-- Rank -->
        <div class="rank-badge" [style.background]="rankColor()">
          <span>#{{ candidate().rank }}</span>
        </div>

        <!-- Info -->
        <div class="card-info">
          <h3 class="name">{{ candidate().name }}</h3>
          <div class="meta">
            @if (candidate().location) {
              <span class="meta-tag">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ candidate().location }}
              </span>
            }
            @if (candidate().experience) {
              <span class="meta-tag">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                {{ candidate().experience }}
              </span>
            }
            @if (candidate().skills?.length) {
              <span class="meta-tag skills-preview">
                {{ candidate().skills.slice(0,2).join(', ') }}{{ candidate().skills.length > 2 ? ' +' + (candidate().skills.length - 2) : '' }}
              </span>
            }
          </div>
        </div>

        <!-- Score -->
        <div class="score-col">
          <app-match-score-badge
            [percent]="candidate().match_percent"
            [label]="candidate().confidence.label"
            [color]="candidate().confidence.color" />
        </div>

        <!-- Chevron -->
        <div class="chevron" [class.up]="expanded()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      @if (expanded()) {
        <div class="card-body">
          <!-- Skills -->
          @if (candidate().skills?.length) {
            <div class="section">
              <div class="section-label">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                Skills
              </div>
              <div class="skills-row">
                @for (s of candidate().skills; track s) {
                  <span class="skill-chip">{{ s }}</span>
                }
              </div>
            </div>
          }

          <!-- Two-col: strengths + risks -->
          @if (candidate().explanation?.strengths?.length || candidate().explanation?.weaknesses?.length) {
            <div class="two-col">
              @if (candidate().explanation?.strengths?.length) {
                <div class="section">
                  <div class="section-label green">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Strengths
                  </div>
                  <div class="bullets type-strength">
                    @for (s of candidate().explanation!.strengths; track s) {
                      <div class="bullet">{{ s }}</div>
                    }
                  </div>
                </div>
              }
              @if (candidate().explanation?.weaknesses?.length) {
                <div class="section">
                  <div class="section-label red">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Gaps
                  </div>
                  <div class="bullets type-risk">
                    @for (w of candidate().explanation!.weaknesses; track w) {
                      <div class="bullet">{{ w }}</div>
                    }
                  </div>
                </div>
              }
            </div>
          }

          <!-- Score breakdown -->
          @if (breakdownItems().length) {
            <div class="section">
              <div class="section-label">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Score Breakdown
              </div>
              <div class="breakdown">
                @for (item of breakdownItems(); track item.label) {
                  <div class="bar-row">
                    <span class="bar-label">{{ item.label }}</span>
                    <div class="bar-track">
                      <div class="bar-fill" [style.width.%]="item.value * 100" [style.background]="item.color"></div>
                    </div>
                    <span class="bar-val" [style.color]="item.color">{{ (item.value * 100).toFixed(0) }}%</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Recommendation -->
          @if (candidate().explanation?.recommendation) {
            <div class="recommendation">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ candidate().explanation!.recommendation }}
            </div>
          }
        </div>
      }

      <div class="card-footer" (click)="expanded.set(!expanded())">
        <span class="expand-hint">
          <svg [class.rotate]="expanded()" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          {{ expanded() ? 'Collapse' : 'Show details' }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      transition: border-color .2s, box-shadow .2s;
    }
    .card:hover { border-color: rgba(99,102,241,.4); box-shadow: 0 4px 20px rgba(0,0,0,.2); }
    .card.expanded { border-color: var(--primary); }

    /* Header */
    .card-header { display:flex; align-items:center; gap:14px; padding:16px 18px; cursor:pointer; }
    .rank-badge { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:800; flex-shrink:0; }
    .card-info { flex:1; min-width:0; }
    .name { font-size:14px; font-weight:700; color:var(--text); margin:0 0 5px; }
    .meta { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .meta-tag { display:inline-flex; align-items:center; gap:3px; font-size:11px; color:var(--muted); }
    .skills-preview { color:var(--text-muted); font-style:italic; }
    .score-col { flex-shrink:0; }
    .chevron { color:var(--muted); transition:transform .2s; }
    .chevron.up { transform:rotate(180deg); }

    /* Body */
    .card-body { padding:0 18px 16px; border-top:1px solid var(--border); margin-top:0; animation:fadeInUp .2s ease; }
    @keyframes fadeInUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

    .section { margin-top:14px; }
    .section-label { display:flex; align-items:center; gap:5px; font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:7px; }
    .section-label.green { color:#22c55e; }
    .section-label.red { color:#ef4444; }

    .skills-row { display:flex; flex-wrap:wrap; gap:5px; }
    .skill-chip { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500; background:var(--primary-bg); color:var(--primary); border:1px solid rgba(99,102,241,.2); }

    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .bullets { display:flex; flex-direction:column; gap:4px; }
    .bullet { font-size:11px; padding:5px 10px; border-radius:8px; line-height:1.4; }
    .type-strength .bullet { background:rgba(34,197,94,.08); color:#22c55e; }
    .type-risk .bullet { background:rgba(239,68,68,.08); color:#ef4444; }

    .breakdown { display:flex; flex-direction:column; gap:6px; }
    .bar-row { display:flex; align-items:center; gap:10px; }
    .bar-label { font-size:10px; color:var(--muted); width:100px; flex-shrink:0; }
    .bar-track { flex:1; height:5px; background:var(--border); border-radius:3px; overflow:hidden; }
    .bar-fill { height:100%; border-radius:3px; transition:width .7s cubic-bezier(.4,0,.2,1); }
    .bar-val { font-size:10px; font-weight:700; width:30px; text-align:right; }

    .recommendation { margin-top:12px; display:flex; align-items:flex-start; gap:8px; font-size:11px; color:var(--muted); background:var(--hover); padding:10px 12px; border-radius:8px; border:1px solid var(--border); line-height:1.5; }
    .recommendation svg { flex-shrink:0; margin-top:1px; }

    /* Footer */
    .card-footer { text-align:center; padding:8px; border-top:1px solid var(--border); cursor:pointer; }
    .card-footer:hover { background:var(--hover); }
    .expand-hint { display:inline-flex; align-items:center; gap:5px; font-size:10px; color:var(--muted); }
    .expand-hint svg { transition:transform .2s; }
    .expand-hint svg.rotate { transform:rotate(180deg); }

    @media (max-width:640px) { .two-col { grid-template-columns:1fr; } }
  `]
})
export class CandidateCardComponent {
  candidate = input.required<Candidate>();
  expanded = signal(false);

  rankColor() {
    const r = this.candidate().rank;
    if (r === 1) return 'linear-gradient(135deg,#f59e0b,#eab308)';
    if (r === 2) return 'linear-gradient(135deg,#94a3b8,#64748b)';
    if (r === 3) return 'linear-gradient(135deg,#d97706,#b45309)';
    return 'linear-gradient(135deg,#6366f1,#8b5cf6)';
  }

  breakdownItems() {
    const bd = this.candidate().score_breakdown;
    if (!bd) return [];
    const colors = ['#6366f1','#22c55e','#f59e0b','#3b82f6','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
    return Object.entries(bd).map(([k, v], i) => ({
      label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value: v as number,
      color: colors[i % colors.length],
    }));
  }
}
