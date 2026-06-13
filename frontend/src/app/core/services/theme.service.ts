import { Injectable, signal, effect } from '@angular/core';

type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storageKey = 'rolesense_theme';
  current = signal<Theme>('dark');

  constructor() {
    const stored = localStorage.getItem(this.storageKey) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      this.current.set(stored);
    }
    this._apply(this.current());
    effect(() => this._apply(this.current()));
  }

  toggle(): void {
    this.current.update(t => (t === 'dark' ? 'light' : 'dark'));
  }

  private _apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
  }
}
