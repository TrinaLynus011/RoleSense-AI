import { cn } from "@/lib/utils";
export function Badge({ className, children, variant = "default" }: { className?: string; children: React.ReactNode; variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }) {
  return <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors", variant === "default" && "bg-primary/10 text-primary", variant === "secondary" && "bg-secondary text-secondary-foreground", variant === "destructive" && "bg-destructive/10 text-destructive", variant === "outline" && "border text-muted-foreground", variant === "success" && "bg-emerald-500/10 text-emerald-500", variant === "warning" && "bg-amber-500/10 text-amber-500", className)}>{children}</span>;
}
