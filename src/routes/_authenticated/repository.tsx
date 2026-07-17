import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, FileText, Sparkles } from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

import llm from "@/assets/repo/llm.pdf.asset.json" with { type: "json" };

import rag from "@/assets/repo/building_and_deploying_rag.pdf.asset.json" with { type: "json" };
import retail from "@/assets/repo/generative_ai_in_retail_supply_chains_white_paper.pdf.asset.json" with { type: "json" };
import itil from "@/assets/repo/itil_kanban_whitepaper.pdf.asset.json" with { type: "json" };
import execsum from "@/assets/repo/executive_summary.pdf.asset.json" with { type: "json" };

const asset = (a: unknown) => (a as { url: string }).url;

type Doc = {
  title: string;
  description: string;
  category: string;
  pages?: string;
  url: string;
  filename: string;
};

const DOCS: Doc[] = [
  {
    title: "Large Language Models — Foundations & Practice",
    description:
      "Comprehensive guide to LLM architectures, training, prompting, evaluation, and production deployment.",
    category: "AI / LLM",
    url: asset(llm),
    filename: "LLM-Foundations-and-Practice.pdf",
  },
  {
    title: "Building & Deploying RAG Systems",
    description:
      "End-to-end blueprint for Retrieval-Augmented Generation: chunking, embeddings, vector stores, retrievers, evaluation.",
    category: "AI / RAG",
    url: asset(rag),
    filename: "Building-and-Deploying-RAG.pdf",
  },
  {
    title: "Generative AI in Retail Supply Chains",
    description:
      "White paper on applying GenAI across demand forecasting, merchandising, logistics, and store operations.",
    category: "Retail / Supply Chain",
    url: asset(retail),
    filename: "GenAI-Retail-Supply-Chains.pdf",
  },
  {
    title: "Implementing ITIL with Kanban",
    description:
      "Incident, Change, Problem, and Service Request Management using Kanban — flow, WIP limits, SLAs, and governance.",
    category: "IT Service Management",
    url: asset(itil),
    filename: "ITIL-with-Kanban.pdf",
  },
  {
    title: "Executive Summary — The Intelligent Enterprise",
    description:
      "Executive brief on AI agents, cloud platforms, and industry-specific AI adoption across BFSI, retail, and telecom.",
    category: "Executive Brief",
    url: asset(execsum),
    filename: "Executive-Summary.pdf",
  },
];

export const Route = createFileRoute("/_authenticated/repository")({
  head: () => ({
    meta: [
      { title: "Repository — Members-only white papers & guides | Dibya Ranjan Mishra" },
      {
        name: "description",
        content:
          "Members-only repository of downloadable PDF white papers on LLMs, RAG, multi-tenant SaaS, GenAI in retail, ITIL with Kanban, and more.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RepositoryPage,
});

function RepositoryPage() {
  const { user } = useAuth();

  const track = async (doc: Doc) => {
    try {
      await supabase.from("resource_access").insert({
        user_id: user?.id ?? null,
        resource_type: "repository_pdf",
        resource_id: doc.filename,
      } as never);
    } catch {
      /* non-blocking */
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
            key={doc.filename}
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
                asChild
                size="sm"
                className="bg-brand-gradient text-white shadow-neon"
                onClick={() => track(doc)}
              >
                <a href={doc.url} download={doc.filename} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </a>
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
