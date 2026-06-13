import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RankResponse, Analytics } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  rankCandidates(params: {
    job_description: string;
    source?: string;
    top_n?: number;
    location?: string;
    remote_friendly?: boolean;
    min_experience?: number;
    min_confidence?: number;
    skills_filter?: string[];
  }): Observable<RankResponse> {
    return this.http.post<RankResponse>(`${this.api}/rank-candidates`, params);
  }

  getLocations(): Observable<{ locations: string[] }> {
    return this.http.get<{ locations: string[] }>(`${this.api}/locations`);
  }

  getAnalytics(): Observable<Analytics> {
    return this.http.get<Analytics>(`${this.api}/analytics`);
  }
}
