export interface User { id: number; email: string; name: string; company: string }
export interface AuthResponse { access_token: string; user: User }
export interface Candidate {
  rank: number; name: string; role: string; location: string; experience: number;
  match_percent: number; raw_score: number; skills: string[]; strengths: string[]; risks: string[];
  confidence: { label: string; score: number }
}
export interface RankResponse { candidates: Candidate[]; total: number }
export interface Analytics {
  total_candidates: number; avg_score: number; avg_experience: number;
  high_confidence: number; medium_confidence: number; low_confidence: number;
  top_skills: { skill: string; count: number }[];
  score_distribution: { range: string; count: number }[];
  location_stats: { location: string; count: number }[];
  confidence_distribution: { label: string; count: number }[];
}
export interface SearchFilters {
  job_description: string; location: string; skills: string;
  min_experience: number | null; remote: boolean; top_n: number
}
export interface DemoPreset {
  label: string; jd: string; skills: string; location: string; experience: number;
}
