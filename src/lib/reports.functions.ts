import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ReportsPayload = {
  counts: {
    totalUsers: number;
    active24: number;
    active7d: number;
    active30d: number;
    totalChats: number;
    avgSession: number;
  };
  series: { day: string; visits: number }[];
  topPages: { path: string; count: number }[];
  topTabs: { name: string; count: number }[];
  topQuestions: { q: string; count: number }[];
  traffic: {
    pageviews: number;
    uniqueVisitors: number;
    uniqueSessions: number;
    pvPerVisit: number;
    daily: { day: string; visitors: number; pageviews: number }[];
    topPages: { label: string; value: number }[];
    topSources: { label: string; value: number }[];
    topCountries: { label: string; value: number }[];
    devices: { label: string; value: number }[];
    browsers: { label: string; value: number }[];
  };
  visitors: {
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
  }[];
};

function hostFromRef(ref: string | null): string {
  if (!ref) return "Direct";
  try {
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

async function fetchAll<T>(
  admin: Awaited<ReturnType<typeof getAdmin>>,
  table: string,
  cols: string,
  timeCol: string,
  sinceIso: string,
  cap = 20000,
): Promise<T[]> {
  const pageSize = 1000;
  let from = 0;
  const out: T[] = [];
  while (out.length < cap) {
    const { data, error } = await admin
      .from(table as never)
      .select(cols)
      .gte(timeCol, sinceIso)
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...(data as T[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const getReports = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days: number }) => ({
    days: [7, 14, 30, 90].includes(input.days) ? input.days : 7,
  }))
  .handler(async ({ data, context }): Promise<ReportsPayload> => {
    // Verify admin using the caller's RLS-scoped client (which can read own roles).
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) throw new Error("Forbidden");

    const admin = await getAdmin();
    const days = data.days;
    const nowMs = Date.now();
    const since = new Date(nowMs - days * 86400000).toISOString();
    const t24 = new Date(nowMs - 86400000).toISOString();
    const t7 = new Date(nowMs - 7 * 86400000).toISOString();
    const t30 = new Date(nowMs - 30 * 86400000).toISOString();

    const [usersR, act24R, act7R, act30R, chatsR, sessR, visitsR, tabsR, qR, vLogsR, visitorsR] =
      await Promise.all([
        admin.from("profiles").select("id", { count: "exact", head: true }),
        admin.from("login_sessions").select("user_id").gte("started_at", t24).limit(10000),
        admin.from("login_sessions").select("user_id").gte("started_at", t7).limit(10000),
        admin.from("login_sessions").select("user_id").gte("started_at", t30).limit(10000),
        admin.from("chatbot_messages").select("id", { count: "exact", head: true }).eq("role", "user"),
        admin
          .from("login_sessions")
          .select("started_at, ended_at, duration_seconds")
          .gte("started_at", since)
          .limit(10000),
        admin.from("page_visits").select("path, visited_at").gte("visited_at", since).limit(20000),
        admin.from("tab_access").select("page, tab_id, opened_at").gte("opened_at", since).limit(10000),
        admin
          .from("chatbot_messages")
          .select("content")
          .eq("role", "user")
          .gte("created_at", since)
          .limit(5000),
        fetchAll<{
          visitor_id: string;
          session_id: string | null;
          path: string | null;
          referrer: string | null;
          country: string | null;
          device: string | null;
          browser: string | null;
          os: string | null;
          created_at: string;
        }>(
          admin,
          "visitor_logs",
          "visitor_id, session_id, path, referrer, country, device, browser, os, created_at",
          "created_at",
          since,
        ),
        admin
          .from("visitors")
          .select(
            "visitor_id, user_id, email, display_name, last_country, last_city, device, browser, os, total_visits, total_pageviews, first_seen_at, last_seen_at, identified_at, first_referrer, first_utm_source",
          )
          .gte("last_seen_at", since)
          .order("last_seen_at", { ascending: false })
          .limit(1000),
      ]);

    const distinct = (rows: { user_id: string | null }[] | null) =>
      rows ? new Set(rows.map((r) => r.user_id).filter(Boolean)).size : 0;

    const durations = (sessR.data ?? []).map((r) => {
      if (r.duration_seconds != null) return r.duration_seconds as number;
      const start = new Date(r.started_at as string).getTime();
      const end = r.ended_at ? new Date(r.ended_at as string).getTime() : nowMs;
      return Math.max(1, Math.min(3600, Math.round((end - start) / 1000)));
    });
    const avg = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    // Daily page visits
    const visitBuckets = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(nowMs - i * 86400000).toISOString().slice(0, 10);
      visitBuckets.set(d, 0);
    }
    (visitsR.data ?? []).forEach((v) => {
      const d = (v.visited_at as string).slice(0, 10);
      if (visitBuckets.has(d)) visitBuckets.set(d, (visitBuckets.get(d) ?? 0) + 1);
    });
    const series = Array.from(visitBuckets.entries()).map(([day, visits]) => ({
      day: day.slice(5),
      visits,
    }));

    const pageMap = new Map<string, number>();
    (visitsR.data ?? []).forEach((v) =>
      pageMap.set(v.path as string, (pageMap.get(v.path as string) ?? 0) + 1),
    );
    const topPages = Array.from(pageMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, count]) => ({ path, count }));

    const tabMap = new Map<string, number>();
    (tabsR.data ?? []).forEach((t) => {
      const k = `${t.page}#${t.tab_id}`;
      tabMap.set(k, (tabMap.get(k) ?? 0) + 1);
    });
    const topTabs = Array.from(tabMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const qMap = new Map<string, number>();
    (qR.data ?? []).forEach((row) => {
      const norm = (row.content as string).toLowerCase().trim().slice(0, 80);
      if (norm.length < 4) return;
      qMap.set(norm, (qMap.get(norm) ?? 0) + 1);
    });
    const topQuestions = Array.from(qMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([q, count]) => ({ q, count }));

    // Traffic analytics from visitor_logs
    const vlogs = vLogsR;
    const pageviews = vlogs.length;
    const uniqueVisitors = new Set(vlogs.map((r) => r.visitor_id)).size;
    const uniqueSessions = new Set(
      vlogs.filter((r) => r.session_id).map((r) => r.session_id as string),
    ).size;
    const pvPerVisit = uniqueSessions ? +(pageviews / uniqueSessions).toFixed(2) : 0;

    const daily = new Map<string, { day: string; visitors: Set<string>; pageviews: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(nowMs - i * 86400000).toISOString().slice(0, 10);
      daily.set(d, { day: d.slice(5), visitors: new Set(), pageviews: 0 });
    }
    for (const r of vlogs) {
      const d = r.created_at.slice(0, 10);
      const b = daily.get(d);
      if (!b) continue;
      b.pageviews++;
      b.visitors.add(r.visitor_id);
    }
    const dailyArr = Array.from(daily.values()).map((b) => ({
      day: b.day,
      visitors: b.visitors.size,
      pageviews: b.pageviews,
    }));

    const tally = (get: (r: (typeof vlogs)[number]) => string, limit = 10) => {
      const m = new Map<string, number>();
      for (const r of vlogs) {
        const k = get(r) || "Unknown";
        m.set(k, (m.get(k) ?? 0) + 1);
      }
      return Array.from(m.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([label, value]) => ({ label, value }));
    };

    return {
      counts: {
        totalUsers: usersR.count ?? 0,
        active24: distinct(act24R.data as never),
        active7d: distinct(act7R.data as never),
        active30d: distinct(act30R.data as never),
        totalChats: chatsR.count ?? 0,
        avgSession: avg,
      },
      series,
      topPages,
      topTabs,
      topQuestions,
      traffic: {
        pageviews,
        uniqueVisitors,
        uniqueSessions,
        pvPerVisit,
        daily: dailyArr,
        topPages: tally((r) => r.path ?? "").slice(0, 10),
        topSources: tally((r) => hostFromRef(r.referrer)),
        topCountries: tally((r) => r.country ?? "Unknown"),
        devices: tally((r) => r.device ?? "unknown", 6),
        browsers: tally((r) => r.browser ?? "unknown", 6),
      },
      visitors: (visitorsR.data ?? []) as ReportsPayload["visitors"],
    };
  });
