import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { Analytics } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#eab308", "#f97316", "#ef4444", "#8b5cf6"];

export function AnalyticsPanel({ data }: { data: Analytics }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[{ label: "Total", value: data.total_candidates, color: "text-primary" }, { label: "Avg Score", value: `${(data.avg_score * 100).toFixed(0)}%`, color: "text-emerald-500" }, { label: "Avg Exp", value: `${data.avg_experience}y`, color: "text-amber-500" }].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="rounded-lg border bg-card p-2.5 text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
      <Card><CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-medium">Score Distribution</CardTitle></CardHeader><CardContent className="p-3"><div className="h-32"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.score_distribution}><XAxis dataKey="range" tick={{fontSize:9}} /><YAxis tick={{fontSize:9}} /><Tooltip contentStyle={{fontSize:11}} /><Bar dataKey="count" fill="#6366f1" radius={[3,3,0,0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>
      <Card><CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-medium">Top Skills</CardTitle></CardHeader><CardContent className="p-3"><div className="h-32"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.top_skills.slice(0, 8)} layout="vertical"><XAxis type="number" tick={{fontSize:9}} /><YAxis dataKey="skill" type="category" tick={{fontSize:9}} width={70} /><Tooltip contentStyle={{fontSize:11}} /><Bar dataKey="count" fill="#22c55e" radius={[0,3,3,0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>
      <Card><CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-medium">Locations</CardTitle></CardHeader><CardContent className="p-3"><div className="h-36"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.location_stats.slice(0, 6)} dataKey="count" nameKey="location" cx="50%" cy="50%" outerRadius={50} innerRadius={30}>{data.location_stats.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{fontSize:11}} /></PieChart></ResponsiveContainer></div></CardContent></Card>
      <Card><CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-medium">Confidence</CardTitle></CardHeader><CardContent className="p-3"><div className="h-28"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.confidence_distribution} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={40} innerRadius={25}>{data.confidence_distribution.map(e => <Cell key={e.label} fill={e.label === "High" ? "#22c55e" : e.label === "Medium" ? "#eab308" : "#ef4444"} />)}</Pie><Tooltip contentStyle={{fontSize:11}} /><Legend wrapperStyle={{fontSize:10}} /></PieChart></ResponsiveContainer></div></CardContent></Card>
    </div>
  );
}
