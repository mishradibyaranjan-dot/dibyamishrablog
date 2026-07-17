import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import llm from "@/assets/repo/llm.pdf.asset.json" with { type: "json" };
import rag from "@/assets/repo/building_and_deploying_rag.pdf.asset.json" with { type: "json" };
import retail from "@/assets/repo/generative_ai_in_retail_supply_chains_white_paper.pdf.asset.json" with { type: "json" };
import itil from "@/assets/repo/itil_kanban_whitepaper.pdf.asset.json" with { type: "json" };
import execsum from "@/assets/repo/executive_summary.pdf.asset.json" with { type: "json" };
import aiBeginner from "@/assets/repo/ai_beginner.pdf.asset.json" with { type: "json" };
import introCloud from "@/assets/repo/intro_cloud.pdf.asset.json" with { type: "json" };
import saasTutorial from "@/assets/repo/saas_tutorial.pdf.asset.json" with { type: "json" };
import enterpriseBrief from "@/assets/repo/enterprise_brief.pdf.asset.json" with { type: "json" };

// Server-side allow-list mapping stable doc keys → internal asset URLs.
// The upstream asset URLs are never exposed to the client.
const REPO: Record<string, { url: string; filename: string }> = {
  "ai-beginner": { url: (aiBeginner as { url: string }).url, filename: "AI-and-AI-Agents-Beginner-Guide.pdf" },
  "intro-cloud": { url: (introCloud as { url: string }).url, filename: "Intro-to-Cloud-Basics.pdf" },
  "saas-tutorial": { url: (saasTutorial as { url: string }).url, filename: "SaaS-Tutorial-and-Architecture.pdf" },
  "enterprise-brief": { url: (enterpriseBrief as { url: string }).url, filename: "Intelligent-Enterprise-Brief-July-2026.pdf" },
  "llm": { url: (llm as { url: string }).url, filename: "LLM-Foundations-and-Practice.pdf" },
  "rag": { url: (rag as { url: string }).url, filename: "Building-and-Deploying-RAG.pdf" },
  "retail": { url: (retail as { url: string }).url, filename: "GenAI-Retail-Supply-Chains.pdf" },
  "itil": { url: (itil as { url: string }).url, filename: "ITIL-with-Kanban.pdf" },
  "executive-summary": { url: (execsum as { url: string }).url, filename: "Executive-Summary.pdf" },
};

export const REPO_KEYS = Object.keys(REPO);

export const Route = createFileRoute("/api/download/pdf")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return new Response("Server misconfigured", { status: 500 });
        }

        // Require a valid Supabase user JWT
        const auth = request.headers.get("authorization") ?? "";
        if (!auth.toLowerCase().startsWith("bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = auth.slice(7).trim();
        const supabase = createClient(supabaseUrl, serviceKey);
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
          return new Response("Unauthorized", { status: 401 });
        }

        const url = new URL(request.url);
        const key = url.searchParams.get("key") ?? "";
        const doc = REPO[key];
        if (!doc) {
          return new Response("Not found", { status: 404 });
        }

        // Best-effort access log (uses caller's token so RLS "own resource insert" applies)
        try {
          const userScoped = createClient(supabaseUrl, process.env.SUPABASE_PUBLISHABLE_KEY ?? "", {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false },
          });
          await userScoped.from("resource_access").insert({
            user_id: user.id,
            resource_type: "repository_pdf",
            resource_id: doc.filename,
          });
        } catch {
          /* non-fatal */
        }

        const upstream = await fetch(doc.url);
        if (!upstream.ok || !upstream.body) {
          return new Response("Upstream fetch failed", { status: 502 });
        }

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${doc.filename}"`,
            "Cache-Control": "private, no-store",
          },
        });
      },
    },
  },
});
