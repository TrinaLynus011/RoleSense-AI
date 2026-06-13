import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <main class="landing">
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <div class="badge">AI-Powered Recruitment Platform</div>
          <h1 class="hero-title">
            Rank candidates the way<br/>
            <span class="gradient-text">a great recruiter would</span>
          </h1>
          <p class="hero-subtitle">
            RoleSense uses semantic AI to understand candidate fit beyond keywords.
            Stop filtering — start discovering top talent.
          </p>
          <div class="hero-actions">
            <a routerLink="/signup" class="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              Get Started Free
            </a>
            <a routerLink="/signin" class="btn-secondary">Sign In</a>
          </div>
        </div>
      </section>
      <section class="features">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon" style="background:rgba(99,102,241,0.1);color:#6366f1;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <h3>Semantic Search</h3>
            <p>Understands candidate profiles beyond keywords using transformer-based embeddings.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:rgba(34,197,94,0.1);color:#22c55e;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <h3>8-Dimension Scoring</h3>
            <p>Skills, experience, location, education, behavioral signals — weighted intelligently.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:rgba(251,191,36,0.1);color:#f59e0b;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </div>
            <h3>Analytics Dashboard</h3>
            <p>Interactive charts and recruiter insights to understand your talent pool.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:rgba(139,92,246,0.1);color:#8b5cf6;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>FAISS-Powered</h3>
            <p>Blazing fast similarity search with FAISS vector index supporting 1000s of profiles.</p>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .landing { min-height:100vh; }
    .hero { position:relative; min-height:calc(100vh - 56px); display:flex; align-items:center; justify-content:center; overflow:hidden; padding:40px 20px; }
    .hero-bg { position:absolute; inset:0; background:radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.06) 0%, transparent 50%); pointer-events:none; }
    .hero-content { position:relative; z-index:1; max-width:700px; text-align:center; }
    .badge { display:inline-block; padding:6px 14px; border-radius:20px; background:var(--primary-bg); color:var(--primary); font-size:12px; font-weight:600; letter-spacing:0.3px; margin-bottom:20px; border:1px solid rgba(99,102,241,0.2); }
    .hero-title { font-size:44px; font-weight:800; line-height:1.15; color:var(--text); margin:0 0 16px; letter-spacing:-1px; }
    .gradient-text { background:linear-gradient(135deg,#6366f1,#a78bfa,#8b5cf6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .hero-subtitle { font-size:16px; color:var(--muted); line-height:1.7; max-width:520px; margin:0 auto 32px; }
    .hero-actions { display:flex; align-items:center; justify-content:center; gap:12px; }
    .btn-primary, .btn-secondary { display:inline-flex; align-items:center; gap:8px; padding:12px 24px; border-radius:10px; font-size:14px; font-weight:600; text-decoration:none; transition:all .15s; }
    .btn-primary { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; border:none; }
    .btn-primary:hover { opacity:0.9; transform:translateY(-1px); }
    .btn-secondary { background:transparent; color:var(--text); border:1px solid var(--border); }
    .btn-secondary:hover { background:var(--hover); }
    .features { max-width:900px; margin:0 auto; padding:60px 20px 80px; }
    .features-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .feature-card { padding:24px; border-radius:12px; border:1px solid var(--border); background:var(--card); transition:all .2s; }
    .feature-card:hover { border-color:var(--primary); transform:translateY(-2px); }
    .feature-icon { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:12px; }
    .feature-card h3 { font-size:16px; font-weight:600; color:var(--text); margin:0 0 6px; }
    .feature-card p { font-size:13px; color:var(--muted); line-height:1.6; margin:0; }
    @media (max-width:640px) { .hero-title { font-size:28px; } .features-grid { grid-template-columns:1fr; } }
  `]
})
export class LandingComponent {}
