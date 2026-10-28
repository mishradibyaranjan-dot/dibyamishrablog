import { Link } from "@tanstack/react-router";
import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CAREER_LEVELS, CATEGORY_RULES } from "@/lib/jobs/rules";
import { listJobs, listJobLocations, jobFilters, type JobFilters } from "@/lib/jobs/jobs.functions";
import { nearestLocation, splitLocations } from "@/lib/jobs/locations";
import { AdvancedJobFilters } from "./AdvancedJobFilters";
import { JobCard, type PublicJob } from "./JobCard";
import { ShieldCheck } from 'lucide-react';

export const DEFAULT_FILTERS: JobFilters = jobFilters.parse({});
export const jobsQuery = (f: JobFilters) => queryOptions({ queryKey: ["jobs", f], queryFn: () => listJobs({ data: f }), staleTime: 60_000 });

const CATEGORIES = CATEGORY_RULES.map(([c]) => c);
const sel = "h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground";

export function JobsHero({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <header className="jobs-heading mb-8">
      <p className="jobs-eyebrow"><ShieldCheck className="h-4 w-4"/>VERIFIED OPPORTUNITIES / INDIA &amp; BEYOND</p>
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">{title ?? "Verified Jobs — Fresh Opportunities Posted Within the Last 7 Days"}</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
        {subtitle ?? "Discover current career opportunities from entry-level to executive leadership, with verified original sources and direct application links."}
      </p>
      <nav aria-label="Jobs sections" className="mt-5 flex flex-wrap gap-3 text-sm">
        <Link to="/jobs" activeOptions={{exact:true}} activeProps={{'aria-current':'page'}} className="text-primary underline-offset-4 hover:underline">All jobs</Link>
        <Link to="/jobs/remote" activeProps={{'aria-current':'page'}} className="text-primary underline-offset-4 hover:underline">Remote</Link>
        <Link to="/jobs/saved" className="text-primary underline-offset-4 hover:underline">Saved</Link>
        <Link to="/jobs/alerts" className="text-primary underline-offset-4 hover:underline">Alerts</Link>
        <Link to="/jobs/sources" className="text-primary underline-offset-4 hover:underline">Sources</Link>
        <Link to="/jobs/about-verification" className="text-primary underline-offset-4 hover:underline">How we verify</Link>
      </nav>
    </header>
  );
}

