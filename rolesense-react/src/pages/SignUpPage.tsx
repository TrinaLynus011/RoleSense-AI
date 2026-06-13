import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { Search } from "lucide-react";

export function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await signup(name, email, password, company); nav("/search"); } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4"><Search className="h-5 w-5 text-white" /></div>
          <h1 className="text-xl font-bold">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start ranking candidates instantly</p>
        </div>
        <Card><CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</div>}
            <div><label className="text-xs font-medium mb-1 block">Full Name</label><Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required /></div>
            <div><label className="text-xs font-medium mb-1 block">Work Email</label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required /></div>
            <div><label className="text-xs font-medium mb-1 block">Password</label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} /></div>
            <div><label className="text-xs font-medium mb-1 block">Company <span className="text-muted-foreground">(optional)</span></label><Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Inc." /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-4">Already have an account? <Link to="/signin" className="text-primary hover:underline">Sign in</Link></p>
        </CardContent></Card>
      </motion.div>
    </div>
  );
}
