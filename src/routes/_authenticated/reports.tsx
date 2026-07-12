import { createFileRoute } from "@tanstack/react-router";
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
} from "recharts";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Admin Reports" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reports,
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
  const [counts, setCounts] = useState<Counts | null>(null);
  const [series, setSeries] = useState<{ day: string; visits: number }[]>([]);
  const [topPages, setTopPages] = useState<{ path: string; count: number }[]>([]);
  const [topTabs, setTopTabs] = useState<{ name: string; count: number }[]>([]);
  const [topQuestions, setTopQuestions] = useState<{ q: string; count: number }[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, days]);

  async function load() {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const t24 = new Date(Date.now() - 86400000).toISOString();
    const t7 = new Date(Date.now() - 7 * 86400000).toISOString();
    const t30 = new Date(Date.now() - 30 * 86400000).toISOString();

    const [usersR, act24R, act7R, act30R, chatsR, sessR, visitsR, tabsR, qR] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("login_sessions").select("user_id").gte("started_at", t24).limit(5000),
      supabase.from("login_sessions").select("user_id").gte("started_at", t7).limit(5000),
      supabase.from("login_sessions").select("user_id").gte("started_at", t30).limit(5000),
      supabase.from("chatbot_messages").select("id", { count: "exact", head: true }).eq("role", "user"),
      supabase.from("login_sessions").select("started_at, ended_at, duration_seconds").gte("started_at", since).limit(5000),
      supabase.from("page_visits").select("path, visited_at").gte("visited_at", since).limit(5000),
      supabase.from("tab_access").select("page, tab_id, opened_at").gte("opened_at", since).limit(5000),
      supabase.from("chatbot_messages").select("content").eq("role", "user").gte("created_at", since).limit(2000),
    ]);

    const distinct = (rows: { user_id: string }[] | null) =>
      rows ? new Set(rows.map((r) => r.user_id)).size : 0;

    // Compute avg session: prefer duration_seconds; else ended_at - started_at; else now - started_at (still active, capped 1h)
    const now = Date.now();
    const durations = (sessR.data ?? []).map((r) => {
      if (r.duration_seconds != null) return r.duration_seconds;
      const start = new Date(r.started_at as string).getTime();
      const end = r.ended_at ? new Date(r.ended_at as string).getTime() : now;
      return Math.max(1, Math.min(3600, Math.round((end - start) / 1000)));
    });
    const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

    setCounts({
      totalUsers: usersR.count ?? 0,
      active24: distinct(act24R.data as any),
      active7d: distinct(act7R.data as any),
      active30d: distinct(act30R.data as any),
      totalChats: chatsR.count ?? 0,
      avgSession: avg,
    });

    // Daily series
    const buckets = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      buckets.set(d, 0);
    }
    visitsR.data?.forEach((v) => {
      const d = (v.visited_at as string).slice(0, 10);
      buckets.set(d, (buckets.get(d) ?? 0) + 1);
    });
    setSeries(Array.from(buckets.entries()).map(([day, visits]) => ({ day: day.slice(5), visits })));

    // Top pages
    const pageMap = new Map<string, number>();
    visitsR.data?.forEach((v) => pageMap.set(v.path as string, (pageMap.get(v.path as string) ?? 0) + 1));
    setTopPages(
      Array.from(pageMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([path, count]) => ({ path, count })),
    );

    // Top tabs
    const tabMap = new Map<string, number>();
    tabsR.data?.forEach((t) => {
      const k = `${t.page}#${t.tab_id}`;
      tabMap.set(k, (tabMap.get(k) ?? 0) + 1);
    });
    setTopTabs(
      Array.from(tabMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count })),
    );

    // Top questions
    const qMap = new Map<string, number>();
    qR.data?.forEach((row) => {
      const norm = (row.content as string).toLowerCase().trim().slice(0, 80);
      if (norm.length < 4) return;
      qMap.set(norm, (qMap.get(norm) ?? 0) + 1);
    });
    setTopQuestions(
      Array.from(qMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([q, count]) => ({ q, count })),
    );
  }

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
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
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
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-white/10" />
      </Section>
    );
  }

  if (!isAdmin) {
    return (
      <Section className="pt-20">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-glow backdrop-blur-xl">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-400" />
          <h2 className="mt-4 font-display text-2xl font-bold text-white">Admins only</h2>
          <p className="mt-2 text-sm text-white/65">You don't have access to this page.</p>
        </div>
      </Section>
    );
  }

  return (
    <Section className="pb-12 pt-16 lg:pt-24">
      <SectionHeader
        eyebrow="Admin"
        title="Reports & Analytics"
        description="Activity across the site — users, sessions, page visits, learning tabs, and chatbot questions."
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                days === d
                  ? "border-transparent bg-brand-gradient text-white"
                  : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"
              }`}
            >
              Last {d}d
            </button>
          ))}
        </div>
        <Button onClick={exportCsv} variant="outline" size="sm" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<Users />} label="Total users" value={counts?.totalUsers ?? "—"} />
        <Kpi icon={<Activity />} label="Active (24h)" value={counts?.active24 ?? "—"} />
        <Kpi icon={<Activity />} label={`Active (${days <= 7 ? 7 : 30}d)`} value={(days <= 7 ? counts?.active7d : counts?.active30d) ?? "—"} />
        <Kpi icon={<Clock />} label="Avg session (s)" value={counts?.avgSession ?? "—"} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Daily page visits" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0b0f17", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Line type="monotone" dataKey="visits" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Most visited pages" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPages} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="path" stroke="rgba(255,255,255,0.5)" fontSize={10} width={120} />
                <Tooltip contentStyle={{ background: "#0b0f17", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Bar dataKey="count" fill="#a855f7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Most accessed Learn tabs" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTabs} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={10} width={160} />
                <Tooltip contentStyle={{ background: "#0b0f17", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Bar dataKey="count" fill="#22d3ee" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Top chatbot questions" icon={<MessageSquare className="h-4 w-4" />}>
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-2 text-sm text-white/80">
            {topQuestions.length === 0 && <li className="text-white/50">No data yet.</li>}
            {topQuestions.map((q) => (
              <li key={q.q} className="flex justify-between gap-2 border-b border-white/5 pb-1.5">
                <span className="truncate">{q.q}</span>
                <span className="shrink-0 text-white/50">×{q.count}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6">
        <DataExportPanel />
      </div>
    </Section>
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
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
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
      <p className="mb-3 text-xs text-white/60">
        Exports run under your admin session (RLS-scoped). No credentials or service keys needed. For a full raw
        backup, use Cloud → Advanced settings → Export data.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          onClick={exportAll}
          disabled={busy !== null}
          size="sm"
          className="bg-brand-gradient text-white shadow-neon hover:opacity-90"
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
            className="justify-start border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            {busy === t ? "…" : t}
          </Button>
        ))}
      </div>
      {err && <p className="mt-3 text-xs text-red-400">{err}</p>}
    </Panel>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between text-white/60">
        <span className="text-xs uppercase tracking-widest">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white">{icon}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <span className="text-neon-cyan">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}
