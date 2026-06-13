import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "default", ...props }, ref) => (
  <button ref={ref} className={cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    variant === "default" && "bg-primary text-primary-foreground hover:opacity-90 shadow-sm",
    variant === "ghost" && "hover:bg-secondary text-foreground",
    variant === "outline" && "border border-input bg-background hover:bg-secondary text-foreground",
    variant === "secondary" && "bg-secondary text-secondary-foreground hover:opacity-80",
    variant === "destructive" && "bg-destructive text-destructive-foreground hover:opacity-90",
    size === "default" && "h-9 px-4 py-2",
    size === "sm" && "h-8 px-3 text-xs",
    size === "lg" && "h-10 px-6",
    size === "icon" && "h-9 w-9",
    className
  )} {...props} />
));
Button.displayName = "Button";
export { Button };
