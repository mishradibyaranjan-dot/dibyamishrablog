import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2, ShieldAlert, ChevronLeft, ChevronRight, RefreshCw, Trash2, BellRing, Search, Gauge, Layers, X, Send,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useServerFn } from "@tanstack/react-start";
import {
  listVisitorAudit,
  getVisitorAuditAnalytics,
  updateVisitorAuditSettings,
  purgeVisitorAudit,
  runVisitorAuditSpikeCheck,
  getVisitorAuditDrilldown,
  sendVisitorAuditTestAlert,
} from "@/lib/visitor-audit.functions";

export const Route = createFileRoute("/_authenticated/admin/visitor-audit")({
  head: () => ({
    meta: [
      { title: "Visitor tracking audit — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VisitorAuditPage,
});

type Row = {
  id: string;
  outcome: string;
  reason: string | null;
  visitor_id: string | null;
  session_id: string | null;
  user_id: string | null;
  identified: boolean;
  path: string | null;
  ip_hash: string | null;
  country: string | null;
  user_agent: string | null;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
};

type Analytics = Awaited<ReturnType<typeof getVisitorAuditAnalytics>>["analytics"];
type Settings = Awaited<ReturnType<typeof getVisitorAuditAnalytics>>["settings"];
type Drilldown = Awaited<ReturnType<typeof getVisitorAuditDrilldown>>;
type DrilldownInput = {
  from?: string;
  to?: string;
  path?: string;
  country?: string;
  reason?: string;
  label: string;
};

const OUTCOMES: Record<string, { label: string; className: string }> = {
  accepted: { label: "Accepted", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", className: "bg-amber-50 text-amber-700 border-amber-200" },
  error: { label: "Error", className: "bg-red-50 text-red-700 border-red-200" },
};

const BAR_COLORS = ["#2563eb", "#0ea5e9", "#6366f1", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#f97316", "#64748b"];

const emptyFilters = {
  outcome: "all" as "all" | "accepted" | "rejected" | "error",
  identified: "all" as "all" | "yes" | "no",
  from: "",
  to: "",
  path: "",
  visitorId: "",
  userId: "",
  country: "",
  ipHash: "",
  search: "",
};

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}


function TopList({
  title,
  items,
  onSelect,
  hint,
}: {
  title: string;
  items: { label: string; count: number }[];
  onSelect?: (label: string) => void;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-slate-500">No data in this window.</p>
      ) : (
        <div className="mt-3 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                cursor={onSelect ? "pointer" : undefined}
                onClick={(d: unknown) => {
                  const label = (d as { payload?: { label?: string } })?.payload?.label;
                  if (onSelect && label) onSelect(label);
                }}
              >
                {items.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function DrilldownPanel({
  label,
  data,
  busy,
  onClose,
  onRefine,
}: {
  label: string;
  data: Drilldown | null;
  busy: boolean;
  onClose: () => void;
  onRefine: (patch: Partial<DrilldownInput>) => void;
}) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Layers className="h-4 w-4 text-blue-600" /> Drill-down — {label}
          </h3>
          {data && (
            <p className="mt-1 text-xs text-slate-600">
              {new Date(data.filter.from).toLocaleString()} → {new Date(data.filter.to).toLocaleString()}
              {data.filter.path ? ` · path ${data.filter.path}` : ""}
              {data.filter.country ? ` · country ${data.filter.country}` : ""}
              {data.filter.reason ? ` · reason ${data.filter.reason}` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {busy && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
          <Button size="sm" variant="outline" className="border-slate-300" onClick={onClose}>
            <X className="mr-1 h-3.5 w-3.5" /> Close
          </Button>
        </div>
      </div>

      {data && (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Card label="Attempts" value={data.total} />
            <Card label="Accepted" value={data.totals.accepted} />
            <Card label="Rejected" value={data.totals.rejected} />
            <Card label="Errors" value={data.totals.error} />
            <Card label="Failure rate" value={`${data.failureRate}%`} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <TopList
              title="Top reasons"
              items={data.topReasons}
              hint="Click a bar to narrow to that reason"
              onSelect={(reason) => onRefine({ reason })}
            />
            <TopList title="Top paths" items={data.topPaths} onSelect={(path) => onRefine({ path })} />
            <TopList title="Top countries" items={data.topCountries} onSelect={(country) => onRefine({ country })} />
          </div>

          <p className="mt-3 text-xs text-slate-600">
            Latency p50 {data.latency.p50 ?? "—"}ms · p90 {data.latency.p90 ?? "—"}ms · p99 {data.latency.p99 ?? "—"}ms ·{" "}
            {data.identified} signed-in · top IP hashes:{" "}
            {data.topIpHashes.length ? data.topIpHashes.map((i) => `${i.label.slice(0, 10)} (${i.count})`).join(", ") : "n/a"}
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">
              Sample events ({data.samples.length})
            </div>
            <div className="max-h-[380px] overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Outcome</th>
                    <th className="px-3 py-2">Reason</th>
                    <th className="px-3 py-2">Path</th>
                    <th className="px-3 py-2">Country</th>
                    <th className="px-3 py-2">Visitor</th>
                    <th className="px-3 py-2">ms</th>
                  </tr>
                </thead>
                <tbody>
                  {data.samples.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-slate-500">No events in this slice.</td>
                    </tr>
                  )}
                  {data.samples.map((r) => {
                    const o = OUTCOMES[r.outcome] ?? OUTCOMES.error!;
                    return (
                      <tr key={r.id} className="border-t border-slate-100">
                        <td className="whitespace-nowrap px-3 py-2 text-slate-600">{new Date(r.created_at).toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] ${o.className}`}>{o.label}</span>
                        </td>
                        <td className="px-3 py-2 text-slate-700">{r.reason ?? r.error_message ?? "—"}</td>
                        <td className="max-w-[220px] truncate px-3 py-2 text-slate-700">{r.path ?? "—"}</td>
                        <td className="px-3 py-2 text-slate-700">{r.country ?? "—"}</td>
                        <td className="max-w-[160px] truncate px-3 py-2 text-slate-500">
                          {r.identified ? (r.user_id ?? "signed-in") : (r.visitor_id ?? "anon")}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{r.duration_ms ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function VisitorAuditPage() {
  const { isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<"overview" | "events">("overview");

  const fetchAnalytics = useServerFn(getVisitorAuditAnalytics);
  const fetchRows = useServerFn(listVisitorAudit);
  const saveSettings = useServerFn(updateVisitorAuditSettings);
  const runPurge = useServerFn(purgeVisitorAudit);
  const runSpike = useServerFn(runVisitorAuditSpikeCheck);
  const fetchDrilldown = useServerFn(getVisitorAuditDrilldown);
  const sendTestAlert = useServerFn(sendVisitorAuditTestAlert);

  // ---- drill-down ----
  const [drill, setDrill] = useState<DrilldownInput | null>(null);
  const [drillData, setDrillData] = useState<Drilldown | null>(null);
  const [drillBusy, setDrillBusy] = useState(false);

  // ---- analytics ----
  const [days, setDays] = useState(14);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [aBusy, setABusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loadAnalytics = async () => {
    if (!isAdmin) return;
    setABusy(true);
    setErr(null);
    try {
      const res = await fetchAnalytics({ data: { days } });
      setAnalytics(res.analytics);
      setSettings(res.settings);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setABusy(false);
    }
  };

  // ---- events ----
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [rBusy, setRBusy] = useState(false);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const loadRows = async () => {
    if (!isAdmin) return;
    setRBusy(true);
    setErr(null);
    try {
      const res = await fetchRows({
        data: {
          page,
          pageSize,
          outcome: applied.outcome,
          identified: applied.identified,
          from: applied.from || undefined,
          to: applied.to || undefined,
          path: applied.path || undefined,
          visitorId: applied.visitorId || undefined,
          userId: applied.userId || undefined,
          country: applied.country || undefined,
          ipHash: applied.ipHash || undefined,
          search: applied.search || undefined,
        },
      });
      setRows(res.rows as Row[]);
      setTotal(res.count);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load audit events");
    } finally {
      setRBusy(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, days]);

  useEffect(() => {
    if (tab === "events") void loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, tab, page, pageSize, applied]);

  useEffect(() => {
    if (!drill || !isAdmin) return;
    let cancelled = false;
    setDrillBusy(true);
    void (async () => {
      try {
        const res = await fetchDrilldown({
          data: {
            from: drill.from,
            to: drill.to,
            path: drill.path,
            country: drill.country,
            reason: drill.reason,
            outcome: "all",
            sampleLimit: 25,
          },
        });
        if (!cancelled) setDrillData(res);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Drill-down failed");
      } finally {
        if (!cancelled) setDrillBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, drill]);

  const windowRange = () => ({
    from: new Date(Date.now() - days * 86_400_000).toISOString(),
    to: new Date().toISOString(),
  });

  const openDrill = (patch: Partial<DrilldownInput> & { label: string }) => {
    setDrillData(null);
    setDrill({ ...windowRange(), ...patch });
  };

  const refineDrill = (patch: Partial<DrilldownInput>) => {
    setDrill((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      const bits = [next.path, next.country, next.reason].filter(Boolean);
      return { ...next, label: bits.length ? bits.join(" · ") : prev.label };
    });
  };

  const latencyRows = useMemo(() => {
    const l = analytics?.latency;
    if (!l) return [];
    return [
      { label: "p50", ms: l.p50 ?? 0 },
      { label: "p75", ms: l.p75 ?? 0 },
      { label: "p90", ms: l.p90 ?? 0 },
      { label: "p95", ms: l.p95 ?? 0 },
      { label: "p99", ms: l.p99 ?? 0 },
      { label: "max", ms: l.max ?? 0 },
    ];
  }, [analytics]);

  if (loading) {
    return (
      <Section className="pt-16">
        <div className="grid min-h-[40vh] place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      </Section>
    );
  }

  if (!isAdmin) {
    return (
      <Section className="pt-16">
        <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-amber-600" />
          <h2 className="mt-3 text-lg font-semibold text-amber-900">Admin only</h2>
          <p className="mt-1 text-sm text-amber-800">You need admin access to view the visitor tracking audit.</p>
        </div>
      </Section>
    );
  }

  return (
    <Section className="pt-16">
      <SectionHeader
        as="h1"
        eyebrow="Admin"
        title="Visitor tracking audit"
        description="Analytics, alerting, retention and a searchable log of every server-side visitor tracking write attempt."
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["overview", "events"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              tab === t ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t === "overview" ? "Analytics & policy" : "Audit events"}
          </button>
        ))}
      </div>

      {err && <p className="mt-3 text-xs text-red-600">{err}</p>}
      {notice && <p className="mt-3 text-xs text-emerald-700">{notice}</p>}

      {tab === "overview" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {[1, 7, 14, 30, 60, 90].map((d) => (
                <option key={d} value={d}>Last {d} day{d > 1 ? "s" : ""}</option>
              ))}
            </select>
            <Button size="sm" variant="outline" className="border-slate-300" disabled={aBusy} onClick={() => void loadAnalytics()}>
              <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-300"
              disabled={aBusy}
              onClick={async () => {
                setNotice(null);
                try {
                  const res = await runSpike({});
                  setNotice(res.alerted ? "Spike detected — owner alert sent." : `No alert sent (${res.reason ?? "healthy"}).`);
                  await loadAnalytics();
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Spike check failed");
                }
              }}
            >
              <BellRing className="mr-1 h-3.5 w-3.5" /> Run alert check now
            </Button>
            {aBusy && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
          </div>

          {analytics && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card label="Total attempts" value={analytics.total} />
                <Card label="Accepted" value={analytics.totals.accepted} />
                <Card label="Rejected" value={analytics.totals.rejected} />
                <Card label="Errors" value={analytics.totals.error} />
                <Card label="Failure rate" value={`${analytics.failureRate}%`} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Accepted vs rejected vs errors over time</h3>
                <p className="mt-0.5 text-xs text-slate-500">Click any day to drill into that time window.</p>
                <div className="mt-3 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analytics.series}
                      onClick={(st: unknown) => {
                        const day = (st as { activeLabel?: string })?.activeLabel;
                        if (!day) return;
                        openDrill({
                          from: `${day}T00:00:00.000Z`,
                          to: `${day}T23:59:59.999Z`,
                          label: `Day ${day}`,
                        });
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="accepted" stackId="1" stroke="#10b981" fill="#a7f3d0" />
                      <Area type="monotone" dataKey="rejected" stackId="1" stroke="#f59e0b" fill="#fde68a" />
                      <Area type="monotone" dataKey="error" stackId="1" stroke="#ef4444" fill="#fecaca" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <TopList
                  title="Top paths"
                  items={analytics.topPaths}
                  hint="Click a bar to drill into that path"
                  onSelect={(path) => openDrill({ path, label: `Path ${path}` })}
                />
                <TopList
                  title="Top countries"
                  items={analytics.topCountries}
                  hint="Click a bar to drill into that country"
                  onSelect={(country) => openDrill({ country, label: `Country ${country}` })}
                />
                <TopList
                  title="Top rejection / error reasons"
                  items={analytics.topReasons}
                  hint="Click a bar to drill into that reason"
                  onSelect={(reason) => openDrill({ reason, label: `Reason ${reason}` })}
                />
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Gauge className="h-4 w-4 text-blue-600" /> Write latency percentiles (ms)
                  </h3>
                  <div className="mt-3 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={latencyRows}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="ms" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Based on {analytics.latency.count} timed writes · {analytics.identified} attempts from signed-in visitors.
                  </p>
                </div>
              </div>
            </>
          )}

          {drill && (
            <DrilldownPanel
              label={drill.label}
              data={drillData}
              busy={drillBusy}
              onClose={() => {
                setDrill(null);
                setDrillData(null);
              }}
              onRefine={refineDrill}
            />
          )}

          {settings && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Retention & alert policy</h3>
              <p className="mt-1 text-xs text-slate-500">
                Records older than the retention window are deleted automatically every 6 hours. Alerts email the owner when the
                rejected/error share crosses the threshold in the alert window, or when one IP hash floods the endpoint.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <label className="text-xs text-slate-600">
                  Retention (days)
                  <Input
                    type="number" min={1} max={365} value={settings.retention_days}
                    onChange={(e) => setSettings({ ...settings, retention_days: Number(e.target.value) })}
                    className="mt-1"
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Alert window (minutes)
                  <Input
                    type="number" min={5} max={1440} value={settings.alert_window_minutes}
                    onChange={(e) => setSettings({ ...settings, alert_window_minutes: Number(e.target.value) })}
                    className="mt-1"
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Min events to alert
                  <Input
                    type="number" min={1} max={10000} value={settings.alert_min_events}
                    onChange={(e) => setSettings({ ...settings, alert_min_events: Number(e.target.value) })}
                    className="mt-1"
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Failure threshold (%)
                  <Input
                    type="number" min={1} max={100} value={settings.alert_failure_pct}
                    onChange={(e) => setSettings({ ...settings, alert_failure_pct: Number(e.target.value) })}
                    className="mt-1"
                  />
                </label>
                <label className="flex items-center gap-2 pt-5 text-xs text-slate-600">
                  <input
                    type="checkbox" checked={settings.alerts_enabled}
                    onChange={(e) => setSettings({ ...settings, alerts_enabled: e.target.checked })}
                  />
                  Alerts enabled
                </label>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Last alert: {settings.last_alert_at ? new Date(settings.last_alert_at).toLocaleString() : "never"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    setNotice(null);
                    try {
                      await saveSettings({
                        data: {
                          retention_days: settings.retention_days,
                          alerts_enabled: settings.alerts_enabled,
                          alert_window_minutes: settings.alert_window_minutes,
                          alert_min_events: settings.alert_min_events,
                          alert_failure_pct: settings.alert_failure_pct,
                        },
                      });
                      setNotice("Policy saved.");
                    } catch (e) {
                      setErr(e instanceof Error ? e.message : "Failed to save policy");
                    }
                  }}
                >
                  Save policy
                </Button>
                <Button
                  size="sm" variant="outline" className="border-slate-300"
                  onClick={async () => {
                    setNotice(null);
                    try {
                      const res = await runPurge({ data: {} });
                      setNotice(`Cleanup complete — ${res.deleted} record(s) removed using the retention policy.`);
                      await loadAnalytics();
                    } catch (e) {
                      setErr(e instanceof Error ? e.message : "Cleanup failed");
                    }
                  }}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Clean up now (policy)
                </Button>
                <Button
                  size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={async () => {
                    setNotice(null);
                    try {
                      const res = await runPurge({ data: { olderThanDays: 7 } });
                      setNotice(`Cleanup complete — ${res.deleted} record(s) older than 7 days removed.`);
                      await loadAnalytics();
                    } catch (e) {
                      setErr(e instanceof Error ? e.message : "Cleanup failed");
                    }
                  }}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete older than 7 days
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "events" && (
        <div className="mt-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs text-slate-600">
                Outcome
                <select
                  value={filters.outcome}
                  onChange={(e) => setFilters({ ...filters, outcome: e.target.value as typeof filters.outcome })}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">All outcomes</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="error">Error</option>
                </select>
              </label>
              <label className="text-xs text-slate-600">
                Identified visitor
                <select
                  value={filters.identified}
                  onChange={(e) => setFilters({ ...filters, identified: e.target.value as typeof filters.identified })}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">Any</option>
                  <option value="yes">Signed in</option>
                  <option value="no">Anonymous</option>
                </select>
              </label>
              <label className="text-xs text-slate-600">
                From
                <Input type="datetime-local" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="mt-1" />
              </label>
              <label className="text-xs text-slate-600">
                To
                <Input type="datetime-local" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="mt-1" />
              </label>
              <label className="text-xs text-slate-600">
                Path contains
                <Input value={filters.path} onChange={(e) => setFilters({ ...filters, path: e.target.value })} placeholder="/learn" className="mt-1" />
              </label>
              <label className="text-xs text-slate-600">
                User ID
                <Input value={filters.userId} onChange={(e) => setFilters({ ...filters, userId: e.target.value })} placeholder="uuid" className="mt-1" />
              </label>
              <label className="text-xs text-slate-600">
                Country
                <Input value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })} placeholder="IN" className="mt-1" />
              </label>
              <label className="text-xs text-slate-600">
                IP hash starts with
                <Input value={filters.ipHash} onChange={(e) => setFilters({ ...filters, ipHash: e.target.value })} placeholder="a1b2c3" className="mt-1" />
              </label>
              <label className="text-xs text-slate-600">
                Visitor ID
                <Input value={filters.visitorId} onChange={(e) => setFilters({ ...filters, visitorId: e.target.value })} className="mt-1" />
              </label>
              <label className="text-xs text-slate-600 lg:col-span-2">
                Search (path, reason, visitor, IP hash, error)
                <Input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="mt-1" />
              </label>
              <label className="text-xs text-slate-600">
                Page size
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {[25, 50, 100, 200].map((n) => <option key={n} value={n}>{n} / page</option>)}
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={() => { setPage(0); setApplied(filters); }}>
                <Search className="mr-1 h-3.5 w-3.5" /> Apply filters
              </Button>
              <Button size="sm" variant="outline" className="border-slate-300" onClick={() => { setFilters(emptyFilters); setApplied(emptyFilters); setPage(0); }}>
                Reset
              </Button>
              <Button size="sm" variant="outline" className="border-slate-300" disabled={rBusy} onClick={() => void loadRows()}>
                <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
              </Button>
              <p className="ml-auto text-xs text-slate-500">{total} matching entries</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-2">When</th>
                  <th className="px-4 py-2">Outcome</th>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2">Path</th>
                  <th className="px-4 py-2">Visitor</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Country</th>
                  <th className="px-4 py-2">IP hash</th>
                  <th className="px-4 py-2">ms</th>
                  <th className="px-4 py-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && !rBusy && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-sm text-slate-500">No audit entries match these filters.</td>
                  </tr>
                )}
                {rows.map((r) => {
                  const o = OUTCOMES[r.outcome] ?? { label: r.outcome, className: "bg-slate-100 text-slate-700 border-slate-200" };
                  return (
                    <tr key={r.id} className="border-t border-slate-100 align-top">
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${o.className}`}>{o.label}</span>
                      </td>
                      <td className="px-4 py-2 text-slate-600">{r.reason ?? "—"}</td>
                      <td className="max-w-[220px] truncate px-4 py-2 text-slate-700">{r.path ?? "—"}</td>
                      <td className="px-4 py-2 font-mono text-[11px] text-slate-500">{r.visitor_id ? r.visitor_id.slice(0, 10) + "…" : "—"}</td>
                      <td className="px-4 py-2 font-mono text-[11px] text-slate-500">{r.user_id ? r.user_id.slice(0, 8) + "…" : r.identified ? "yes" : "—"}</td>
                      <td className="px-4 py-2 text-slate-600">{r.country ?? "—"}</td>
                      <td className="px-4 py-2 font-mono text-[11px] text-slate-500">{r.ip_hash ? r.ip_hash.slice(0, 8) + "…" : "—"}</td>
                      <td className="px-4 py-2 text-slate-600">{r.duration_ms ?? "—"}</td>
                      <td className="max-w-[240px] px-4 py-2 text-xs text-red-600">{r.error_message ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-end gap-1">
            <Button size="sm" variant="outline" disabled={page === 0 || rBusy} onClick={() => setPage((p) => Math.max(0, p - 1))} className="border-slate-300">
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="px-2 text-xs text-slate-600">Page {page + 1} / {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page + 1 >= totalPages || rBusy} onClick={() => setPage((p) => p + 1)} className="border-slate-300">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Section>
  );
}
