import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Cloud,
  Layers,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Cpu,
  Network,
  Database,
  ShieldCheck,
  Workflow,
  Rocket,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/cinematic/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/learn")({
  head: () => ({
    meta: [
      { title: "Learn — AI, Cloud & SaaS Fundamentals" },
      {
        name: "description",
        content:
          "Beginner-friendly learning library covering Artificial Intelligence, Cloud Computing, and Software-as-a-Service (SaaS) fundamentals.",
      },
    ],
  }),
  component: Learn,
});

type TabKey = "ai" | "cloud" | "saas";

function Learn() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>("ai");

  useEffect(() => {
    if (!user) return;
    supabase.from("tab_access").insert({ user_id: user.id, page: "/learn", tab_id: tab });
  }, [tab, user]);

  return (
    <>
      <Section className="pb-4 pt-16 lg:pt-24">
        <SectionHeader
          eyebrow="Learning Library"
          title="Learn — AI, Cloud & SaaS, from the ground up"
          description="A beginner-friendly tour through the three pillars of modern technology: Artificial Intelligence, Cloud Computing, and Software-as-a-Service. Each tab is a self-contained mini-course with key concepts, examples, and takeaways."
        />

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="mt-6">
          <TabsList className="grid w-full grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-3">
            <TabPill value="ai" icon={<Brain className="h-4 w-4" />} label="Intro to AI" />
            <TabPill value="cloud" icon={<Cloud className="h-4 w-4" />} label="Intro to Cloud" />
            <TabPill value="saas" icon={<Layers className="h-4 w-4" />} label="Intro to SaaS" />
          </TabsList>

          <TabsContent value="ai" className="mt-8">
            <IntroAI />
          </TabsContent>
          <TabsContent value="cloud" className="mt-8">
            <IntroCloud />
          </TabsContent>
          <TabsContent value="saas" className="mt-8">
            <IntroSaaS />
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}

function TabPill({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="group relative w-full justify-start gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/70 backdrop-blur-xl transition-all data-[state=active]:border-transparent data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-neon hover:text-white"
    >
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white">{icon}</span>
      {label}
    </TabsTrigger>
  );
}

/* ---------------- AI TAB ---------------- */

function IntroAI() {
  return (
    <div className="space-y-10">
      <Reveal>
        <HeroCard
          icon={<Brain className="h-6 w-6" />}
          title="What is Artificial Intelligence?"
          tag="AI · Foundations"
          body="AI is the discipline of building systems that perceive, reason, learn, and act. A useful mental model is hierarchical: AI is the broad field; Machine Learning is a subfield that learns patterns from data; Deep Learning is the neural-network-heavy part of ML; and modern Generative AI and AI Agents sit on top as application layers."
        />
      </Reveal>

      <Reveal>
        <Grid title="The AI Stack" eyebrow="Hierarchy" subtitle="From broad discipline to the agentic apps you use today.">
          <ConceptCard icon={<BookOpen />} title="AI" desc="The umbrella discipline — systems that act intelligently." />
          <ConceptCard icon={<Cpu />} title="Machine Learning" desc="Algorithms that learn patterns from data, not rules." />
          <ConceptCard icon={<Network />} title="Deep Learning" desc="Multilayer neural networks; powers vision, speech, language." />
          <ConceptCard icon={<Sparkles />} title="Generative & Agents" desc="Foundation models that produce content and use tools." />
        </Grid>
      </Reveal>

      <Reveal>
        <Grid title="Types of Machine Learning" eyebrow="Learning paradigms">
          <ConceptCard icon={<CheckCircle2 />} title="Supervised" desc="Learn from labeled examples — classification & regression." />
          <ConceptCard icon={<Workflow />} title="Unsupervised" desc="Find structure without labels — clustering, embeddings." />
          <ConceptCard icon={<Rocket />} title="Reinforcement" desc="Learn by reward signals — control, games, robotics." />
        </Grid>
      </Reveal>

      <Reveal>
        <Grid title="Modern Model Families" eyebrow="When to reach for what">
          <ConceptCard title="Trees & Boosting" desc="Strong default for tabular data (XGBoost, LightGBM)." />
          <ConceptCard title="CNNs" desc="Convolutional nets — the workhorse for images." />
          <ConceptCard title="Transformers" desc="Attention-based; today's LLMs and multimodal models." />
          <ConceptCard title="Diffusion" desc="Iteratively denoise — image, video, audio generation." />
        </Grid>
      </Reveal>

      <Reveal>
        <FeatureCard
          icon={<Workflow className="h-5 w-5" />}
          title="The Agent Loop"
          body="An AI agent wraps a model in a loop: observe → decide → use tools → act → evaluate → repeat. Surround it with guardrails, logging, and human review for high-stakes actions. Start simple; add complexity only when the task requires it."
        />
      </Reveal>

      <KeyTakeaways
        items={[
          "AI = perceive, reason, learn, act. ML and Deep Learning are subsets.",
          "Start with simple baselines before deep models. Data quality beats model novelty.",
          "Transformers + RAG + tools = the modern enterprise AI pattern.",
          "Treat privacy, bias, security, and traceability as first-class requirements.",
        ]}
      />
    </div>
  );
}