type JobsResult = Awaited<ReturnType<typeof listJobs>>;
export function JobsDirectory({ filters, onChange, lockedKeys = [], initial }: { filters: JobFilters; onChange: (f: JobFilters) => void; lockedKeys?: (keyof JobFilters)[]; initial?: { filters: JobFilters; data: JobsResult } }) {
  // Loader data seeds the first render so server and browser HTML match.
  const seeded = initial && JSON.stringify(initial.filters) === JSON.stringify(filters) ? initial.data : undefined;
  const { data, isFetching } = useQuery({ ...jobsQuery(filters), initialData: seeded, placeholderData: keepPreviousData });
  const [q, setQ] = useState(filters.q);
  const set = (patch: Partial<JobFilters>) => onChange({ ...filters, ...patch, page: patch.page ?? 1 });
  const show = (k: keyof JobFilters) => !lockedKeys.includes(k);
  const { data: locations } = useQuery({ queryKey: ["job-locations"], queryFn: () => listJobLocations(), staleTime: 300_000 });
  const [auto, setAuto] = useState(false);
  const split = splitLocations(locations ?? []);
  const [intl, setIntl] = useState(false);
  useEffect(() => { if (filters.city && split.international.some((l) => l.name === filters.city)) setIntl(true); }, [filters.city, locations]);
  // Once per browser session, default to the visitor's region (from their time zone) when it has openings.
  useEffect(() => {
    if (!locations?.length || filters.city || !show("city") || sessionStorage.getItem("jobs-near-me")) return;
    sessionStorage.setItem("jobs-near-me", "1");
    const near = nearestLocation(Intl.DateTimeFormat().resolvedOptions().timeZone, locations);
    if (near) { setAuto(true); set({ city: near }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="jobs-directory">
      <form role="search" className="jobs-filters grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); set({ q }); }}>
        <label className="md:col-span-2"><span className="sr-only">Search jobs</span>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, company, skill or city" />
        </label>
        {show("level") && (
          <label><span className="sr-only">Seniority</span>
            <select className={sel + " w-full"} value={filters.level} onChange={(e) => set({ level: e.target.value })}>
              <option value="">All seniority levels</option>
              {CAREER_LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
        )}
        {show("category") && (
          <label><span className="sr-only">Category</span>
            <select className={sel + " w-full"} value={filters.category} onChange={(e) => set({ category: e.target.value })}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        )}
        {show("arrangement") && (
          <label><span className="sr-only">Work arrangement</span>
            <select className={sel + " w-full"} value={filters.arrangement} onChange={(e) => set({ arrangement: e.target.value as JobFilters["arrangement"] })}>
              <option value="">Remote, hybrid or on-site</option>
              <option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option>
            </select>
          </label>
        )}
        {show("city") && (
          <div className="grid gap-1">
            <label><span className="sr-only">Location</span>
              <select className={sel + " w-full"} value={filters.city} onChange={(e) => { setAuto(false); set({ city: e.target.value }); }}>
                <option value="">All locations</option>
                {filters.city && ![...split.india, ...split.international].some((l) => l.name === filters.city) && <option value={filters.city}>{filters.city}</option>}
                <optgroup label="India">
                  {split.india.map((l) => <option key={l.name} value={l.name}>{l.name} — {l.count} job{l.count === 1 ? "" : "s"}</option>)}
                </optgroup>
                {intl && split.international.length > 0 && (
                  <optgroup label="International (by demand)">
                    {split.international.map((l) => <option key={l.name} value={l.name}>{l.name} — {l.count} job{l.count === 1 ? "" : "s"}</option>)}
                  </optgroup>
                )}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" className="h-4 w-4 accent-primary" checked={intl} onChange={(e) => setIntl(e.target.checked)} />
              Show international locations ({split.international.length})
            </label>
          </div>
        )}
        <label><span className="sr-only">Posted within</span>
          <select className={sel + " w-full"} value={filters.hours} onChange={(e) => set({ hours: Number(e.target.value) })}>
            {[1, 3, 6, 12, 24, 48, 72].map((h) => <option key={h} value={h}>Posted within {h}h</option>)}
            <option value={168}>Posted within 7 days</option>
          </select>
        </label>
        <Button type="submit">Search</Button>
        <AdvancedJobFilters filters={filters} onChange={set} />
      </form>

      {auto && filters.city && (
        <p className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span>Showing jobs near you in <strong>{filters.city}</strong>.</span>
          <Button size="sm" variant="outline" onClick={() => { setAuto(false); set({ city: "" }); }}>Show all locations</Button>
        </p>
      )}
      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {data ? `${data.total} verified job${data.total === 1 ? "" : "s"} posted in the last ${filters.hours === 168 ? "7 days" : `${filters.hours} hour${filters.hours === 1 ? "" : "s"}`}` : "Loading jobs…"}
        {isFetching && data ? " · updating…" : ""}
      </p>
      {data?.error && <p role="alert" className="mt-2 text-sm text-destructive">Jobs are temporarily unavailable. Please try again shortly.</p>}

      <div className="mt-4 grid gap-4">
        {(data?.jobs as PublicJob[] | undefined)?.map((j) => <JobCard key={j.id} job={j} />)}
        {data && data.jobs.length === 0 && !data.error && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            No verified jobs match these filters right now. Jobs only appear here for 7 days after the employer posts them.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3">
          <Button variant="outline" disabled={filters.page <= 1} onClick={() => set({ page: filters.page - 1 })}>Previous</Button>
          <span className="text-sm">Page {filters.page} of {totalPages}</span>
          <Button variant="outline" disabled={filters.page >= totalPages} onClick={() => set({ page: filters.page + 1 })}>Next</Button>
        </nav>
      )}
    </div>
  );
}
