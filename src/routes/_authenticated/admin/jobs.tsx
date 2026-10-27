import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, Download } from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { adminJobsOverview, adminJobAction, adminRunSync, adminSourceUpdate, adminResolveReport, adminClassifyJobs, adminClassificationResults } from "@/lib/jobs/jobs.functions";
import { JobsMfa } from "@/components/jobs/JobsMfa";

export const Route = createFileRoute("/_authenticated/admin/jobs")({
  head: () => ({ meta: [{ title: "Verified Jobs Operations — Dibya Mishra Admin" }, { name: "description", content: "Private source health, AI classification and verified jobs operations." }, { property: "og:title", content: "Verified Jobs Operations — Dibya Mishra Admin" }, { property: "og:description", content: "Private verified jobs operations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <JobsMfa><AdminJobs /></JobsMfa>,
});

type Overview = Awaited<ReturnType<typeof adminJobsOverview>>;
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/^[=+\-@]/, "'$&")}"`;
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}

function AdminJobs() {
  const classify = useServerFn(adminClassifyJobs);
  const loadExtras = useServerFn(adminClassificationResults);
  const [extras, setExtras] = useState<Awaited<ReturnType<typeof adminClassificationResults>> | null>(null);
  const [classifying, setClassifying] = useState(false);
  const load = useServerFn(adminJobsOverview);
  const act = useServerFn(adminJobAction);
  const sync = useServerFn(adminRunSync);
  const updSource = useServerFn(adminSourceUpdate);
  const resolve = useServerFn(adminResolveReport);
  const [data, setData] = useState<Overview | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const refresh = useCallback(async () => {
    try { const [main, extra] = await Promise.all([load(), loadExtras()]); setData(main); setExtras(extra); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load"); }
  }, [load, loadExtras]);
  useEffect(() => { refresh(); }, [refresh]);

  const runSync = async () => {
    setSyncing(true);
    try {
      const r = await sync();
      const failed = r.filter((x: any) => x.status === "failed").length;
      toast.success(`Sync finished: ${r.length - failed} sources ok, ${failed} failed`);
      await refresh();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Sync failed"); }
    setSyncing(false);
  };
  const doAction = async (jobId: string, action: "quarantine" | "reject" | "republish") => {
    const note = action === "republish" ? undefined : window.prompt(`Reason to ${action}?`) ?? undefined;
    try { await act({ data: { jobId, action, note } }); toast.success(`Job ${action}d`); refresh(); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };
  const exportCsv = () => {
    if (!data) return;
    const blob = new Blob([toCsv(data.recent as any)], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `jobs-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  if (!data) return <Section><Loader2 className="h-6 w-6 animate-spin" aria-label="Loading" /></Section>;
  const s = data.stats;
  const cards: [string, number][] = [
    ["Verified live jobs", s.live], ["Added in last hour", s.lastHour], ["Expiring within 1 hour", s.expiringSoon],
    ["Expired today", s.expiredToday], ["Quarantined / rejected", s.quarantined], ["Duplicates hidden", s.duplicates],
    ["Closed by employer", s.closed], ["Open reports", s.reports],
  ];
  const sourceErrors = data.sources.filter((x) => x.last_error).length;
  const recent = statusFilter ? data.recent.filter((r) => r.verification_status === statusFilter) : data.recent;

  return (
    <Section className="pt-12">
      <SectionHeader eyebrow="Admin" title="Verified Jobs Platform" description="Sources sync every 15 minutes. Public listings are limited to 24 hours by the database itself." />
      <div className="mb-6 flex flex-wrap gap-2">
        <Button onClick={runSync} disabled={syncing}>{syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}Sync all sources now</Button>
        <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
        <Button variant="outline" onClick={async () => {
          if (!data) return;
          try {
            const { default: ExcelJS } = await import("exceljs");
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Jobs");
            const keys = Object.keys(data.recent[0] ?? {});
            sheet.columns = keys.map((key) => ({ header: key, key, width: 24 }));
            data.recent.forEach((row) => sheet.addRow(Object.fromEntries(keys.map((key) => [key, String((row as Record<string, unknown>)[key] ?? "")]))));
            const buffer = await workbook.xlsx.writeBuffer();
            const url = URL.createObjectURL(new Blob([new Uint8Array(buffer)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
            const a = document.createElement("a"); a.href = url; a.download = "verified-jobs.xlsx"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
          } catch { toast.error("Could not export Excel workbook"); }
        }}><Download className="mr-2 h-4 w-4" />Export Excel</Button>
        <Button variant="outline" disabled={classifying} onClick={async () => { setClassifying(true); try { const r = await classify(); if (r.error) toast.error(r.error); else toast.success(`${r.completed} jobs classified`); await refresh(); } catch (e) { toast.error(e instanceof Error ? e.message : "Classification failed"); } finally { setClassifying(false); } }}>{classifying ? "Classifying…" : "Classify pending jobs"}</Button>
        <Button variant="ghost" onClick={refresh}>Refresh</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{k}</p><p className="mt-1 font-display text-3xl font-bold">{v}</p></div>
        ))}
        <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Source errors</p><p className="mt-1 font-display text-3xl font-bold">{sourceErrors}</p></div>
      </div>

      <h2 className="mt-12 font-display text-2xl font-semibold">AI classification</h2>
      <ul className="mt-4 space-y-3 text-sm">{extras?.classifications.map((c) => <li key={c.job_id} className="border-b border-border pb-3"><strong>{c.jobs?.title}</strong> · {c.status}<p className="text-muted-foreground">{c.error ?? JSON.stringify(c.result)}</p></li>)}{extras?.classifications.length === 0 && <li>No classifications yet.</li>}</ul>
      <h2 className="mt-12 font-display text-2xl font-semibold">Page speed · last 7 days</h2>
      <div className="mt-4 flex flex-wrap gap-6">{["LCP", "INP", "CLS"].map((metric) => { const samples = extras?.vitals.filter((v) => v.metric === metric).map((v) => v.value).sort((a,b) => a-b) ?? []; const p75 = samples[Math.max(0, Math.ceil(samples.length * .75) - 1)]; return <div key={metric}><h3 className="font-semibold">{metric}</h3><p>{p75 === undefined ? "No consented measurements yet" : `${p75.toFixed(metric === "CLS" ? 3 : 0)}${metric === "CLS" ? "" : " ms"} · p75 · ${samples.length} samples`}</p></div>; })}</div>
      <h2 className="mt-12 font-display text-2xl font-semibold">Sources</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase"><tr><th className="p-3">Source</th><th className="p-3">Status</th><th className="p-3">Interval</th><th className="p-3">Last sync</th><th className="p-3">Last error</th><th className="p-3">Active</th></tr></thead>
          <tbody>
            {data.sources.map((src) => (
              <tr key={src.id} className="border-t border-border">
                <td className="p-3 font-medium">{src.name} <span className="text-muted-foreground">({src.provider})</span></td>
                <td className="p-3">{src.status}</td>
                <td className="p-3">
                  {src.provider === "partner" ? "—" : (
                    <select aria-label={`Polling interval for ${src.name}`} className="rounded border border-input bg-background px-2 py-1" value={src.poll_minutes}
                      onChange={async (e) => { await updSource({ data: { id: src.id, poll_minutes: Number(e.target.value) } }); refresh(); }}>
                      {[15, 30, 60, 360, 1440].map((m) => <option key={m} value={m}>{m} min</option>)}
                    </select>
                  )}
                </td>
                <td className="p-3">{fmt(src.last_synced_at)}</td>
                <td className="p-3 text-destructive">{src.last_error ?? ""}</td>
                <td className="p-3"><input type="checkbox" aria-label={`Enable ${src.name}`} checked={src.active} onChange={async (e) => { await updSource({ data: { id: src.id, active: e.target.checked } }); refresh(); }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 font-display text-2xl font-semibold">Open reports</h2>
      <ul className="mt-4 space-y-2">
        {data.reported.length === 0 && <li className="text-muted-foreground">No open reports.</li>}
        {data.reported.map((r: any) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm">
            <span><strong>{r.reason}</strong> — {r.jobs?.title} at {r.jobs?.company} · {fmt(r.created_at)}</span>
            <Button size="sm" variant="outline" onClick={async () => { await resolve({ data: { id: r.id } }); refresh(); }}>Resolve</Button>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">Recent jobs</h2>
        <select aria-label="Filter by verification status" className="rounded border border-input bg-background px-2 py-1 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option><option>VERIFIED</option><option>QUARANTINED</option><option>REJECTED</option>
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase"><tr><th className="p-3">Job</th><th className="p-3">Level</th><th className="p-3">Posted</th><th className="p-3">Status</th><th className="p-3">Notes</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {recent.map((j) => (
              <tr key={j.id} className="border-t border-border align-top">
                <td className="p-3"><div className="font-medium">{j.title}</div><div className="text-muted-foreground">{j.company} · {j.country ?? "—"}</div></td>
                <td className="p-3">{j.career_level}</td>
                <td className="p-3">{fmt(j.original_posted_at)}</td>
                <td className="p-3">{j.verification_status} / {j.application_status}{j.is_primary ? "" : " / duplicate"}</td>
                <td className="p-3 text-muted-foreground">{j.verification_notes}</td>
                <td className="p-3"><div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="outline" onClick={() => doAction(j.id, "quarantine")}>Quarantine</Button>
                  <Button size="sm" variant="outline" onClick={() => doAction(j.id, "reject")}>Reject</Button>
                  <Button size="sm" variant="outline" onClick={() => doAction(j.id, "republish")}>Republish</Button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 font-display text-2xl font-semibold">Sync runs</h2>
      <ul className="mt-4 space-y-1 text-sm">
        {data.runs.map((r: any) => (
          <li key={r.id} className={r.status === "failed" ? "text-destructive" : ""}>
            {fmt(r.started_at)} · {r.job_sources?.name} · {r.status} · fetched {r.fetched}, accepted {r.accepted}, rejected {r.rejected}, closed {r.closed}{r.error ? ` · ${r.error}` : ""}
          </li>
        ))}
      </ul>
    </Section>
  );
}
