import { motion } from "framer-motion";
import { Search, BarChart3, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Search, title: "AI-Powered Search", desc: "Rank candidates against any job description" },
  { icon: Zap, title: "Instant Rankings", desc: "Get ranked candidates in seconds" },
  { icon: Users, title: "Smart Filtering", desc: "Filter by location, skills, experience" },
  { icon: BarChart3, title: "Talent Analytics", desc: "Data-driven talent pool insights" },
];

export function LandingPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <div className="px-4 py-20 max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-secondary/50 text-xs font-medium text-muted-foreground mb-6"><Zap className="h-3 w-3 text-primary" />AI-Powered Recruiting Platform</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Find the <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Right Talent</span><br />in Seconds</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">RoleSense AI ranks candidates against your job descriptions using advanced ML, so you can focus on interviewing the best fits.</p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" onClick={() => nav(user ? "/search" : "/signup")}>{user ? "Start Searching" : "Get Started Free"}</Button>
            <Button variant="outline" size="lg" onClick={() => nav("/signin")}>Sign In</Button>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-16">
          {features.map(f => <div key={f.title} className="rounded-xl border bg-card p-4 text-left"><div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3"><f.icon className="h-4 w-4 text-primary" /></div><h3 className="text-sm font-semibold mb-1">{f.title}</h3><p className="text-xs text-muted-foreground">{f.desc}</p></div>)}
        </motion.div>
      </div>
    </div>
  );
}
