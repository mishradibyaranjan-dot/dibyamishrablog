import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Users,
  Activity,
  Clock,
  MessageSquare,
  Download,
  ShieldAlert,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { NewsletterAdminPanel } from "@/components/admin/NewsletterAdminPanel";
import { getReports, type ReportsPayload } from "@/lib/reports.functions";
import { useServerFn } from "@tanstack/react-start";
import { RequireAdmin } from "@/components/auth/RequireAdmin";


export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics — Dibya Mishra Admin" },
      { name: "description", content: "Private site analytics, activity reporting and authorized exports." },
      { property: "og:title", content: "Reports & Analytics — Dibya Mishra Admin" },
      { property: "og:description", content: "Private site analytics and authorized reporting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAdmin>
      <Reports />
    </RequireAdmin>
  ),
});


type Counts = {
  totalUsers: number;
  active24: number;
  active7d: number;
  active30d: number;
  totalChats: number;
  avgSession: number;
};

function Reports() {
  const { isAdmin, loading } = useAuth();
  const [days, setDays] = useState(7);
  const [payload, setPayload] = useState<ReportsPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fetchReports = useServerFn(getReports);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setErr(null);
    setPayload(null);
    (async () => {
      try {
        const res = await fetchReports({ data: { days } });
        if (!cancelled) setPayload(res);
      } catch (e) {
        if (!cancelled) setErr((e as Error).message ?? String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, days, fetchReports]);

  const counts = payload?.counts ?? null;
  const series = payload?.series ?? [];
  const topPages = payload?.topPages ?? [];
  const topTabs = payload?.topTabs ?? [];
  const topQuestions = payload?.topQuestions ?? [];


  const exportCsv = useMemo(
    () => () => {
      const rows = [
        ["metric", "value"],
        ["total_users", counts?.totalUsers ?? 0],
        ["active_24h", counts?.active24 ?? 0],
        ["active_7d", counts?.active7d ?? 0],
        ["active_30d", counts?.active30d ?? 0],
        ["total_chat_questions", counts?.totalChats ?? 0],
        ["avg_session_seconds", counts?.avgSession ?? 0],
        [],
        ["top_pages_path", "count"],
        ...topPages.map((p) => [p.path, p.count]),
        [],
        ["top_tabs", "count"],
        ...topTabs.map((p) => [p.name, p.count]),
        [],
        ["top_questions", "count"],
        ...topQuestions.map((p) => [p.q, p.count]),
      ];
      const csv = rows.map((r) => r.map((c) => { let v = String(c); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return `"${v.replace(/"/g, '""')}"`; }).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [counts, topPages, topTabs, topQuestions],
  );

  if (loading) {
    return (
      <Section className="pt-24">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-muted" />
      </Section>
    );
  }

  if (!isAdmin) {
    return (
      <Section className="pt-20">
        <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-warning" />
          <h2 className="mt-4 font-display text-2xl font-bold text-foreground">Admins only</h2>
          <p className="mt-2 text-sm text-muted-foreground">You don't have access to this page.</p>
        </div>
      </Section>
    );
  }

  return (
    <Section className="reports-workspace pb-12 pt-16 lg:pt-24"><nav aria-label="Administration workspace" className="workspace-navigation"><Button variant="secondary" asChild><Link to="/reports" aria-current="page">Analytics</Link></Button><Button variant="ghost" asChild><Link to="/admin/contact-enquiries">Enquiries</Link></Button><Button variant="ghost" asChild><Link to="/admin/security-events">Security</Link></Button><Button variant="ghost" asChild><Link to="/admin/docs">Documentation</Link></Button></nav>
      <SectionHeader
        as="h1"
        eyebrow="Admin"
        title="Reports & Analytics"
        description="Activity across the site — users, sessions, page visits, learning tabs, and chatbot questions."
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((d) => (
            <Button variant="outline" size="sm"
              aria-pressed={days === d}
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                days === d
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              Last {d}d
            </Button>
          ))}
        </div>
        <Button onClick={exportCsv} variant="outline" size="sm" className="border-border bg-card text-foreground hover:bg-muted">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {err && (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          Failed to load reports: {err}
        </div>
      )}
      {!payload && !err && (
        <div className="mt-4 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
          Loading analytics…
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<Users />} label="Total users" value={counts?.totalUsers ?? "—"} />
        <Kpi icon={<Activity />} label="Active (24h)" value={counts?.active24 ?? "—"} />
        <Kpi
          icon={<Activity />}
          label={`Active (${days <= 7 ? 7 : 30}d)`}
          value={(days <= 7 ? counts?.active7d : counts?.active30d) ?? "—"}
        />
        <Kpi icon={<Clock />} label="Avg session (s)" value={counts?.avgSession ?? "—"} />
      </div>


      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Daily page visits" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                <Line type="monotone" dataKey="visits" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3, fill: "var(--primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Most visited pages" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPages} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="path" stroke="var(--muted-foreground)" fontSize={10} width={140} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                <Bar dataKey="count" fill="var(--brand-2)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Most accessed Learn tabs" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTabs} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={10} width={180} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                <Bar dataKey="count" fill="var(--info)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Top chatbot questions" icon={<MessageSquare className="h-4 w-4" />}>
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-2 text-sm text-foreground">
            {topQuestions.length === 0 && <li className="text-muted-foreground">No data yet.</li>}
            {topQuestions.map((q) => (
              <li key={q.q} className="flex justify-between gap-2 border-b border-border pb-1.5">
                <span className="truncate">{q.q}</span>
                <span className="shrink-0 text-muted-foreground">×{q.count}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-8">
        <TrafficAnalyticsPanel days={days} traffic={payload?.traffic ?? null} />
      </div>

      <div className="mt-8">
        <IdentifiedVisitorsPanel days={days} rowsData={payload?.visitors ?? null} />
      </div>


      <div className="mt-6">
        <NewsletterAdminPanel />
      </div>

      <div className="mt-6">
        <DataExportPanel />
      </div>
    </Section>
  );
}

// ------------------- Traffic Analytics -------------------

const PIE_COLORS = ["var(--primary)", "var(--brand-2)", "var(--info)", "var(--warning)", "var(--danger)", "var(--success)", "var(--special)", "var(--muted-foreground)"];

function hostFromReferrer(ref: string | null): string {
  if (!ref) return "Direct";
  try {
    const u = new URL(ref);
    if (typeof window !== "undefined" && u.hostname === window.location.hostname) return "Direct";
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

function TrafficAnalyticsPanel({
  days,
  traffic,
}: {
  days: number;
  traffic: ReportsPayload["traffic"] | null;
}) {
  if (!traffic) {
    return (
      <Panel title="Traffic analytics" icon={<BarChart3 className="h-4 w-4" />}>
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      </Panel>
    );
  }
  const stats = traffic;


  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Traffic"
        title="Site visitor analytics"
        description={`Visitors, pageviews, top pages, sources, countries and devices over the last ${days} days.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<Users />} label="Unique visitors" value={stats.uniqueVisitors} />
        <Kpi icon={<Activity />} label="Pageviews" value={stats.pageviews} />
        <Kpi icon={<Activity />} label="Sessions" value={stats.uniqueSessions} />
        <Kpi icon={<Clock />} label="Pages / visit" value={stats.pvPerVisit} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Daily visitors & pageviews" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.daily} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="visitors" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="pageviews" stroke="var(--brand-2)" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Top pages" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topPages} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="label" stroke="var(--muted-foreground)" fontSize={10} width={140} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Top traffic sources" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topSources} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="label" stroke="var(--muted-foreground)" fontSize={10} width={160} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                <Bar dataKey="value" fill="var(--brand-2)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Top countries" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topCountries} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                <Bar dataKey="value" fill="var(--info)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Devices" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.devices} dataKey="value" nameKey="label" outerRadius={90} label>
                  {stats.devices.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Browsers" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.browsers} dataKey="value" nameKey="label" outerRadius={90} label>
                  {stats.browsers.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}

const EXPORT_TABLES = [
  "profiles",
  "user_roles",
  "login_sessions",
  "user_activity",
  "page_visits",
  "tab_access",
  "search_queries",
  "chatbot_messages",
  "resource_access",
  "failed_login_attempts",
] as const;

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const cols = Array.from(
    rows.reduce((s, r) => {
      Object.keys(r).forEach((k) => s.add(k));
      return s;
    }, new Set<string>()),
  );
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    let s = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

function downloadBlob(content: string, filename: string, type = "text/csv") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function fetchAll(table: string) {
  const pageSize = 1000;
  let from = 0;
  const all: Record<string, unknown>[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase
      .from(table as never)
      .select("*")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...(data as Record<string, unknown>[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

function DataExportPanel() {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const exportOne = async (table: string) => {
    setErr(null);
    setBusy(table);
    try {
      const rows = await fetchAll(table);
      const csv = toCsv(rows);
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(csv || "(empty)\n", `${table}-${stamp}.csv`);
    } catch (e) {
      setErr(`${table}: ${(e as Error).message ?? String(e)}`);
    } finally {
      setBusy(null);
    }
  };

  const exportAll = async () => {
    setErr(null);
    setBusy("__all__");
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      const bundle: Record<string, unknown> = { exported_at: new Date().toISOString(), tables: {} };
      for (const t of EXPORT_TABLES) {
        try {
          (bundle.tables as Record<string, unknown>)[t] = await fetchAll(t);
        } catch (e) {
          (bundle.tables as Record<string, unknown>)[t] = { error: (e as Error).message ?? String(e) };
        }
      }
      downloadBlob(JSON.stringify(bundle, null, 2), `database-export-${stamp}.json`, "application/json");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Panel title="One-click database export" icon={<Download className="h-4 w-4" />}>
      <p className="mb-3 text-xs text-muted-foreground">
        Exports run under your admin session (RLS-scoped). No credentials or service keys needed.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          onClick={exportAll}
          disabled={busy !== null}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Download className="mr-2 h-4 w-4" />
          {busy === "__all__" ? "Exporting all…" : "Export ALL tables (JSON)"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {EXPORT_TABLES.map((t) => (
          <Button
            key={t}
            onClick={() => exportOne(t)}
            disabled={busy !== null}
            variant="outline"
            size="sm"
            className="justify-start border-border bg-card text-foreground hover:bg-muted"
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            {busy === t ? "…" : t}
          </Button>
        ))}
      </div>
      {err && <p className="mt-3 text-xs text-destructive">{err}</p>}
    </Panel>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="report-metric rounded-lg border border-border bg-card p-5 shadow-card-soft">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-widest">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-primary">{icon}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="report-panel rounded-lg border border-border bg-card p-5 shadow-card-soft">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

// ------------------- Identified Visitors -------------------

type VisitorRow = {
  visitor_id: string;
  user_id: string | null;
  email: string | null;
  display_name: string | null;
  last_country: string | null;
  last_city: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  total_visits: number;
  total_pageviews: number;
  first_seen_at: string;
  last_seen_at: string;
  identified_at: string | null;
  first_referrer: string | null;
  first_utm_source: string | null;
};

function IdentifiedVisitorsPanel({
  days,
  rowsData,
}: {
  days: number;
  rowsData: VisitorRow[] | null;
}) {
  const rows = rowsData;
  const err: string | null = null;
  const [query, setQuery] = useState("");
  const [onlyIdentified, setOnlyIdentified] = useState(false);
  void days;


  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (onlyIdentified && !r.user_id) return false;
      if (!q) return true;
      return (
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.display_name ?? "").toLowerCase().includes(q) ||
        (r.last_country ?? "").toLowerCase().includes(q) ||
        (r.last_city ?? "").toLowerCase().includes(q) ||
        r.visitor_id.toLowerCase().includes(q)
      );
    });
  }, [rows, query, onlyIdentified]);

  const kpis = useMemo(() => {
    if (!rows) return null;
    const identified = rows.filter((r) => r.user_id).length;
    const anon = rows.length - identified;
    const totalVisits = rows.reduce((s, r) => s + (r.total_visits ?? 0), 0);
    const totalPv = rows.reduce((s, r) => s + (r.total_pageviews ?? 0), 0);
    return { identified, anon, totalVisits, totalPv, unique: rows.length };
  }, [rows]);

  const exportCsv = () => {
    const cols = [
      "visitor_id", "user_id", "email", "display_name", "last_country", "last_city",
      "device", "browser", "os", "total_visits", "total_pageviews",
      "first_seen_at", "last_seen_at", "identified_at", "first_referrer", "first_utm_source",
    ];
    const esc = (v: unknown) => { let s = String(v ?? ""); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
    const csv = [
      cols.join(","),
      ...filtered.map((r) => cols.map((c) => esc((r as Record<string, unknown>)[c])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitors-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="People"
        title="Visitors & identified users"
        description={`Unique browsers seen in the last ${days} days, with sign-in identity when available.`}
      />

      {err && (
        <Panel title="Visitors" icon={<Users className="h-4 w-4" />}>
          <p className="text-sm text-destructive">Failed to load: {err}</p>
        </Panel>
      )}

      {!err && !rows && <div className="h-24 animate-pulse rounded-2xl bg-muted" />}

      {kpis && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={<Users />} label="Unique visitors" value={kpis.unique} />
          <Kpi icon={<Users />} label="Identified (signed-in)" value={kpis.identified} />
          <Kpi icon={<Users />} label="Anonymous" value={kpis.anon} />
          <Kpi icon={<Activity />} label="Total pageviews" value={kpis.totalPv} />
        </div>
      )}

      {rows && (
        <div className="report-panel rounded-lg border border-border bg-card p-5 shadow-card-soft">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search visitors"
              placeholder="Search by email, name, country, city, visitor id"
              className="w-full max-w-sm rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={onlyIdentified} onChange={(e) => setOnlyIdentified(e.target.checked)} />
              Only identified
            </label>
            <div className="ml-auto text-xs text-muted-foreground">
              Showing {filtered.length} of {rows.length}
            </div>
            <Button onClick={exportCsv} variant="outline" size="sm" className="border-border bg-card text-foreground hover:bg-muted">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>

          <div className="max-h-[560px] overflow-auto rounded-lg border border-border">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="sticky top-0 bg-muted text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">User</th>
                  <th className="px-3 py-2 font-semibold">Location</th>
                  <th className="px-3 py-2 font-semibold">Device</th>
                  <th className="px-3 py-2 font-semibold">Source</th>
                  <th className="px-3 py-2 text-right font-semibold">Visits</th>
                  <th className="px-3 py-2 text-right font-semibold">Pageviews</th>
                  <th className="px-3 py-2 font-semibold">First seen</th>
                  <th className="px-3 py-2 font-semibold">Last seen</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {filtered.map((r) => {
                  const primary = r.display_name || r.email || (r.user_id ? "Signed-in user" : "Anonymous");
                  const secondary = r.email && r.display_name ? r.email : `${r.visitor_id.slice(0, 10)}…`;
                  const loc = [r.last_city, r.last_country].filter(Boolean).join(", ") || "—";
                  const dev = [r.device, r.browser, r.os].filter(Boolean).join(" · ") || "—";
                  const src = r.first_utm_source || (r.first_referrer ? hostFromReferrer(r.first_referrer) : "Direct");
                  return (
                    <tr key={r.visitor_id} className="border-t border-border hover:bg-muted/60">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${r.user_id ? "bg-success" : "bg-muted-foreground"}`} />
                          <div>
                            <div className="font-medium text-foreground">{primary}</div>
                            <div className="text-[11px] text-muted-foreground">{secondary}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">{loc}</td>
                      <td className="px-3 py-2">{dev}</td>
                      <td className="px-3 py-2">{src}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.total_visits}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.total_pageviews}</td>
                      <td className="px-3 py-2 text-muted-foreground">{new Date(r.first_seen_at).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-muted-foreground">{new Date(r.last_seen_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">No visitors match your filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
