import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { SearchPanelComponent, SearchParams } from '../../shared/components/search-panel/search-panel.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, SearchPanelComponent],
  template: `
    <div class="shell">
      <app-sidebar [open]="sidebarOpen()" (close)="sidebarOpen.set(false)" />
      <div class="content">
        <app-navbar (toggleSidebar)="sidebarOpen.set(!sidebarOpen())" />
        <div class="main">
          <div class="page-header">
            <h1>Search Candidates</h1>
            <p class="subtitle">Enter a job description and filters to find the best candidates</p>
          </div>
          <app-search-panel (searchParams)="onSearch($event)" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shell { display:flex; min-height:100vh; }
    .content { flex:1; display:flex; flex-direction:column; min-width:0; }
    .main { flex:1; max-width:800px; width:100%; margin:0 auto; padding:24px 20px; }
    .page-header { margin-bottom:20px; }
    .page-header h1 { font-size:22px; font-weight:700; color:var(--text); margin:0; }
    .subtitle { font-size:13px; color:var(--muted); margin:4px 0 0; }
  `]
})
export class SearchComponent {
  sidebarOpen = signal(false);
  constructor(private router: Router) {}

  onSearch(params: SearchParams): void {
    // Store in sessionStorage as backup in case router state gets dropped
    sessionStorage.setItem('lastSearchParams', JSON.stringify(params));
    this.router.navigate(['/results'], { state: { params } });
  }
}
