export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Candidate {
  rank: number;
  name: string;
  overall_score: number;
  match_percent: number;
  confidence: { label: string; color: string };
  location: string;
  skills: string[];
  experience: string;
  score_breakdown: Record<string, number>;
  explanation?: {
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
    confidence: string;
  };
}

export interface RankResponse {
  candidates: Candidate[];
  total: number;
  job_info: Record<string, any>;
}

export interface ResumeAnalysis {
  fit_score: number;
  matched_skills: string[];
  missing_skills: string[];
  experience_gap: string;
  education_match: string;
  tips: string[];
  summary: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  source: string;
  category: 'hiring' | 'market' | 'skills' | 'policy';
  url?: string;
}

export interface Analytics {
  total_candidates: number;
  avg_score: number;
  high_confidence: number;
  medium_confidence: number;
  low_confidence: number;
  score_distribution: Record<string, number>;
  top_skills: { skill: string; count: number }[];
  location_distribution: { location: string; count: number }[];
  avg_experience: number;
}
