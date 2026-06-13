import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <h2>Welcome back</h2>
          <p>Sign in to your RoleSense account</p>
        </div>
        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="field">
            <label class="label">Email</label>
            <input class="input" type="email" [(ngModel)]="email" name="email" placeholder="you@company.com" required autocomplete="email" />
          </div>
          <div class="field">
            <label class="label">Password</label>
            <input class="input" type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required autocomplete="current-password" />
          </div>
          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }
          <button class="btn-primary" type="submit" [disabled]="loading()">
            @if (loading()) { Signing in… } @else { Sign In }
          </button>
        </form>
        <div class="auth-footer">
          Don't have an account? <a routerLink="/signup">Sign up</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height:calc(100vh - 56px); display:flex; align-items:center; justify-content:center; padding:20px; }
    .auth-card { width:100%; max-width:400px; background:var(--card); border:1px solid var(--border); border-radius:16px; padding:32px; }
    .auth-header { text-align:center; margin-bottom:24px; }
    .auth-logo { width:48px; height:48px; border-radius:12px; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; color:#fff; margin:0 auto 12px; }
    .auth-header h2 { font-size:20px; font-weight:700; color:var(--text); margin:0 0 4px; }
    .auth-header p { font-size:13px; color:var(--muted); margin:0; }
    .auth-form { display:flex; flex-direction:column; gap:14px; }
    .field { display:flex; flex-direction:column; gap:4px; }
    .label { font-size:12px; font-weight:600; color:var(--muted); }
    .input { padding:10px 12px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text); font-size:13px; outline:none; }
    .input:focus { border-color:var(--primary); }
    .error-msg { padding:8px 12px; border-radius:8px; font-size:12px; color:#ef4444; background:rgba(239,68,68,0.08); }
    .btn-primary { padding:10px; border-radius:8px; border:none; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-primary:hover { opacity:0.9; }
    .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
    .auth-footer { text-align:center; margin-top:16px; font-size:13px; color:var(--muted); }
    .auth-footer a { color:var(--primary); text-decoration:none; font-weight:600; }
  `]
})
export class SigninComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => { this.error.set(e.error?.detail || 'Login failed'); this.loading.set(false); },
    });
  }
}
