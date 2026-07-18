import { createFileRoute } from "@tanstack/react-router";
import { posts } from "@/lib/content";

const BASE_URL = "https://www.dibyamishra.co.in";
const FEED_URL = `${BASE_URL}/atom.xml`;
const TITLE = "Dibya Ranjan Mishra — Blog & Research";
const SUBTITLE =
  "New articles on AI, agentic systems, cloud, SaaS, and engineering leadership by Dibya Ranjan Mishra.";
const AUTHOR_NAME = "Dibya Ranjan Mishra";
const AUTHOR_EMAIL = "mishra.dibyaranjan@gmail.com";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/atom.xml")({
  server: {
    handlers: {
      GET: async () => {
        const sorted = [...posts].sort((a, b) =>
          a.date < b.date ? 1 : -1,
        );

        const updated = sorted.length
          ? new Date(`${sorted[0].date}T00:00:00Z`).toISOString()
          : new Date().toISOString();

        const entries = sorted.map((p) => {
          const url = `${BASE_URL}/blog/${p.slug}`;
          const published = new Date(`${p.date}T00:00:00Z`).toISOString();
          return [
            `  <entry>`,
            `    <title>${escapeXml(p.title)}</title>`,
            `    <link href="${url}" rel="alternate" type="text/html" />`,
            `    <id>${url}</id>`,
            `    <published>${published}</published>`,
            `    <updated>${published}</updated>`,
            `    <category term="${escapeXml(p.category)}" />`,
            `    <summary type="text">${escapeXml(p.summary)}</summary>`,
            `    <author><name>${escapeXml(AUTHOR_NAME)}</name></author>`,
            `  </entry>`,
          ].join("\n");
        });

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<feed xmlns="http://www.w3.org/2005/Atom">`,
          `  <title>${escapeXml(TITLE)}</title>`,
          `  <subtitle>${escapeXml(SUBTITLE)}</subtitle>`,
          `  <link href="${FEED_URL}" rel="self" type="application/atom+xml" />`,
          `  <link href="${BASE_URL}" rel="alternate" type="text/html" />`,
          `  <id>${FEED_URL}</id>`,
          `  <updated>${updated}</updated>`,
          `  <author>`,
          `    <name>${escapeXml(AUTHOR_NAME)}</name>`,
          `    <email>${escapeXml(AUTHOR_EMAIL)}</email>`,
          `  </author>`,
          ...entries,
          `</feed>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/atom+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
