import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;
  private userSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'rolesense_token';
  private userKey = 'rolesense_user';

  user$ = this.userSubject.asObservable();
  isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem(this.userKey);
    if (stored) {
      try {
        this.userSubject.next(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  signup(name: string, email: string, password: string, company = ''): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/signup`, { name, email, password, company })
      .pipe(tap(r => this._saveSession(r)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, { email, password })
      .pipe(tap(r => this._saveSession(r)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
    this.isAuthenticated$.next(false);
  }

  private _saveSession(r: AuthResponse): void {
    localStorage.setItem(this.tokenKey, r.access_token);
    localStorage.setItem(this.userKey, JSON.stringify(r.user));
    this.userSubject.next(r.user);
    this.isAuthenticated$.next(true);
  }
}
