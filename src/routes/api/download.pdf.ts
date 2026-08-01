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
import multiAgent from "@/assets/repo/multi_agent_systems.pdf.asset.json" with { type: "json" };
import vectorSearch from "@/assets/repo/vector_search.pdf.asset.json" with { type: "json" };

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
  "multi-agent-systems": { url: (multiAgent as { url: string }).url, filename: "Building-Multi-Agent-Systems.pdf" },
  "vector-search": { url: (vectorSearch as { url: string }).url, filename: "Vector-Search-Beginner-to-Production.pdf" },

};

export const REPO_KEYS = Object.keys(REPO);

export const Route = createFileRoute("/api/download/pdf")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const reqId = crypto.randomUUID().slice(0, 8);
        const log = (msg: string, extra?: Record<string, unknown>) =>
          console.log(`[download.pdf ${reqId}] ${msg}`, extra ?? "");
        const errJson = (status: number, code: string, message: string, extra?: Record<string, unknown>) => {
          console.error(`[download.pdf ${reqId}] ${code}: ${message}`, extra ?? "");
          return new Response(
            JSON.stringify({ error: code, message, requestId: reqId, ...(extra ?? {}) }),
            { status, headers: { "Content-Type": "application/json" } },
          );
        };

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return errJson(500, "server_misconfigured", "Backend credentials are not configured. Please contact the site owner.");
        }

        const auth = request.headers.get("authorization") ?? "";
        if (!auth.toLowerCase().startsWith("bearer ")) {
          return errJson(401, "missing_auth", "You must be signed in to download this file.");
        }
        const token = auth.slice(7).trim();
        const supabase = createClient(supabaseUrl, serviceKey);
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !user) {
          return errJson(401, "invalid_session", "Your session has expired. Please sign in again and retry.", {
            detail: authErr?.message,
          });
        }
        log("authenticated", { userId: user.id });

        const url = new URL(request.url);
        const key = url.searchParams.get("key") ?? "";
        const doc = REPO[key];
        if (!doc) {
          return errJson(404, "unknown_document", `No document is registered for key "${key}".`, {
            availableKeys: Object.keys(REPO),
          });
        }
        log("resolved doc", { key, filename: doc.filename, assetUrl: doc.url });

        try {
          const userScoped = createClient(supabaseUrl, process.env.SUPABASE_PUBLISHABLE_KEY ?? "", {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false },
          });
          const { error: logErr } = await userScoped.from("resource_access").insert({
            user_id: user.id,
            resource_type: "repository_pdf",
            resource_id: doc.filename,
          });
          if (logErr) log("resource_access insert failed (non-fatal)", { error: logErr.message });
        } catch (e) {
          log("resource_access insert threw (non-fatal)", { error: (e as Error).message });
        }

        const assetUrl = doc.url.startsWith("http")
          ? doc.url
          : new URL(doc.url, request.url).toString();
        log("fetching upstream", { assetUrl });

        let upstream: Response;
        try {
          upstream = await fetch(assetUrl);
        } catch (e) {
          return errJson(502, "upstream_unreachable", "The file storage is temporarily unreachable. Please try again in a moment.", {
            detail: (e as Error).message,
            assetUrl,
          });
        }

        if (!upstream.ok || !upstream.body) {
          const bodyPreview = await upstream.text().catch(() => "");
          return errJson(502, "upstream_error", `File storage returned ${upstream.status} for "${doc.filename}".`, {
            upstreamStatus: upstream.status,
            upstreamStatusText: upstream.statusText,
            assetUrl,
            preview: bodyPreview.slice(0, 200),
          });
        }

        log("streaming response", { status: upstream.status });
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${doc.filename}"`,
            "Cache-Control": "private, no-store",
            "X-Request-Id": reqId,
          },
        });
      },

    },
  },
});