/* ---------------- CLOUD TAB ---------------- */

function IntroCloud() {
  return (
    <div className="space-y-10">
      <Reveal>
        <HeroCard
          icon={<Cloud className="h-6 w-6" />}
          title="What is Cloud Computing?"
          tag="Cloud · Foundations"
          body="Cloud computing is using internet-delivered computing resources instead of owning and operating infrastructure. The benefits: elasticity, speed, global reach, reliability, built-in security capabilities, and a shift from upfront capital spend to usage-based operational spend."
        />
      </Reveal>

      <Reveal>
        <Grid title="Service Models" eyebrow="Who manages what" subtitle="The three classic layers, plus serverless as the modern fourth.">
          <ConceptCard title="IaaS" desc="Infrastructure: virtual machines, storage, networking. You manage OS and apps." />
          <ConceptCard title="PaaS" desc="Platform: managed runtime — deploy code, skip the servers." />
          <ConceptCard title="SaaS" desc="Software: finished apps over the network, on subscription." />
          <ConceptCard title="Serverless" desc="Functions on demand. Provider handles runtime, scaling, and idle." />
        </Grid>
      </Reveal>

      <Reveal>
        <Grid title="Deployment Models" eyebrow="Where it runs">
          <ConceptCard title="Public" desc="Shared provider infrastructure delivered as a service." />
          <ConceptCard title="Private" desc="Cloud-like infrastructure dedicated to one organization." />
          <ConceptCard title="Hybrid" desc="Mix public + private/on-premises with secure connectivity." />
          <ConceptCard title="Multi-cloud" desc="Use services from more than one provider at the same time." />
        </Grid>
      </Reveal>

      <Reveal>
        <Grid title="Core Building Blocks" eyebrow="What every cloud has">
          <ConceptCard icon={<Cpu />} title="Compute" desc="VMs, containers, and serverless functions." />
          <ConceptCard icon={<Database />} title="Storage" desc="Object, block, and file — object storage is the universal default." />
          <ConceptCard icon={<Network />} title="Networking" desc="VPCs, subnets, load balancers, CDN, DNS." />
          <ConceptCard icon={<ShieldCheck />} title="Identity & Access" desc="Roles, policies, least privilege — IAM controls everything." />
        </Grid>
      </Reveal>

      <Reveal>
        <FeatureCard
          icon={<Workflow className="h-5 w-5" />}
          title="Regions, Zones & Resilience"
          body="A region is a geographic location. Within a region, availability zones are isolated datacenter groupings. Running workloads across multiple zones survives a single-datacenter failure — this is the foundation of cloud high availability."
        />
      </Reveal>

      <KeyTakeaways
        items={[
          "Cloud trades CapEx for OpEx and rents you global infrastructure.",
          "IaaS, PaaS, SaaS, Serverless differ by what the provider manages.",
          "Multi-AZ deployment is the cheapest high-availability lever.",
          "Identity, networking, storage, observability, and cost tools exist on every major cloud.",
        ]}
      />
    </div>
  );
}

/* ---------------- SAAS TAB ---------------- */

