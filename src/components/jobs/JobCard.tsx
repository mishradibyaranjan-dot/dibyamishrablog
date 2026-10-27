import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, ExternalLink, Flag, Share2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ageLabel } from "@/lib/jobs/rules";
import { reportJob } from "@/lib/jobs/jobs.functions";

export type PublicJob = {
  id: string; slug: string; title: string; company: string; location: string | null; country: string | null;
  work_arrangement: string; employment_type: string | null; categories: string[]; career_level: string;
  salary_min: number | null; salary_max: number | null; salary_currency: string | null; summary: string | null;
  source_url: string; apply_url: string; original_posted_at: string; expires_at: string; last_verified_at: string;
  verification_status: string; job_sources: { name: string; provider: string } | null;
};

const SAVED_KEY = "drm-saved-jobs";
export function readSaved(): string[] {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]"); } catch { return []; }
}
function writeSaved(v: string[]) { localStorage.setItem(SAVED_KEY, JSON.stringify(v)); }

export const fmtTime = (s: string) => new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function sourceLabel(j: PublicJob) {
  const p = j.job_sources?.provider;
  return p === "remoteok" ? "Approved provider: Remote OK" : `Official company careers (${p ?? "ATS"})`;
}

export function salaryLabel(j: PublicJob) {
  if (!j.salary_min && !j.salary_max) return null;
  const f = (n: number | null) => (n ? Math.round(n).toLocaleString() : "?");
  return `${j.salary_currency ?? ""} ${f(j.salary_min)} – ${f(j.salary_max)}`.trim();
}

export function JobActions({ job, showDetails = true }: { job: PublicJob; showDetails?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [reporting, setReporting] = useState(false);
  const report = useServerFn(reportJob);
  useEffect(() => setSaved(readSaved().includes(job.slug)), [job.slug]);
  const toggle = () => {
    const cur = readSaved();
    const next = cur.includes(job.slug) ? cur.filter((s) => s !== job.slug) : [...cur, job.slug];
    writeSaved(next); setSaved(next.includes(job.slug));
  };
  const share = async () => {
    const url = `${window.location.origin}/jobs/${job.slug}`;
    if (navigator.share) await navigator.share({ title: job.title, url }).catch(() => {});
    else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
  };
  const send = async (reason: "expired" | "suspicious" | "inaccurate" | "broken_link") => {
    try { await report({ data: { jobId: job.id, reason } }); toast.success("Thanks — we'll review this listing."); }
    catch { toast.error("Could not send report"); }
    setReporting(false);
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showDetails && <Button asChild size="sm" variant="outline"><Link to="/jobs/$slug" params={{ slug: job.slug }}>View Details</Link></Button>}
      <Button asChild size="sm">
        <a href={job.apply_url} target="_blank" rel="noopener noreferrer nofollow">Apply at Source <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden /></a>
      </Button>
      <Button size="sm" variant="ghost" onClick={toggle} aria-pressed={saved} aria-label={saved ? "Remove from saved jobs" : "Save job"}>
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}<span className="ml-1">{saved ? "Saved" : "Save Job"}</span>
      </Button>
      <Button size="sm" variant="ghost" onClick={share}><Share2 className="h-4 w-4" /><span className="ml-1">Share</span></Button>
      {reporting ? (
        <span className="flex flex-wrap gap-1" role="group" aria-label="Report reason">
          {(["expired", "suspicious", "inaccurate", "broken_link"] as const).map((r) => (
            <Button key={r} size="sm" variant="outline" onClick={() => send(r)}>{r.replace("_", " ")}</Button>
          ))}
        </span>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setReporting(true)}><Flag className="h-4 w-4" /><span className="ml-1">Report Invalid Job</span></Button>
      )}
    </div>
  );
}

export function JobCard({ job }: { job: PublicJob }) {
  const salary = salaryLabel(job);
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-semibold">
        <Link to="/jobs/$slug" params={{ slug: job.slug }} className="hover:text-primary">{job.title}</Link>
      </h3>
      <p className="text-sm text-muted-foreground">{job.company} · {job.location ?? "Location not stated"}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-muted px-2.5 py-1">{job.career_level === "unclassified" ? "Level not stated" : job.career_level}</span>
        {job.categories.slice(0, 3).map((c) => <span key={c} className="rounded-full bg-muted px-2.5 py-1">{c}</span>)}
        <span className="rounded-full bg-muted px-2.5 py-1 capitalize">{job.work_arrangement === "unspecified" ? "Arrangement not stated" : job.work_arrangement}</span>
        {salary && <span className="rounded-full bg-muted px-2.5 py-1">{salary}</span>}
      </div>
      <dl className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        <div><dt className="inline font-medium">Source: </dt><dd className="inline">{sourceLabel(job)}</dd></div>
        <div><dt className="inline font-medium">Original posted: </dt><dd className="inline">{fmtTime(job.original_posted_at)} ({ageLabel(new Date(job.original_posted_at))})</dd></div>
        <div><dt className="inline font-medium">Last checked: </dt><dd className="inline">{fmtTime(job.last_verified_at)}</dd></div>
        <div className="flex items-center gap-1 text-primary"><ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Verified</div>
      </dl>
      <div className="mt-4"><JobActions job={job} /></div>
    </article>
  );
}
