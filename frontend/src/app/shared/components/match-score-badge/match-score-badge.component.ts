import { Component, input } from '@angular/core';

@Component({
  selector: 'app-match-score-badge',
  standalone: true,
  template: `
    <div class="score-box" [style.--c]="color()">
      <span class="score-pct">{{ percent() }}%</span>
      <span class="score-label">{{ label() }}</span>
    </div>
  `,
  styles: [`
    .score-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 72px;
      padding: 8px 14px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--c) 12%, transparent);
      border: 1.5px solid color-mix(in srgb, var(--c) 30%, transparent);
      border-left: 4px solid var(--c);
      gap: 3px;
    }
    .score-pct {
      font-size: 18px;
      font-weight: 800;
      color: var(--c);
      line-height: 1;
      letter-spacing: -0.5px;
    }
    .score-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--c);
      opacity: 0.85;
    }
  `]
})
export class MatchScoreBadgeComponent {
  percent = input.required<number>();
  label   = input<string>('');
  color   = input<string>('#6366f1');
}