function IntroSaaS() {
  return (
    <div className="space-y-10">
      <Reveal>
        <HeroCard
          icon={<Layers className="h-6 w-6" />}
          title="What is SaaS?"
          tag="SaaS · Architecture"
          body="SaaS is a business and delivery model: customers subscribe to software the provider hosts, operates, secures, and updates over the network. Crucially, SaaS answers *how software is sold* — multitenancy answers *how customers are isolated inside it*. They are related but distinct decisions."
        />
      </Reveal>

      <Reveal>
        <Grid title="Tenancy Models" eyebrow="The isolation spectrum" subtitle="Pick by isolation, onboarding speed, and unit economics.">
          <ConceptCard title="Silo" desc="Dedicated infrastructure per tenant. Highest isolation, highest cost." />
          <ConceptCard title="Pool" desc="Shared app and data tier; enforce isolation by tenant_id (e.g., RLS)." />
          <ConceptCard title="Bridge / Stamps" desc="Pooled by default, dedicated stamps for premium or regulated tenants." />
        </Grid>
      </Reveal>

      <Reveal>
        <Grid title="Pricing Building Blocks" eyebrow="Match value to cost">
          <ConceptCard title="Flat rate" desc="One price, simple message. Best when usage is stable." />
          <ConceptCard title="Per seat" desc="Scales with users. Great fit for collaboration tools." />
          <ConceptCard title="Tiered" desc="Bundled feature and limit tiers across segments." />
          <ConceptCard title="Usage-based" desc="Pay for what you consume — APIs, storage, AI tokens." />
        </Grid>
      </Reveal>

      <Reveal>
        <Grid title="Architecture Pillars" eyebrow="Don't roll your own">
          <ConceptCard icon={<ShieldCheck />} title="External Identity" desc="OAuth 2.0 + OIDC. Building your own IdP is an antipattern." />
          <ConceptCard icon={<Workflow />} title="Tenant Routing" desc="Resolve active tenant from subdomain, header, or JWT before authorization." />
          <ConceptCard icon={<Database />} title="Tenant-Aware Data" desc="Enforce tenant_id at the data layer (Row Level Security), not just in app code." />
          <ConceptCard icon={<Network />} title="Per-Tenant Observability" desc="Latency, quota, noisy-neighbor alerts — by tenant." />
        </Grid>
      </Reveal>

      <Reveal>
        <FeatureCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Security: AuthN ≠ Isolation"
          body="Authentication and authorization alone do not guarantee tenant isolation. Isolation must be enforced across the request path, data layer, cache layer, background jobs, storage, and operations tooling. Treat cross-tenant leakage as a P0 risk."
        />
      </Reveal>

      <KeyTakeaways
        items={[
          "SaaS = sales/delivery model. Multitenancy = isolation architecture.",
          "Default to a pooled tier with bridge/stamps for premium accounts.",
          "Pick pricing metrics that map to both customer value and your cost drivers.",
          "Enforce isolation at every layer, not just at the front door.",
        ]}
      />
    </div>
  );
}

/* ---------------- Reusable bits ---------------- */

function HeroCard({
  icon,
  title,
  tag,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  tag: string;
  body: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-flashy rounded-3xl glass-strong p-8 shadow-glow sm:p-10"
    >
      <div className="relative z-[3] flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <Badge className="w-fit bg-white/10 text-white hover:bg-white/15">{tag}</Badge>
          <h3 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">{title}</h3>
          <p className="mt-3 text-sm text-white/75 sm:text-base">{body}</p>
        </div>
      </div>
    </motion.div>
  );
}

function Grid({
  title,
  subtitle,
  eyebrow,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-neon-cyan">{eyebrow}</p>}
        <h3 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">{title}</h3>
        {subtitle && <p className="mt-2 text-sm text-white/65">{subtitle}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </div>
  );
}

function ConceptCard({ icon, title, desc }: { icon?: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="card-flashy group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-shadow hover:shadow-glow"
    >
      {icon && (
        <div className="relative z-[3] mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white">
          {icon}
        </div>
      )}
      <h4 className="relative z-[3] text-base font-semibold text-white group-hover:text-gradient">{title}</h4>
      <p className="relative z-[3] mt-2 text-sm text-white/65">{desc}</p>
    </motion.div>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-neon">
          {icon}
        </div>
        <div>
          <h4 className="text-base font-semibold text-white">{title}</h4>
          <p className="mt-2 text-sm text-white/70">{body}</p>
        </div>
      </div>
    </div>
  );
}

function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <Reveal>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-7 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-neon-cyan" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neon-cyan">Key Takeaways</p>
        </div>
        <ul className="mt-4 space-y-2.5">
          {items.map((it) => (
            <li key={it} className="flex items-start gap-3 text-sm text-white/80">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
