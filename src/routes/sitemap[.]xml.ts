import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { posts } from "@/lib/content";

const BASE_URL = "https://dibyamishrablog.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/newsletter", changefreq: "weekly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/trust", changefreq: "monthly", priority: "0.7" },
  { path: "/white-paper/agentic-ai-enterprise-automation", changefreq: "monthly", priority: "0.8" },
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

        // Published newsletter issues
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: issues } = await supabaseAdmin
            .from("newsletter_issues")
            .select("slug, published_at, updated_at")
            .eq("status", "published")
            .order("published_at", { ascending: false });

          (issues ?? []).forEach((issue) => {
            const lastmod = issue.updated_at ?? issue.published_at;
            entries.push({
              path: `/newsletter/${issue.slug}`,
              lastmod: lastmod ? new Date(lastmod).toISOString().split("T")[0] : undefined,
              changefreq: "monthly",
              priority: "0.7",
            });
          });
        } catch (err) {
          console.error("Failed to fetch newsletter issues for sitemap", err);
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
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
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
