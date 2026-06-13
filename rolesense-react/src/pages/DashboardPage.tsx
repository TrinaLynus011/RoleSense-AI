import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BarChart3, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Analytics } from "@/lib/types";

export function DashboardPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  useEffect(() => { if (!user) { nav("/signin"); return; } api.getAnalytics().then(setAnalytics).catch(() => {}); }, [user, nav]);

  const metrics = [
    { label: "Candidates Indexed", value: "740", icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Avg Match Score", value: analytics ? `${(analytics.avg_score * 100).toFixed(0)}%` : "\u2014", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "High Confidence", value: analytics ? String(analytics.high_confidence) : "\u2014", icon: BarChart3, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Total Searches", value: "12", icon: Search, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-lg font-bold">Dashboard</h1><p className="text-xs text-muted-foreground">Welcome back, {user?.name}</p></div>
        <Button onClick={() => nav("/search")} className="gap-1.5"><Search className="h-4 w-4" />New Search</Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card><CardContent className="p-3 flex items-center gap-3"><div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center`}><m.icon className={`h-5 w-5 ${m.color}`} /></div><div><p className="text-lg font-bold">{m.value}</p><p className="text-[10px] text-muted-foreground">{m.label}</p></div></CardContent></Card>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => nav("/search")}>
            <CardContent className="p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center"><Search className="h-6 w-6 text-indigo-500" /></div><div className="flex-1"><h3 className="font-semibold text-sm">Search Candidates</h3><p className="text-xs text-muted-foreground mt-0.5">Rank candidates against any job description</p></div><svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => nav("/analytics")}>
            <CardContent className="p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><BarChart3 className="h-6 w-6 text-emerald-500" /></div><div className="flex-1"><h3 className="font-semibold text-sm">View Analytics</h3><p className="text-xs text-muted-foreground mt-0.5">Explore talent pool insights and trends</p></div><svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
