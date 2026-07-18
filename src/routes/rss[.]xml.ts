import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { posts } from "@/lib/content";

const BASE_URL = "https://www.dibyamishra.co.in";
const FEED_URL = `${BASE_URL}/rss.xml`;
const TITLE = "Dibya Ranjan Mishra — Blog & Research";
const DESCRIPTION =
  "New articles on AI, agentic systems, cloud, SaaS, and engineering leadership by Dibya Ranjan Mishra.";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const items = [...posts]
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .map((p) => {
            const url = `${BASE_URL}/blog/${p.slug}`;
            const pubDate = new Date(`${p.date}T00:00:00Z`).toUTCString();
            return [
              `    <item>`,
              `      <title>${escapeXml(p.title)}</title>`,
              `      <link>${url}</link>`,
              `      <guid isPermaLink="true">${url}</guid>`,
              `      <pubDate>${pubDate}</pubDate>`,
              `      <category>${escapeXml(p.category)}</category>`,
              `      <description>${escapeXml(p.summary)}</description>`,
              `      <dc:creator>Dibya Ranjan Mishra</dc:creator>`,
              `    </item>`,
            ].join("\n");
          });

        const lastBuild = new Date().toUTCString();

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">`,
          `  <channel>`,
          `    <title>${escapeXml(TITLE)}</title>`,
          `    <link>${BASE_URL}</link>`,
          `    <description>${escapeXml(DESCRIPTION)}</description>`,
          `    <language>en-us</language>`,
          `    <lastBuildDate>${lastBuild}</lastBuildDate>`,
          `    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />`,
          ...items,
          `  </channel>`,
          `</rss>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
