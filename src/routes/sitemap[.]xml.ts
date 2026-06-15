import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://dibyamishrablog.lovable.app";

const paths = [
  "/", "/about", "/research", "/blog", "/projects", "/case-studies", "/contact",
  "/blog/agentic-ai-enterprise-automation",
  "/blog/scalable-rag-enterprise",
  "/blog/cloud-native-saas-patterns",
  "/blog/engineering-leadership-global-teams",
  "/blog/ai-delivery-predictability",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...paths.map((p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
