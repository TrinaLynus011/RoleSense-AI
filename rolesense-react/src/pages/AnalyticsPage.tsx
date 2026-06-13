import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { Skeleton } from "@/components/ui";
import type { Analytics } from "@/lib/types";

export function AnalyticsPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!user) { nav("/signin"); return; } api.getAnalytics().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, [user, nav]);

  return (
    <div className="px-4 py-4">
      <div className="mb-4"><h1 className="text-lg font-bold">Analytics</h1><p className="text-xs text-muted-foreground">Talent pool insights and trends</p></div>
      {loading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          <Skeleton className="h-48 rounded-xl" /><Skeleton className="h-48 rounded-xl" />
        </div>
      ) : data ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AnalyticsPanel data={data} /></motion.div> : <div className="text-center py-12 text-sm text-muted-foreground">Failed to load analytics. Make sure the backend is running.</div>}
    </div>
  );
}
