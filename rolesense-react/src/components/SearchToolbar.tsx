import { useState, useEffect } from "react";
import { Search, MapPin, Wrench, Briefcase, Globe } from "lucide-react";
import { Button, Input, Switch } from "@/components/ui";
import { api } from "@/lib/api";
import type { SearchFilters } from "@/lib/types";
import { DEMO_TEMPLATES } from "@/data/presets";

interface Props { onSearch: (f: SearchFilters) => void; loading?: boolean; initial?: Partial<SearchFilters> }

export function SearchToolbar({ onSearch, loading, initial }: Props) {
  const [jd, setJd] = useState(initial?.job_description || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [skills, setSkills] = useState(initial?.skills || "");
  const [minExp, setMinExp] = useState(initial?.min_experience?.toString() || "");
  const [remote, setRemote] = useState(initial?.remote || false);
  const [topN, setTopN] = useState("20");
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => { api.getLocations().then((d: any) => setLocations(d.locations || d)).catch(() => {}); }, []);

  const handleSearch = () => onSearch({ job_description: jd, location, skills, min_experience: minExp ? Number(minExp) : null, remote, top_n: Number(topN) });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {DEMO_TEMPLATES.map(p => <button key={p.label} onClick={() => { setJd(p.jd); setSkills(p.skills); setLocation(p.location); setMinExp(String(p.experience)); }} className="px-2.5 py-1 text-xs font-medium rounded-lg border border-input bg-background hover:bg-secondary hover:border-primary/30 transition-all text-muted-foreground hover:text-foreground">{p.label}</button>)}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste a job description..." className="w-full min-h-[40px] rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" rows={1} />
        </div>
        <Button onClick={handleSearch} disabled={loading || !jd.trim()} className="shrink-0">{loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Find Candidates"}</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <select value={location} onChange={e => setLocation(e.target.value)} className="h-8 rounded-lg border border-input bg-background px-2 text-xs">
            <option value="">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wrench className="h-3 w-3" />
          <Input placeholder="Skills" value={skills} onChange={e => setSkills(e.target.value)} className="h-8 text-xs w-28" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Briefcase className="h-3 w-3" />
          <Input type="number" placeholder="Min Exp" value={minExp} onChange={e => setMinExp(e.target.value)} className="h-8 text-xs w-16" min={0} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Globe className="h-3 w-3" />
          <span>Remote</span>
          <Switch checked={remote} onCheckedChange={setRemote} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
          <span>Show</span>
          <select value={topN} onChange={e => setTopN(e.target.value)} className="h-8 rounded-lg border border-input bg-background px-2 text-xs"><option value="10">10</option><option value="20">20</option><option value="50">50</option><option value="100">100</option></select>
        </div>
      </div>
    </div>
  );
}
