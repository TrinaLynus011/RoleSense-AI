import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({ checked, onCheckedChange, className, label }: { checked: boolean; onCheckedChange: (v: boolean) => void; className?: string; label?: string }) {
  return (
    <label className={cn("inline-flex items-center gap-2 cursor-pointer", className)}>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          checked ? "bg-primary" : "bg-input"
        )}
      >
        <span className={cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform", checked ? "translate-x-4" : "translate-x-0")} />
      </button>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </label>
  );
}
