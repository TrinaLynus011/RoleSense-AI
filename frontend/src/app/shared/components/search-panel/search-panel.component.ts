import { Component, output, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface SearchParams {
  job_description: string;
  source: string;
  top_n: number;
  location: string;
  remote_friendly: boolean;
  min_experience: number | null;
  skills_filter: string[];
}

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="panel">
      <div class="field">
        <label class="label">Job Description</label>
        <textarea class="textarea" [(ngModel)]="jdText" placeholder="Paste job description here..." rows="5"></textarea>
      </div>

      <div class="grid-3">
        <div class="field">
          <label class="label">Location</label>
          <div class="select-wrap">
            <select [(ngModel)]="location">
              <option value="">All Locations</option>
              @for (loc of locations(); track loc) {
                <option [value]="loc">{{ loc }}</option>
              }
            </select>
          </div>
        </div>
        <div class="field">
          <label class="label">Min Experience (yrs)</label>
          <input class="input" type="number" [(ngModel)]="minExp" min="0" max="50" placeholder="Any" />
        </div>
        <div class="field">
          <label class="label">Top N Results</label>
          <div class="select-wrap">
            <select [(ngModel)]="topN">
              <option [value]="10">10</option>
              <option [value]="20">20</option>
              <option [value]="50">50</option>
              <option [value]="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <label class="label">Skills Filter (comma-separated)</label>
          <input class="input" type="text" [(ngModel)]="skillsInput" placeholder="Python, Delivery, Operations" />
        </div>
        <div class="field" style="justify-content:flex-end;">
          <label class="toggle-label">
            <div class="toggle-switch" [class.active]="remoteFriendly" (click)="remoteFriendly = !remoteFriendly">
              <div class="toggle-knob"></div>
            </div>
            Remote Friendly
          </label>
        </div>
      </div>

      <div class="actions">
        <button class="btn-primary" (click)="search()" [disabled]="!jdText.trim()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Rank Candidates
        </button>
      </div>
    </div>
  `,
  styles: [`
    .panel { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:20px; }
    .field { display:flex; flex-direction:column; gap:4px; }
    .label { font-size:12px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; }
    .textarea, .input { padding:8px 12px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text); font-size:13px; font-family:inherit; outline:none; transition:border-color .15s; }
    .textarea:focus, .input:focus { border-color:var(--primary); }
    .textarea::placeholder, .input::placeholder { color:var(--text-muted); }
    .select-wrap { position:relative; }
    .select-wrap select { width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text); font-size:13px; font-family:inherit; outline:none; cursor:pointer; appearance:none; }
    .select-wrap::after { content:"▾"; position:absolute; right:10px; top:50%; transform:translateY(-50%); color:var(--muted); font-size:10px; pointer-events:none; }
    .grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-top:12px; }
    .grid-2 { display:grid; grid-template-columns:1fr auto; gap:12px; margin-top:12px; align-items:end; }
    .toggle-label { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text); cursor:pointer; }
    .toggle-switch { width:36px; height:20px; border-radius:10px; background:var(--border); padding:2px; cursor:pointer; transition:background .2s; }
    .toggle-switch.active { background:var(--primary); }
    .toggle-knob { width:16px; height:16px; border-radius:50%; background:var(--text); transition:transform .2s; }
    .toggle-switch.active .toggle-knob { transform:translateX(16px); }
    .actions { margin-top:16px; display:flex; justify-content:flex-end; }
    .btn-primary { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:10px; border:none; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; font-size:14px; font-weight:600; cursor:pointer; transition:opacity .15s; }
    .btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
    .btn-primary:hover:not(:disabled) { opacity:0.9; }
  `]
})
export class SearchPanelComponent implements OnInit, OnDestroy {
  searchParams = output<SearchParams>();
  locations = signal<string[]>([]);

  jdText = '';
  location = '';
  minExp: number | null = null;
  topN = 20;
  skillsInput = '';
  remoteFriendly = false;

  private destroy$ = new Subject<void>();

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getLocations().pipe(takeUntil(this.destroy$)).subscribe({
      next: r => this.locations.set(r.locations)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  search(): void {
    const skills = this.skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    this.searchParams.emit({
      job_description: this.jdText,
      source: 'workindia',
      top_n: this.topN,
      location: this.location,
      remote_friendly: this.remoteFriendly,
      min_experience: this.minExp,
      skills_filter: skills.length ? skills : [],
    });
  }
}
