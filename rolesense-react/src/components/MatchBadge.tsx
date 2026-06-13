import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
export function MatchBadge({ percent, size = "md" }: { percent: number; size?: "sm" | "md" | "lg" }) {
  const r = size === "sm" ? 18 : size === "md" ? 22 : 28;
  const sw = size === "sm" ? 3 : size === "md" ? 3.5 : 4;
  const circ = 2 * Math.PI * r;
  const off = circ - (percent / 100) * circ;
  const c = percent >= 80 ? "#22c55e" : percent >= 60 ? "#eab308" : percent >= 40 ? "#f97316" : "#ef4444";
  const lbl = percent >= 80 ? "Excellent" : percent >= 60 ? "Strong" : percent >= 40 ? "Moderate" : "Low";
  return (
    <div className={cn("relative inline-flex items-center justify-center", size === "sm" ? "h-10 w-10" : size === "md" ? "h-12 w-12" : "h-16 w-16")}>
      <svg width="100%" height="100%" viewBox={`0 0 ${(r+sw)*2} ${(r+sw)*2}`}>
        <circle cx={r+sw} cy={r+sw} r={r} fill="none" stroke="currentColor" strokeWidth={sw} className="text-secondary" />
        <motion.circle cx={r+sw} cy={r+sw} r={r} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: off }} transition={{ duration: 1, ease: "easeOut" }} transform={`rotate(-90 ${r+sw} ${r+sw})`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold leading-none", size === "sm" ? "text-[9px]" : "text-xs")} style={{ color: c }}>{Math.round(percent)}%</span>
        {size !== "sm" && <span className="text-[7px] text-muted-foreground leading-none mt-0.5">{lbl}</span>}
      </div>
    </div>
  );
}
