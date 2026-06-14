import { Component, input, AfterViewInit, ViewChild, ElementRef, effect } from '@angular/core';
import { Analytics } from '../../../core/models/user.model';
import ApexCharts from 'apexcharts';

@Component({
  selector: 'app-analytics-charts',
  standalone: true,
  template: `
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <h4>Score Distribution</h4>
        </div>
        <div #scoreChart class="chart-container"></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <h4>Top Skills</h4>
        </div>
        <div #skillsChart class="chart-container"></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <h4>Location Distribution</h4>
        </div>
        <div #locationChart class="chart-container"></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <h4>Recruiter Confidence</h4>
        </div>
        <div #confidenceChart class="chart-container"></div>
      </div>
    </div>
  `,
  styles: [`
    .charts-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .chart-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; }
    .chart-header { margin-bottom:12px; }
    .chart-header h4 { margin:0; font-size:13px; font-weight:600; color:var(--text); }
    .chart-container { min-height:240px; }
    @media (max-width:900px) { .charts-grid { grid-template-columns:1fr; } }
  `]
})
export class AnalyticsChartsComponent implements AfterViewInit {
  data = input.required<Analytics>();

  @ViewChild('scoreChart') scoreChartEl!: ElementRef;
  @ViewChild('skillsChart') skillsChartEl!: ElementRef;
  @ViewChild('locationChart') locationChartEl!: ElementRef;
  @ViewChild('confidenceChart') confidenceChartEl!: ElementRef;

  private _charts: any[] = [];
  private _viewInitialized = false;

  constructor() {
    effect(() => {
      // Access signal to register reactivity
      const d = this.data();
      if (this._viewInitialized) {
        this._render();
      }
    });
  }

  ngAfterViewInit(): void {
    this._viewInitialized = true;
    setTimeout(() => this._render(), 100);
  }

  private _render(): void {
    this._charts.forEach(c => c?.destroy());
    this._charts = [];

    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#94a3b8';
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#1e293b';
    const baseTheme = (t: string) => ({ chart: { foreColor: textColor, toolbar: { show: false } }, grid: { borderColor: gridColor } });

    const d = this.data();

    // Score distribution bar
    if (this.scoreChartEl && d.score_distribution) {
      const labels = Object.keys(d.score_distribution);
      const vals: number[] = Object.values(d.score_distribution) as number[];
      this._charts.push(new ApexCharts(this.scoreChartEl.nativeElement, {
        ...baseTheme('bar'),
        chart: { type: 'bar', height: 240, ...baseTheme('bar').chart },
        series: [{ name: 'Candidates', data: vals }],
        xaxis: { categories: labels, labels: { style: { colors: textColor, fontSize: '10px' } } },
        colors: ['#6366f1'],
        plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
        dataLabels: { enabled: false },
      }));
    }

    // Top skills horizontal bar
    if (this.skillsChartEl && d.top_skills?.length) {
      const skills = d.top_skills.slice(0, 8);
      this._charts.push(new ApexCharts(this.skillsChartEl.nativeElement, {
        ...baseTheme('bar'),
        chart: { type: 'bar', height: 240, ...baseTheme('bar').chart },
        series: [{ name: 'Count', data: skills.map((s: { skill: string; count: number }) => s.count).reverse() }],
        xaxis: { categories: skills.map((s: { skill: string; count: number }) => s.skill).reverse(), labels: { style: { colors: textColor, fontSize: '10px' } } },
        colors: ['#22c55e'],
        plotOptions: { bar: { borderRadius: 4, horizontal: true } },
        dataLabels: { enabled: false },
      }));
    }

    // Location pie
    if (this.locationChartEl && d.location_distribution?.length) {
      const locs = d.location_distribution.slice(0, 6);
      this._charts.push(new ApexCharts(this.locationChartEl.nativeElement, {
        ...baseTheme('pie'),
        chart: { type: 'donut', height: 240, ...baseTheme('pie').chart },
        series: locs.map((l: { location: string; count: number }) => l.count),
        labels: locs.map((l: { location: string; count: number }) => l.location),
        colors: ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#22c55e','#06b6d4'],
        plotOptions: { pie: { donut: { size: '65%' } } },
        dataLabels: { enabled: false },
        legend: { position: 'bottom', labels: { colors: textColor }, fontSize: '11px' },
        responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom' } } }],
      }));
    }

    // Confidence donut
    if (this.confidenceChartEl) {
      this._charts.push(new ApexCharts(this.confidenceChartEl.nativeElement, {
        ...baseTheme('pie'),
        chart: { type: 'donut', height: 240, ...baseTheme('pie').chart },
        series: [d.high_confidence, d.medium_confidence, d.low_confidence],
        labels: ['High', 'Medium', 'Low'],
        colors: ['#22c55e', '#eab308', '#ef4444'],
        plotOptions: { pie: { donut: { size: '65%' } } },
        dataLabels: { enabled: false },
        legend: { position: 'bottom', labels: { colors: textColor }, fontSize: '11px' },
      }));
    }

    this._charts.forEach(c => c.render());
  }
}
