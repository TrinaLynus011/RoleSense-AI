import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'confidenceLabel', standalone: true })
export class ConfidencePipe implements PipeTransform {
  transform(score: number): { label: string; color: string } {
    if (score >= 0.65) return { label: 'High', color: '#22c55e' };
    if (score >= 0.55) return { label: 'Medium', color: '#eab308' };
    return { label: 'Low', color: '#ef4444' };
  }
}

@Pipe({ name: 'scoreLabel', standalone: true })
export class ScoreLabelPipe implements PipeTransform {
  transform(pct: number): string {
    if (pct >= 80) return 'Excellent Match';
    if (pct >= 65) return 'Strong Match';
    if (pct >= 50) return 'Moderate Match';
    return 'Minimal Match';
  }
}
