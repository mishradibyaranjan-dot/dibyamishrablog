import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { CAREER_LEVELS, CATEGORY_RULES } from "@/lib/jobs/rules";
import { jobFilters, listJobs } from "@/lib/jobs/jobs.functions";
import { personalJobs, saveJobSearch, removeJobSearch } from "@/lib/jobs/personal.functions";
import { JobCard } from "./JobCard";
import { AdvancedJobFilters } from "./AdvancedJobFilters";
import type { JobFilters } from "@/lib/jobs/jobs.functions";

const inputClass = "w-full rounded border border-input bg-background px-3 py-2 text-foreground";

function Matches({ filters }: { filters: unknown }) {
  const parsed = jobFilters.safeParse(filters);
  const load = useServerFn(listJobs);
  const { data, isPending, error } = useQuery({ queryKey: ["job-matches", filters], queryFn: () => load({ data: parsed.success ? parsed.data : jobFilters.parse({}) }), enabled: parsed.success, refetchInterval: 60_000 });
  if (!parsed.success) return <p>Search preferences need updating.</p>;
  if (isPending) return <p role="status">Checking current matches…</p>;
  if (error || data?.error) return <p role="alert">Matches could not be loaded. Please try again.</p>;
  return <div className="mt-4 space-y-3"><p className="text-sm text-muted-foreground">{data?.total ?? 0} current matches</p>{data?.jobs.slice(0, 5).map((job) => <JobCard key={job.id} job={job} />)}<Button asChild variant="outline"><Link to="/jobs" search={{ ...parsed.data, page: 1 }}>View matching jobs</Link></Button></div>;
}

export function JobSearches() {
  const { user, loading } = useAuth();
  const load = useServerFn(personalJobs);
  const save = useServerFn(saveJobSearch);
  const remove = useServerFn(removeJobSearch);
  const cache = useQueryClient();
  const { data, isPending, error } = useQuery({ queryKey: ["personal-jobs", user?.id], queryFn: () => load(), enabled: Boolean(user) });
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [company, setCompany] = useState("");
  const [arrangement, setArrangement] = useState<"" | "remote" | "hybrid" | "onsite">("");
  const [advanced, setAdvanced] = useState<JobFilters>(() => jobFilters.parse({}));
  const refresh = () => cache.invalidateQueries({ queryKey: ["personal-jobs"] });
  if (loading) return <p role="status">Loading account…</p>;
  if (!user) return <Button asChild><Link to="/auth" search={{ mode: "login", redirect: "/jobs/alerts" }}>Sign in to save searches</Link></Button>;
  return <div className="space-y-8">
    <form className="max-w-3xl space-y-4" onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await save({ data: { name, enabled: true, filters: jobFilters.parse({ ...advanced, q, level, category, country, company: advanced.company || company, arrangement }) } }); setName(""); await refresh(); toast.success("Search saved"); } catch (e) { toast.error(e instanceof Error ? e.message : "Could not save"); } finally { setBusy(false); } }}>
      <h2 className="font-display text-2xl font-semibold">New saved search</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">Search name<input className={inputClass} required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="space-y-1">Job title or keyword<input className={inputClass} maxLength={120} value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <label className="space-y-1">Career level<select className={inputClass} value={level} onChange={(e) => setLevel(e.target.value)}><option value="">Any level</option>{CAREER_LEVELS.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="space-y-1">Category<select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Any category</option>{CATEGORY_RULES.map(([s]) => <option key={s}>{s}</option>)}</select></label>
        <label className="space-y-1">Country<input className={inputClass} value={country} maxLength={60} onChange={(e) => setCountry(e.target.value)} /></label>
        <label className="space-y-1">Employer<input className={inputClass} value={company} maxLength={80} onChange={(e) => setCompany(e.target.value)} /></label>
        <label className="space-y-1">Work arrangement<select className={inputClass} value={arrangement} onChange={(e) => setArrangement(e.target.value as typeof arrangement)}><option value="">Any arrangement</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></label>
      </div>
      <AdvancedJobFilters filters={advanced} onChange={(patch) => setAdvanced((f) => ({ ...f, ...patch }))} />
      <Button type="submit" disabled={busy}><Bell className="mr-2 h-4 w-4" />{busy ? "Saving…" : "Save search"}</Button>
    </form>
    <section className="space-y-6"><h2 className="font-display text-2xl font-semibold">Your matching alerts</h2>
      {isPending ? <p role="status">Loading searches…</p> : error ? <p role="alert">Could not load your searches.</p> : data?.searches.length === 0 ? <p className="text-muted-foreground">No saved searches yet.</p> : data?.searches.map((s) => <section key={s.id} className="border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-display text-xl font-semibold">{s.name}</h3><div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.enabled} onChange={async (e) => { try { await save({ data: { name: s.name, filters: jobFilters.parse(s.filters), enabled: e.target.checked } }); await refresh(); } catch { toast.error("Could not update alerts"); } }} />Show matches</label>
          <Button size="icon" variant="ghost" aria-label={`Delete ${s.name}`} onClick={async () => { try { await remove({ data: { id: s.id } }); await refresh(); } catch { toast.error("Could not delete search"); } }}><Trash2 className="h-4 w-4" /></Button>
        </div></div>{s.enabled && <Matches filters={s.filters} />}
      </section>)}
    </section>
  </div>;
}