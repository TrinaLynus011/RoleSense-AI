import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
const AuthContext = createContext<{
  user: User | null; token: string | null; loading: boolean;
  login: (e: string, p: string) => Promise<void>;
  signup: (n: string, e: string, p: string, c?: string) => Promise<void>;
  logout: () => void;
}>({ user: null, token: null, loading: true, login: async () => {}, signup: async () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = localStorage.getItem("rolesense_token");
    const u = localStorage.getItem("rolesense_user");
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setLoading(false);
  }, []);
  const save = (t: string, u: User) => { localStorage.setItem("rolesense_token", t); localStorage.setItem("rolesense_user", JSON.stringify(u)); setToken(t); setUser(u); };
  return <AuthContext.Provider value={{
    user, token, loading,
    login: async (email, password) => { const d = await api.login({ email, password }); save(d.access_token, d.user); },
    signup: async (name, email, password, company) => { const d = await api.signup({ name, email, password, company }); save(d.access_token, d.user); },
    logout: () => { localStorage.removeItem("rolesense_token"); localStorage.removeItem("rolesense_user"); setToken(null); setUser(null); },
  }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
