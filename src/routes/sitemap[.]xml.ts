import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { posts, caseStudies } from "@/lib/content";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "https://www.dibyamishra.co.in";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/experience", changefreq: "monthly", priority: "0.9" },
  { path: "/leadership", changefreq: "monthly", priority: "0.8" },
  { path: "/achievements", changefreq: "monthly", priority: "0.8" },
  { path: "/certifications", changefreq: "monthly", priority: "0.7" },
  { path: "/jobs", changefreq: "hourly", priority: "0.9" },
  { path: "/jobs/remote", changefreq: "hourly", priority: "0.7" },
  { path: "/jobs/sources", changefreq: "daily", priority: "0.4" },
  { path: "/jobs/about-verification", changefreq: "monthly", priority: "0.5" },
  { path: "/expertise", changefreq: "monthly", priority: "0.9" },
  { path: "/advisory", changefreq: "monthly", priority: "0.9" },
  { path: "/playbook", changefreq: "monthly", priority: "0.9" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/newsletter", changefreq: "weekly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/trust", changefreq: "monthly", priority: "0.7" },
  { path: "/privacy", changefreq: "yearly", priority: "0.4" },
  { path: "/copyright", changefreq: "yearly", priority: "0.4" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" },
  { path: "/case-studies", changefreq: "monthly", priority: "0.7" },
  { path: "/projects", changefreq: "monthly", priority: "0.7" },
  { path: "/research", changefreq: "monthly", priority: "0.7" },
  { path: "/learn", changefreq: "weekly", priority: "0.8" },
  { path: "/guide", changefreq: "monthly", priority: "0.7" },
  { path: "/white-paper/agentic-ai-enterprise-automation", changefreq: "monthly", priority: "0.8" },
  { path: "/ai-transformation", changefreq: "monthly", priority: "0.8" },
  { path: "/enterprise-agentic-ai", changefreq: "monthly", priority: "0.8" },
  { path: "/enterprise-rag", changefreq: "monthly", priority: "0.8" },
  { path: "/cloud-modernization", changefreq: "monthly", priority: "0.8" },
  { path: "/engineering-transformation", changefreq: "monthly", priority: "0.8" },
  { path: "/gcc-technology-strategy", changefreq: "monthly", priority: "0.8" },
  { path: "/multi-tenant-saas", changefreq: "monthly", priority: "0.8" },
  { path: "/supply-chain-ai", changefreq: "monthly", priority: "0.8" },
  // Feeds
  { path: "/rss.xml", changefreq: "daily", priority: "0.5" },
  { path: "/atom.xml", changefreq: "daily", priority: "0.5" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [...staticEntries];

        // Blog posts (static content library)
        posts.forEach((post) => {
          entries.push({
            path: `/blog/${post.slug}`,
            lastmod: post.date,
            changefreq: "monthly",
            priority: post.featured ? "0.8" : "0.6",
          });
        });

        // Case study detail pages
        caseStudies.forEach((cs) => {
          entries.push({ path: `/case-study/${cs.slug}`, changefreq: "monthly", priority: "0.8" });
        });

        // Public credentials and policies only; never expose private issues or expired jobs.
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const db = createClient<Database>(process.env["SUPABASE_URL"]!, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("authorization") === `Bearer ${key}`) h.delete("authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } } });
        try {
          for (let page = 0; ; page++) {
          const { data: issues, error } = await db
            .from("newsletter_issues")
            .select("slug, published_at, updated_at")
            .eq("status", "published")
            .order("published_at", { ascending: false }).order("slug").range(page * 500, page * 500 + 499);
          if (error) throw error;

          (issues ?? []).forEach((issue) => {
            const lastmod = issue.updated_at ?? issue.published_at;
            entries.push({
              path: `/newsletter/${issue.slug}`,
              lastmod: lastmod ? new Date(lastmod).toISOString().split("T")[0] : undefined,
              changefreq: "monthly",
              priority: "0.7",
            });
          });
          if ((issues?.length ?? 0) < 500) break;
          }
          for (let page = 0; ; page++) {
            const { data: jobs, error } = await db.from("jobs").select("slug,updated_at").order("slug").range(page * 500, page * 500 + 499);
            if (error) throw error;
            for (const job of jobs ?? []) entries.push({ path: `/jobs/${job.slug}`, lastmod: job.updated_at, changefreq: "hourly", priority: "0.6" });
            if ((jobs?.length ?? 0) < 500) break;
          }
        } catch (err) {
          console.error("Failed to load public sitemap content", err);
          return new Response("Sitemap temporarily unavailable", { status: 503 });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=60",
          },
        });
      },
    },
  },
});
