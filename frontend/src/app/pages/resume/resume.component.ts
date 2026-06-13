import { Component, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import * as pdfjsLib from 'pdfjs-dist';

// Point the worker to the bundled worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

interface AnalysisResult {
  fitScore: number;
  grade: string;
  gradeColor: string;
  matchedSkills: string[];
  missingSkills: string[];
  experienceNote: string;
  educationNote: string;
  tips: string[];
  summary: string;
  categoryScores: { label: string; score: number; color: string }[];
}

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [FormsModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="shell">
      <app-sidebar [open]="sidebarOpen()" (close)="sidebarOpen.set(false)" />
      <div class="content">
        <app-navbar (toggleSidebar)="sidebarOpen.set(!sidebarOpen())" />

        <div class="page-wrap">

          <!-- Page header -->
          <div class="page-hero">
            <div class="hero-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <h1>Resume Fit Analyser</h1>
              <p class="hero-sub">Upload or paste your resume + a job description to get an instant fit score, skill gaps, and tailoring tips.</p>
            </div>
          </div>

          <!-- Input grid -->
          <div class="input-grid">

            <!-- ── Resume panel ── -->
            <div class="input-card" [class.has-content]="resumeText().length > 50">
              <div class="input-card-header">
                <div class="input-label-row">
                  <div class="input-dot resume"></div>
                  <span class="input-title">Your Resume</span>
                </div>
                <div class="header-actions">
                  @if (resumeText()) {
                    <span class="char-pill">{{ resumeText().length }} chars</span>
                    <button class="clear-btn" (click)="clearResume()">Clear</button>
                  }
                </div>
              </div>

              <!-- Upload zone -->
              <div
                class="upload-zone"
                [class.dragging]="draggingResume()"
                (dragover)="$event.preventDefault(); draggingResume.set(true)"
                (dragleave)="draggingResume.set(false)"
                (drop)="onDrop($event, 'resume')"
                (click)="resumeFileInput.click()"
              >
                @if (pdfLoading()) {
                  <div class="upload-loading">
                    <div class="mini-spinner"></div>
                    <span>Reading PDF…</span>
                  </div>
                } @else if (resumeFileName()) {
                  <div class="upload-success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span class="file-name">{{ resumeFileName() }}</span>
                    <span class="file-sub">PDF parsed successfully · {{ resumeText().length }} characters extracted</span>
                  </div>
                } @else {
                  <div class="upload-idle">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span class="upload-title">Drop PDF here or click to upload</span>
                    <span class="upload-sub">Supports .pdf files</span>
                  </div>
                }
                <input #resumeFileInput type="file" accept=".pdf" style="display:none" (change)="onFileChange($event, 'resume')" />
              </div>

              <!-- Divider -->
              <div class="or-divider"><span>or paste text</span></div>

              <!-- Text area -->
              <textarea
                class="text-area"
                [ngModel]="resumeText()"
                (ngModelChange)="resumeText.set($event); resumeFileName.set('')"
                placeholder="Paste resume text here…&#10;&#10;Include: work experience, education, skills, certifications."
                rows="10"
                aria-label="Resume text"
              ></textarea>
            </div>

            <!-- ── Job Description panel ── -->
            <div class="input-card" [class.has-content]="jdText().length > 50">
              <div class="input-card-header">
                <div class="input-label-row">
                  <div class="input-dot jd"></div>
                  <span class="input-title">Job Description</span>
                </div>
                <div class="header-actions">
                  @if (jdText()) {
                    <span class="char-pill">{{ jdText().length }} chars</span>
                    <button class="clear-btn" (click)="jdText.set('')">Clear</button>
                  }
                </div>
              </div>

              <!-- Upload zone for JD PDF too -->
              <div
                class="upload-zone"
                [class.dragging]="draggingJd()"
                (dragover)="$event.preventDefault(); draggingJd.set(true)"
                (dragleave)="draggingJd.set(false)"
                (drop)="onDrop($event, 'jd')"
                (click)="jdFileInput.click()"
              >
                @if (jdPdfLoading()) {
                  <div class="upload-loading">
                    <div class="mini-spinner"></div>
                    <span>Reading PDF…</span>
                  </div>
                } @else if (jdFileName()) {
                  <div class="upload-success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span class="file-name">{{ jdFileName() }}</span>
                    <span class="file-sub">PDF parsed successfully · {{ jdText().length }} characters extracted</span>
                  </div>
                } @else {
                  <div class="upload-idle">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span class="upload-title">Drop PDF here or click to upload</span>
                    <span class="upload-sub">Supports .pdf files</span>
                  </div>
                }
                <input #jdFileInput type="file" accept=".pdf" style="display:none" (change)="onFileChange($event, 'jd')" />
              </div>

              <!-- Divider -->
              <div class="or-divider"><span>or paste text</span></div>

              <!-- Text area -->
              <textarea
                class="text-area"
                [ngModel]="jdText()"
                (ngModelChange)="jdText.set($event); jdFileName.set('')"
                placeholder="Paste job description here…&#10;&#10;Include: role title, responsibilities, required skills, qualifications."
                rows="10"
                aria-label="Job description text"
              ></textarea>
            </div>
          </div>

          <!-- Error message -->
          @if (pdfError()) {
            <div class="error-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ pdfError() }}
            </div>
          }

          <!-- Analyse button -->
          <div class="analyse-row">
            <button
              class="btn-analyse"
              (click)="analyse()"
              [disabled]="!canAnalyse() || analysing() || pdfLoading() || jdPdfLoading()"
              [class.loading]="analysing()"
            >
              @if (analysing()) {
                <span class="btn-spinner"></span>
                Analysing…
              } @else {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Analyse Fit
              }
            </button>
            @if (!canAnalyse() && !analysing() && !pdfLoading()) {
              <span class="hint">Add both your resume and the job description to continue.</span>
            }
          </div>

          <!-- ── Results ── -->
          @if (result()) {
            <div class="results-section">

              <!-- Score hero -->
              <div class="score-hero">
                <div class="score-ring-wrap">
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="68" fill="none" stroke="var(--border)" stroke-width="10"/>
                    <circle cx="80" cy="80" r="68" fill="none"
                      [attr.stroke]="result()!.gradeColor"
                      stroke-width="10"
                      stroke-dasharray="427.3"
                      [attr.stroke-dashoffset]="427.3 - (427.3 * result()!.fitScore / 100)"
                      stroke-linecap="round"
                      transform="rotate(-90 80 80)"
                      style="transition:stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)"
                    />
                  </svg>
                  <div class="score-inner">
                    <span class="score-num" [style.color]="result()!.gradeColor">{{ result()!.fitScore }}</span>
                    <span class="score-denom">/100</span>
                    <span class="score-grade" [style.color]="result()!.gradeColor">{{ result()!.grade }}</span>
                  </div>
                </div>
                <div class="score-summary">
                  <h2>Fit Summary</h2>
                  <p class="summary-text">{{ result()!.summary }}</p>
                  <div class="category-bars">
                    @for (cat of result()!.categoryScores; track cat.label) {
                      <div class="cat-row">
                        <span class="cat-label">{{ cat.label }}</span>
                        <div class="cat-track">
                          <div class="cat-fill" [style.width.%]="cat.score" [style.background]="cat.color"></div>
                        </div>
                        <span class="cat-val" [style.color]="cat.color">{{ cat.score }}%</span>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Three cards -->
              <div class="cards-row">
                <div class="result-card">
                  <div class="result-card-header matched">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Matched Skills
                    <span class="badge-count green">{{ result()!.matchedSkills.length }}</span>
                  </div>
                  @if (result()!.matchedSkills.length) {
                    <div class="chips-wrap">
                      @for (s of result()!.matchedSkills; track s) {
                        <span class="chip green">{{ s }}</span>
                      }
                    </div>
                  } @else {
                    <p class="empty-note">No direct skill matches found.</p>
                  }
                </div>

                <div class="result-card">
                  <div class="result-card-header missing">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Skill Gaps
                    <span class="badge-count red">{{ result()!.missingSkills.length }}</span>
                  </div>
                  @if (result()!.missingSkills.length) {
                    <div class="chips-wrap">
                      @for (s of result()!.missingSkills; track s) {
                        <span class="chip red">{{ s }}</span>
                      }
                    </div>
                  } @else {
                    <p class="empty-note success">All required skills matched! 🎉</p>
                  }
                </div>

                <div class="result-card">
                  <div class="result-card-header neutral">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    Experience & Education
                  </div>
                  <div class="note-list">
                    <div class="note-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span>{{ result()!.experienceNote }}</span>
                    </div>
                    <div class="note-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                      <span>{{ result()!.educationNote }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tips -->
              <div class="tips-card">
                <div class="tips-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Tips to Tailor Your Resume
                </div>
                <div class="tips-list">
                  @for (tip of result()!.tips; track tip; let i = $index) {
                    <div class="tip-item">
                      <span class="tip-num">{{ i + 1 }}</span>
                      <span>{{ tip }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="reanalyse-row">
                <button class="btn-ghost" (click)="reset()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.56"/></svg>
                  Reset & Analyse Again
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shell { display:flex; min-height:100vh; }
    .content { flex:1; display:flex; flex-direction:column; min-width:0; background:var(--bg); }
    .page-wrap { padding:32px 32px 60px; max-width:1200px; width:100%; margin:0 auto; }

    /* Hero */
    .page-hero { display:flex; align-items:center; gap:20px; margin-bottom:32px; }
    .hero-icon { width:56px; height:56px; border-radius:16px; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
    .page-hero h1 { font-size:26px; font-weight:800; color:var(--text); margin:0 0 4px; }
    .hero-sub { font-size:14px; color:var(--muted); margin:0; line-height:1.6; }

    /* Input grid */
    .input-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .input-card { background:var(--card); border:1px solid var(--border); border-radius:16px; overflow:hidden; display:flex; flex-direction:column; transition:border-color .2s; }
    .input-card.has-content { border-color:rgba(99,102,241,.35); }

    /* Card header */
    .input-card-header { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid var(--border); }
    .input-label-row { display:flex; align-items:center; gap:8px; }
    .input-dot { width:10px; height:10px; border-radius:50%; }
    .input-dot.resume { background:linear-gradient(135deg,#6366f1,#8b5cf6); }
    .input-dot.jd { background:linear-gradient(135deg,#22c55e,#16a34a); }
    .input-title { font-size:13px; font-weight:700; color:var(--text); }
    .header-actions { display:flex; align-items:center; gap:8px; }
    .char-pill { font-size:10px; padding:2px 8px; border-radius:20px; background:var(--primary-bg); color:var(--primary); font-weight:600; }
    .clear-btn { background:none; border:1px solid var(--border); color:var(--muted); font-size:11px; padding:3px 10px; border-radius:6px; cursor:pointer; }
    .clear-btn:hover { color:var(--text); border-color:var(--muted); }

    /* Upload zone */
    .upload-zone {
      margin:16px 16px 0; border:2px dashed var(--border); border-radius:12px;
      min-height:96px; display:flex; align-items:center; justify-content:center;
      cursor:pointer; transition:border-color .2s, background .2s;
    }
    .upload-zone:hover { border-color:var(--primary); background:var(--primary-bg); }
    .upload-zone.dragging { border-color:var(--primary); background:var(--primary-bg); }
    .upload-idle { display:flex; flex-direction:column; align-items:center; gap:6px; padding:16px; }
    .upload-title { font-size:13px; font-weight:600; color:var(--text); }
    .upload-sub { font-size:11px; color:var(--muted); }
    .upload-idle svg { color:var(--muted); }
    .upload-loading { display:flex; align-items:center; gap:10px; font-size:13px; color:var(--muted); padding:16px; }
    .upload-success { display:flex; flex-direction:column; align-items:center; gap:6px; padding:14px; text-align:center; }
    .file-name { font-size:13px; font-weight:600; color:var(--text); }
    .file-sub { font-size:11px; color:#22c55e; }
    .mini-spinner { width:18px; height:18px; border:2px solid var(--border); border-top-color:var(--primary); border-radius:50%; animation:spin .7s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }

    /* Or divider */
    .or-divider { display:flex; align-items:center; gap:10px; padding:10px 16px; }
    .or-divider::before,.or-divider::after { content:''; flex:1; height:1px; background:var(--border); }
    .or-divider span { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap; }

    /* Textarea */
    .text-area { flex:1; resize:none; padding:12px 16px; background:var(--surface); border:none; color:var(--text); font-size:13px; font-family:inherit; line-height:1.6; outline:none; }
    .text-area::placeholder { color:var(--text-muted); line-height:1.8; }
    .text-area:focus { box-shadow:inset 0 0 0 2px var(--primary); }

    /* Error banner */
    .error-banner { display:flex; align-items:center; gap:8px; margin-top:12px; padding:10px 14px; border-radius:10px; background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2); color:#ef4444; font-size:12px; }

    /* Analyse button */
    .analyse-row { display:flex; align-items:center; gap:16px; margin-top:20px; }
    .btn-analyse { display:inline-flex; align-items:center; gap:10px; padding:14px 32px; border-radius:12px; border:none; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; font-size:15px; font-weight:700; cursor:pointer; transition:opacity .15s, transform .1s; }
    .btn-analyse:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); }
    .btn-analyse:disabled { opacity:0.4; cursor:not-allowed; transform:none; }
    .btn-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
    .hint { font-size:12px; color:var(--muted); }

    /* Results */
    .results-section { margin-top:36px; animation:fadeInUp .4s ease; }
    @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

    /* Score hero */
    .score-hero { display:flex; align-items:center; gap:40px; background:var(--card); border:1px solid var(--border); border-radius:20px; padding:32px 36px; margin-bottom:20px; }
    .score-ring-wrap { position:relative; width:160px; height:160px; flex-shrink:0; }
    .score-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .score-num { font-size:42px; font-weight:900; line-height:1; }
    .score-denom { font-size:13px; color:var(--muted); margin-top:-4px; }
    .score-grade { font-size:13px; font-weight:700; margin-top:4px; text-transform:uppercase; letter-spacing:1px; }
    .score-summary { flex:1; min-width:0; }
    .score-summary h2 { font-size:18px; font-weight:800; color:var(--text); margin:0 0 8px; }
    .summary-text { font-size:13px; color:var(--muted); line-height:1.7; margin:0 0 20px; }
    .category-bars { display:flex; flex-direction:column; gap:8px; }
    .cat-row { display:flex; align-items:center; gap:12px; }
    .cat-label { font-size:11px; color:var(--muted); width:110px; flex-shrink:0; }
    .cat-track { flex:1; height:6px; background:var(--border); border-radius:3px; overflow:hidden; }
    .cat-fill { height:100%; border-radius:3px; transition:width 1.2s cubic-bezier(.4,0,.2,1); }
    .cat-val { font-size:11px; font-weight:700; width:34px; text-align:right; }

    /* Cards */
    .cards-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:20px; }
    .result-card { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:20px; }
    .result-card-header { display:flex; align-items:center; gap:8px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:14px; }
    .result-card-header.matched { color:#22c55e; }
    .result-card-header.missing { color:#ef4444; }
    .result-card-header.neutral { color:var(--muted); }
    .badge-count { margin-left:auto; font-size:11px; padding:2px 8px; border-radius:20px; font-weight:700; }
    .badge-count.green { background:rgba(34,197,94,.1); color:#22c55e; }
    .badge-count.red { background:rgba(239,68,68,.1); color:#ef4444; }
    .chips-wrap { display:flex; flex-wrap:wrap; gap:6px; }
    .chip { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; }
    .chip.green { background:rgba(34,197,94,.1); color:#22c55e; border:1px solid rgba(34,197,94,.2); }
    .chip.red { background:rgba(239,68,68,.1); color:#ef4444; border:1px solid rgba(239,68,68,.2); }
    .empty-note { font-size:12px; color:var(--muted); margin:0; }
    .empty-note.success { color:#22c55e; }
    .note-list { display:flex; flex-direction:column; gap:10px; }
    .note-item { display:flex; align-items:flex-start; gap:8px; font-size:12px; color:var(--muted); line-height:1.5; }
    .note-item svg { flex-shrink:0; margin-top:1px; }

    /* Tips */
    .tips-card { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:24px; margin-bottom:20px; }
    .tips-header { display:flex; align-items:center; gap:10px; font-size:14px; font-weight:700; color:var(--text); margin-bottom:16px; }
    .tips-header svg { color:var(--primary); }
    .tips-list { display:flex; flex-direction:column; gap:10px; }
    .tip-item { display:flex; align-items:flex-start; gap:14px; }
    .tip-num { width:24px; height:24px; border-radius:8px; background:var(--primary-bg); color:var(--primary); font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .tip-item span { font-size:13px; color:var(--muted); line-height:1.6; padding-top:3px; }

    .reanalyse-row { display:flex; justify-content:center; }
    .btn-ghost { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border-radius:10px; border:1px solid var(--border); background:none; color:var(--muted); font-size:13px; cursor:pointer; }
    .btn-ghost:hover { color:var(--text); background:var(--hover); }

    @media (max-width:1024px) { .cards-row { grid-template-columns:1fr 1fr; } }
    @media (max-width:768px) {
      .page-wrap { padding:20px 16px 40px; }
      .input-grid { grid-template-columns:1fr; }
      .score-hero { flex-direction:column; align-items:flex-start; gap:24px; }
      .cards-row { grid-template-columns:1fr; }
    }
  `]
})
export class ResumeComponent {
  sidebarOpen = signal(false);
  resumeText   = signal('');
  jdText       = signal('');
  resumeFileName = signal('');
  jdFileName     = signal('');
  pdfLoading    = signal(false);
  jdPdfLoading  = signal(false);
  draggingResume = signal(false);
  draggingJd     = signal(false);
  pdfError = signal('');
  analysing = signal(false);
  result = signal<AnalysisResult | null>(null);

  canAnalyse = computed(() =>
    this.resumeText().trim().length > 50 && this.jdText().trim().length > 50
  );

  // ── File handling ──────────────────────────────────────────

  onFileChange(event: Event, target: 'resume' | 'jd'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this._readFile(file, target);
    input.value = ''; // reset so same file can be re-selected
  }

  onDrop(event: DragEvent, target: 'resume' | 'jd'): void {
    event.preventDefault();
    if (target === 'resume') this.draggingResume.set(false);
    else this.draggingJd.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this._readFile(file, target);
  }

  private async _readFile(file: File, target: 'resume' | 'jd'): Promise<void> {
    this.pdfError.set('');
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.pdfError.set('Only PDF files are supported. Please upload a .pdf file.');
      return;
    }
    if (target === 'resume') this.pdfLoading.set(true);
    else this.jdPdfLoading.set(true);

    try {
      const text = await this._extractPdfText(file);
      if (target === 'resume') {
        this.resumeText.set(text);
        this.resumeFileName.set(file.name);
      } else {
        this.jdText.set(text);
        this.jdFileName.set(file.name);
      }
    } catch (err) {
      this.pdfError.set('Could not read PDF. Make sure it is not password-protected and try again.');
    } finally {
      if (target === 'resume') this.pdfLoading.set(false);
      else this.jdPdfLoading.set(false);
    }
  }

  private async _extractPdfText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      pages.push(pageText);
    }
    return pages.join('\n');
  }

  clearResume(): void {
    this.resumeText.set('');
    this.resumeFileName.set('');
    this.pdfError.set('');
  }

  reset(): void {
    this.result.set(null);
    this.resumeText.set('');
    this.jdText.set('');
    this.resumeFileName.set('');
    this.jdFileName.set('');
    this.pdfError.set('');
  }

  // ── Analysis ───────────────────────────────────────────────

  analyse(): void {
    if (!this.canAnalyse()) return;
    this.analysing.set(true);
    this.result.set(null);
    setTimeout(() => {
      this.result.set(this._computeAnalysis(this.resumeText(), this.jdText()));
      this.analysing.set(false);
    }, 900);
  }

  private _tokenise(text: string): Set<string> {
    return new Set(
      text.toLowerCase().replace(/[^a-z0-9\s+#.]/g, ' ').split(/\s+/).filter(w => w.length > 2)
    );
  }

  private _extractSkills(text: string): string[] {
    const skills = [
      'python','javascript','typescript','java','react','angular','vue','node','sql','mongodb',
      'postgresql','mysql','redis','docker','kubernetes','aws','azure','gcp','git','linux',
      'rest','graphql','fastapi','django','flask','spring','tensorflow','pytorch',
      'machine learning','deep learning','nlp','data science','pandas','numpy','scikit-learn',
      'sales','marketing','crm','negotiation','customer service','lead generation',
      'project management','agile','scrum','excel','powerpoint','word','photoshop','figma',
      'delivery','driving','bike','forklift','packing','loading','security','surveillance',
      'customer handling','cash handling','inventory','warehouse','logistics','supply chain',
      'communication','leadership','teamwork','problem solving','time management',
      'accounting','finance','tally','gst','bookkeeping','payroll',
      'html','css','devops','ci/cd','testing','qa','selenium','jest',
    ];
    const lower = text.toLowerCase();
    return skills.filter(s => lower.includes(s));
  }

  private _extractYearsExp(text: string): number {
    const patterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/i,
      /experience[:\s]+(\d+)\+?\s*years?/i,
      /(\d+)\s*(?:yr|yrs)/i,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) return parseInt(m[1], 10);
    }
    return 0;
  }

  private _computeAnalysis(resume: string, jd: string): AnalysisResult {
    const resumeSkills = new Set(this._extractSkills(resume));
    const jdSkills     = new Set(this._extractSkills(jd));
    const matchedSkills = [...jdSkills].filter(s => resumeSkills.has(s));
    const missingSkills = [...jdSkills].filter(s => !resumeSkills.has(s));

    const skillScore = jdSkills.size > 0
      ? Math.round((matchedSkills.length / jdSkills.size) * 100) : 50;

    const resumeTokens = this._tokenise(resume);
    const jdTokens     = this._tokenise(jd);
    const overlap      = [...jdTokens].filter(t => resumeTokens.has(t)).length;
    const keywordScore = Math.min(100, Math.round((overlap / Math.max(jdTokens.size, 1)) * 120));

    const resumeYears = this._extractYearsExp(resume);
    const jdYears     = this._extractYearsExp(jd);
    let expScore = 70;
    let experienceNote = 'Experience requirements not specified in JD.';
    if (jdYears > 0) {
      if (resumeYears === 0) {
        expScore = 40;
        experienceNote = `JD requires ${jdYears}+ years. Could not detect years in resume — add it explicitly.`;
      } else if (resumeYears >= jdYears) {
        expScore = 100;
        experienceNote = `You have ${resumeYears} yrs — meets the ${jdYears}+ year requirement. ✓`;
      } else {
        expScore = Math.round(40 + (resumeYears / jdYears) * 60);
        experienceNote = `You have ${resumeYears} yrs; JD asks for ${jdYears}+. Gap of ${jdYears - resumeYears} year(s).`;
      }
    } else if (resumeYears > 0) {
      expScore = 80;
      experienceNote = `${resumeYears} years of experience detected.`;
    }

    const eduLevels = ['phd','doctorate','master','mba','bachelor','degree','graduate','diploma','12th','10th'];
    const resumeEdu = eduLevels.find(l => resume.toLowerCase().includes(l));
    const jdEdu     = eduLevels.find(l => jd.toLowerCase().includes(l));
    let eduScore = 70;
    let educationNote = 'No specific education requirement detected in JD.';
    if (jdEdu) {
      const jdIdx     = eduLevels.indexOf(jdEdu);
      const resumeIdx = resumeEdu ? eduLevels.indexOf(resumeEdu) : 999;
      if (resumeIdx <= jdIdx) {
        eduScore = 100;
        educationNote = `Your ${resumeEdu} meets the ${jdEdu} requirement. ✓`;
      } else {
        eduScore = 50;
        educationNote = `JD prefers ${jdEdu}; resume shows ${resumeEdu ?? 'unspecified level'}.`;
      }
    } else if (resumeEdu) {
      educationNote = `${resumeEdu.charAt(0).toUpperCase() + resumeEdu.slice(1)} degree detected.`;
    }

    const fitScore = Math.min(99, Math.max(5, Math.round(
      skillScore * 0.45 + keywordScore * 0.25 + expScore * 0.20 + eduScore * 0.10
    )));

    const grade = fitScore >= 80 ? 'Excellent Fit' : fitScore >= 65 ? 'Good Fit'
      : fitScore >= 50 ? 'Partial Fit' : fitScore >= 35 ? 'Weak Fit' : 'Poor Fit';
    const gradeColor = fitScore >= 80 ? '#22c55e' : fitScore >= 65 ? '#6366f1'
      : fitScore >= 50 ? '#f59e0b' : fitScore >= 35 ? '#f97316' : '#ef4444';

    const summary = fitScore >= 80
      ? 'Strong alignment. Your skills and background closely match what the employer is looking for.'
      : fitScore >= 65
      ? 'Good alignment overall. Addressing the skill gaps below will strengthen your application.'
      : fitScore >= 50
      ? 'Moderate alignment. You have some relevant skills but are missing several key requirements.'
      : 'Limited alignment. Consider upskilling or tailoring your resume significantly before applying.';

    const tips: string[] = [];
    if (missingSkills.length > 0)
      tips.push(`Add any experience with: ${missingSkills.slice(0, 4).join(', ')}. Projects and coursework count.`);
    if (keywordScore < 60)
      tips.push('Mirror the exact wording from the JD in your resume — ATS systems score exact keyword matches.');
    if (resumeYears === 0 && jdYears > 0)
      tips.push('State your total years of experience clearly near the top (e.g. "3+ years of experience in…").');
    if (jdEdu && eduScore < 80)
      tips.push('Highlight your highest qualification prominently. If studying, mention expected graduation date.');
    tips.push('Open with a 3–4 line summary that directly references the job title and 2–3 of its top requirements.');
    tips.push('Quantify achievements — use numbers, percentages, and outcomes wherever possible.');
    if (fitScore < 65)
      tips.push('Build 1–2 portfolio projects demonstrating missing skills to close the gap quickly.');

    return {
      fitScore, grade, gradeColor, matchedSkills, missingSkills,
      experienceNote, educationNote, tips, summary,
      categoryScores: [
        { label: 'Skill Match',      score: skillScore,                    color: '#6366f1' },
        { label: 'Keyword Overlap',  score: Math.min(100, keywordScore),   color: '#8b5cf6' },
        { label: 'Experience',       score: expScore,                      color: '#22c55e' },
        { label: 'Education',        score: eduScore,                      color: '#f59e0b' },
      ],
    };
  }
}
