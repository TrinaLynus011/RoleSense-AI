import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SearchToolbar } from "@/components/SearchToolbar";
import { CandidateCard } from "@/components/CandidateCard";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import type { Candidate, Analytics } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

export function SearchPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"recruiter" | "candidate">("recruiter");
  const [showAnalytics, setShowAnalytics] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!user) nav("/signin"); }, [user, nav]);
  useEffect(() => { if (!analytics) api.getAnalytics().then(setAnalytics).catch(() => {}); }, []);

  const handleSearch = async (filters: any) => {
    setLoading(true); setError(""); setSearched(true);
    try { const d = await api.rankCandidates(filters); setCandidates(d.candidates || []); } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  return (
    <div className="min-h-screen">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-lg font-bold">Find Candidates</h1><p className="text-xs text-muted-foreground">Rank candidates against any job description</p></div>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            <button onClick={() => setMode("recruiter")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === "recruiter" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Recruiter</button>
            <button onClick={() => setMode("candidate")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === "candidate" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Candidate</button>
          </div>
        </div>

        {mode === "recruiter" ? <SearchToolbar onSearch={handleSearch} loading={loading} /> : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Paste your resume to find the best matching job roles.</p>
            <textarea placeholder="Paste your resume text here..." className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" rows={4} />
            <button className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Find Matching Jobs</button>
          </div>
        )}

        <div className="flex gap-4 mt-4">
          <div ref={resultsRef} className="flex-1 min-w-0 space-y-2">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-xl border p-3 space-y-2">
                    <div className="flex items-center gap-3"><Skeleton className="w-8 h-8 rounded-lg" /><Skeleton className="w-12 h-12 rounded-full" /><div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-60" /></div></div>
                    <div className="flex gap-1"><Skeleton className="h-5 w-16 rounded-md" /><Skeleton className="h-5 w-20 rounded-md" /><Skeleton className="h-5 w-14 rounded-md" /></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12"><p className="text-sm text-destructive">{error}</p></div>
            ) : searched && candidates.length === 0 ? (
              <div className="text-center py-12"><p className="text-sm text-muted-foreground">No candidates found. Try adjusting your filters.</p></div>
            ) : searched ? (
              <>
                <div className="flex items-center justify-between mb-1"><p className="text-xs text-muted-foreground">Found <span className="font-medium text-foreground">{candidates.length}</span> candidates</p></div>
                {candidates.map((c, i) => <CandidateCard key={c.rank} candidate={c} index={i} />)}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3"><svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
                <p className="text-sm text-muted-foreground">Enter a job description and click "Find Candidates"</p>
                <p className="text-xs text-muted-foreground mt-1">Or try one of the demo templates above</p>
              </div>
            )}
          </div>

          {analytics && showAnalytics && searched && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden xl:block w-72 shrink-0">
              <div className="sticky top-20"><AnalyticsPanel data={analytics} /></div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
