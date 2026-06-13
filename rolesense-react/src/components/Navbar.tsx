import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, LayoutDashboard, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/search", label: "Search", icon: Search },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Navbar() {
  const loc = useLocation();
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Search className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">RoleSense</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wide">AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const active = loc.pathname === item.path;
              return <Link key={item.path} to={item.path} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}><item.icon className="h-4 w-4" />{item.label}</Link>;
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-secondary/50">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">{user.name.charAt(0).toUpperCase()}</div>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { logout(); nav("/"); }} className="text-muted-foreground"><LogOut className="h-4 w-4" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => nav("/signin")}>Sign In</Button>
              <Button size="sm" onClick={() => nav("/signup")}>Get Started</Button>
            </div>
          )}
          <button className="md:hidden p-2 rounded-lg hover:bg-secondary" onClick={() => setMobile(!mobile)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>
      {mobile && <div className="md:hidden border-t px-4 py-2 space-y-1 bg-background">{navItems.map(item => <Link key={item.path} to={item.path} onClick={() => setMobile(false)} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", loc.pathname === item.path ? "bg-primary/10 text-primary" : "text-muted-foreground")}><item.icon className="h-4 w-4" />{item.label}</Link>)}</div>}
    </header>
  );
}
