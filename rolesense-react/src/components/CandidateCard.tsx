import { motion } from "framer-motion";
import { MapPin, Briefcase, Star, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge, Card, CardContent } from "@/components/ui";
import { MatchBadge } from "./MatchBadge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Candidate } from "@/lib/types";

export function CandidateCard({ candidate, index }: { candidate: Candidate; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }}>
      <Card className={cn("group cursor-pointer transition-all hover:shadow-md", candidate.rank === 1 && "ring-1 ring-primary/30")} onClick={() => setExpanded(!expanded)}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className={cn("flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold", candidate.rank === 1 ? "bg-amber-500/10 text-amber-500" : candidate.rank === 2 ? "bg-slate-400/10 text-slate-400" : candidate.rank === 3 ? "bg-orange-500/10 text-orange-500" : "bg-secondary text-muted-foreground")}>#{candidate.rank}</div>
            <MatchBadge percent={candidate.match_percent * 100} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold truncate">{candidate.name}</h3>
                {candidate.rank === 1 && <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{candidate.role || "N/A"}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{candidate.location || "N/A"}</span>
                <span>{candidate.experience}y exp</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Badge variant={candidate.confidence.label === "High" ? "success" : candidate.confidence.label === "Medium" ? "warning" : "destructive"}>{candidate.confidence.label}</Badge>
            </div>
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {candidate.skills?.slice(0, expanded ? undefined : 4).map(s => <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>)}
            {!expanded && candidate.skills?.length > 4 && <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{candidate.skills.length - 4}</Badge>}
          </div>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t space-y-3">
              {candidate.strengths?.length > 0 && <div><p className="text-xs font-medium text-emerald-500 flex items-center gap-1 mb-1.5"><Star className="h-3 w-3" /> Strengths</p><ul className="space-y-0.5">{candidate.strengths.slice(0, 3).map((s, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">•</span>{s}</li>)}</ul></div>}
              {candidate.risks?.length > 0 && <div><p className="text-xs font-medium text-destructive flex items-center gap-1 mb-1.5"><AlertTriangle className="h-3 w-3" /> Risks</p><ul className="space-y-0.5">{candidate.risks.slice(0, 3).map((r, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="text-destructive mt-0.5">•</span>{r}</li>)}</ul></div>}
              <div className="grid grid-cols-2 gap-2"><div className="bg-secondary/50 rounded-lg p-2"><p className="text-[10px] text-muted-foreground">Match Score</p><p className="text-sm font-bold">{(candidate.match_percent * 100).toFixed(1)}%</p></div><div className="bg-secondary/50 rounded-lg p-2"><p className="text-[10px] text-muted-foreground">Raw Score</p><p className="text-sm font-bold">{(candidate.raw_score * 100).toFixed(1)}%</p></div></div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
