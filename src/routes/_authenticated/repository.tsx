import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

type Doc = {
  key: string;
  title: string;
  description: string;
  category: string;
  filename: string;
};

// Only stable doc keys are referenced client-side; internal asset URLs live
// server-side in src/routes/api/download.pdf.ts and are gated by JWT.
const DOCS: Doc[] = [
  { key: "ai-beginner", title: "Comprehensive Beginner Guide to AI & AI Agents", description: "A ground-up introduction to Artificial Intelligence and modern AI Agents — concepts, architectures, tooling, and real-world use cases.", category: "AI / Beginner", filename: "AI-and-AI-Agents-Beginner-Guide.pdf" },
  { key: "intro-cloud", title: "Intro to Cloud & Basic Concepts of Cloud", description: "Foundations of cloud computing: service models (IaaS/PaaS/SaaS), deployment models, architecture patterns, and cost basics.", category: "Cloud / Foundations", filename: "Intro-to-Cloud-Basics.pdf" },
  { key: "saas-tutorial", title: "Comprehensive SaaS Tutorial & Architecture Report", description: "End-to-end SaaS blueprint — multi-tenancy, pricing, security, observability, and architecture decisions for production platforms.", category: "SaaS / Architecture", filename: "SaaS-Tutorial-and-Architecture.pdf" },
  { key: "enterprise-brief", title: "The Intelligent Enterprise Brief — July 2026", description: "Executive brief on the shift from AI experiments to governed enterprise agents across BFSI, retail, shipping, supply chain, and telecom.", category: "Executive Brief", filename: "Intelligent-Enterprise-Brief-July-2026.pdf" },
  { key: "llm", title: "Large Language Models — Foundations & Practice", description: "Comprehensive guide to LLM architectures, training, prompting, evaluation, and production deployment.", category: "AI / LLM", filename: "LLM-Foundations-and-Practice.pdf" },
  { key: "rag", title: "Building & Deploying RAG Systems", description: "End-to-end blueprint for Retrieval-Augmented Generation: chunking, embeddings, vector stores, retrievers, evaluation.", category: "AI / RAG", filename: "Building-and-Deploying-RAG.pdf" },
  { key: "retail", title: "Generative AI in Retail Supply Chains", description: "White paper on applying GenAI across demand forecasting, merchandising, logistics, and store operations.", category: "Retail / Supply Chain", filename: "GenAI-Retail-Supply-Chains.pdf" },
  { key: "itil", title: "Implementing ITIL with Kanban", description: "Incident, Change, Problem, and Service Request Management using Kanban — flow, WIP limits, SLAs, and governance.", category: "IT Service Management", filename: "ITIL-with-Kanban.pdf" },
  { key: "executive-summary", title: "Executive Summary — The Intelligent Enterprise", description: "Executive brief on AI agents, cloud platforms, and industry-specific AI adoption across BFSI, retail, and telecom.", category: "Executive Brief", filename: "Executive-Summary.pdf" },
  { key: "vector-search", title: "Vector Search — A Beginner-to-Production Learning Report", description: "Embeddings, similarity metrics, ANN indexes (Flat/IVF/HNSW/PQ), FAISS, Annoy, HNSWlib, Milvus, hybrid retrieval, reranking, evaluation, cost and production operations.", category: "AI / Retrieval", filename: "Vector-Search-Beginner-to-Production.pdf" },
  { key: "multi-agent-systems", title: "Building Multi-Agent Systems", description: "Engineering report on MAS architecture — coordination topologies, FIPA ACL, ROS 2/DDS, MQTT, gRPC, frameworks, simulation, security, benchmarks, and reference designs.", category: "AI / Multi-Agent Systems", filename: "Building-Multi-Agent-Systems.pdf" },
];

export const Route = createFileRoute("/_authenticated/repository")({
  head: () => ({
    meta: [
      { title: "Repository — Members-only white papers & guides | Dibya Ranjan Mishra" },
      {
        name: "description",
        content:
          "Members-only repository of downloadable PDF white papers on AI, Cloud, SaaS, RAG, and enterprise strategy.",
      },
    ],
  }),
  component: RepositoryPage,
});

function RepositoryPage() {
  const { user } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);

  const download = async (doc: Doc) => {
    setBusy(doc.key);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        alert("Please sign in again to download.");
        return;
      }
      const res = await fetch(`/api/download/pdf?key=${encodeURIComponent(doc.key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        let msg = `Download failed (${res.status}).`;
        let reqId = res.headers.get("X-Request-Id") ?? undefined;
        try {
          const body = await res.json();
          if (body?.message) msg = body.message;
          if (body?.requestId) reqId = body.requestId;
          console.error("[repository download] server error", body);
        } catch {
          const text = await res.text().catch(() => "");
          if (text) console.error("[repository download] server error text", text);
        }
        alert(reqId ? `${msg}\n\nReference: ${reqId}` : msg);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Download failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Section className="pt-20 lg:pt-28">
      <SectionHeader
        as="h1"
        eyebrow="Members-only"
        title="Repository"
        description="Downloadable PDF white papers and practitioner guides. Signed-in members can download any document below."
      />

      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/5 p-4 text-sm text-emerald-200">
        <Sparkles className="h-4 w-4 shrink-0" />
        <p>
          Signed in as <span className="font-medium text-white">{user?.email}</span>. Enjoy full access — each
          download is logged for analytics only.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {DOCS.map((doc, i) => (
          <motion.article
            key={doc.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl transition hover:border-neon-cyan/50"
          >
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-white/70">
                <FileText className="h-3 w-3" />
                {doc.category}
              </div>
              <h2 className="font-display text-lg font-semibold text-white sm:text-xl">{doc.title}</h2>
              <p className="mt-2 text-sm text-white/70">{doc.description}</p>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs text-white/50">PDF · Members only</span>
              <Button
                size="sm"
                className="bg-brand-gradient text-white shadow-neon"
                disabled={busy === doc.key}
                onClick={() => download(doc)}
              >
                <Download className="mr-2 h-4 w-4" />
                {busy === doc.key ? "Preparing…" : "Download PDF"}
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
