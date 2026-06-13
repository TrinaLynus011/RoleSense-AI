import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui";
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <Button variant="ghost" size="icon" onClick={toggle} className="rounded-lg">{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>;
}
