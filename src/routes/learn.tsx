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
  History,
  GitBranch,
  Boxes,
  KeyRound,
  Gauge,
  DollarSign,
  ServerCog,
  Globe2,
  Code2,
  Activity,
  Users,
  LineChart,
  Lock,
  AlertTriangle,
  KanbanSquare,
  Wrench,
  Zap,
  ShoppingCart,
  Building2,
  Search,
  Bot,
  Radio,
  Share2,
  PlayCircle,
  Radar as RadarIcon,
  Timer,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/cinematic/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import heroAI from "@/assets/learn/human-robot-ai.jpg";
import heroCloud from "@/assets/learn/human-robot-cloud.jpg";
import heroSaaS from "@/assets/learn/human-robot-saas.jpg";
import heroITIL from "@/assets/learn/human-robot-itil.jpg";
import heroLLM from "@/assets/learn/human-robot-llm.jpg";
import heroRetail from "@/assets/learn/human-robot-retail.jpg";
import heroMultiTenant from "@/assets/learn/human-robot-multitenant.jpg";
import heroRAG from "@/assets/learn/human-robot-rag.jpg";
import heroMAS from "@/assets/learn/human-robot-mas.jpg";
import { pageOgImages, SITE_ORIGIN } from "@/lib/og-images";
import { breadcrumbScript } from "@/lib/breadcrumbs";

function TabHeroImage({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <Reveal>
      <motion.figure
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-blue-200/70 bg-white shadow-[0_20px_60px_-30px_rgba(59,130,246,0.35)]"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-cyan-50" aria-hidden />
        <img
          src={src}
          alt={alt}
          width={1600}
          height={900}
          loading="lazy"
          className="relative z-[1] h-56 w-full object-cover sm:h-72 md:h-96"
        />
        <figcaption className="relative z-[1] flex items-center gap-2 border-t border-blue-100 bg-white/90 px-4 py-3 text-xs font-medium text-slate-600 backdrop-blur sm:text-sm">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
          {caption}
        </figcaption>
      </motion.figure>
    </Reveal>
  );
}

export const Route = createFileRoute("/learn")({
  head: () => {
    const url = `${SITE_ORIGIN}/learn`;
    const description =
      "Beginner-friendly learning library on AI, Cloud, and SaaS — concepts, history, architecture diagrams, and code.";
    const title = "Learn — AI, Cloud & SaaS Fundamentals";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:image", content: pageOgImages.learn },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: pageOgImages.learn },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [breadcrumbScript([{ name: "Learn", path: "/learn" }])],
    };
  },
  component: Learn,
});


type TabKey = "ai" | "cloud" | "saas" | "itil" | "llm" | "genai-retail" | "multitenant" | "rag" | "mas";

function Learn() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>("ai");

  useEffect(() => {
    if (!user) return;
    supabase.from("tab_access").insert({ user_id: user.id, page: "/learn", tab_id: tab });
  }, [tab, user]);

  return (
    <Section className="pb-4 pt-16 lg:pt-24">
      <SectionHeader
        as="h1"
        eyebrow="Learning Library"
        title="Learn — AI, Cloud, SaaS, ITIL, LLM, GenAI Retail, Multi-Tenant, RAG & Multi-Agent Systems"
        description="Nine self-contained mini-courses with quick-summary guides, concepts, history, architecture diagrams, interactive charts, video walkthroughs, comparison tables, code snippets, and security guidance. Each module opens with a Quick Summary Guide so you get the key takeaways in under a minute."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="mt-6">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1.5 rounded-none bg-transparent p-0 sm:grid-cols-2 sm:gap-2 lg:grid-cols-4">
          <TabPill value="ai" icon={<Brain className="h-4 w-4" />} label="Intro to AI" />
          <TabPill value="cloud" icon={<Cloud className="h-4 w-4" />} label="Intro to Cloud" />
          <TabPill value="saas" icon={<Layers className="h-4 w-4" />} label="Intro to SaaS" />
          <TabPill value="itil" icon={<KanbanSquare className="h-4 w-4" />} label="ITIL & Kanban" />
          <TabPill value="llm" icon={<Cpu className="h-4 w-4" />} label="LLM Engineering" />
          <TabPill value="genai-retail" icon={<ShoppingCart className="h-4 w-4" />} label="GenAI in Retail" />
          <TabPill value="multitenant" icon={<Building2 className="h-4 w-4" />} label="Multi-Tenant Apps" />
          <TabPill value="rag" icon={<Search className="h-4 w-4" />} label="RAG Systems" />
          <TabPill value="mas" icon={<Bot className="h-4 w-4" />} label="Multi-Agent Systems" />
        </TabsList>

        <TabsContent value="ai" className="mt-8 space-y-12">
          <IntroAI />
        </TabsContent>
        <TabsContent value="cloud" className="mt-8 space-y-12">
          <IntroCloud />
        </TabsContent>
        <TabsContent value="saas" className="mt-8 space-y-12">
          <IntroSaaS />
        </TabsContent>
        <TabsContent value="itil" className="mt-8 space-y-12">
          <IntroITIL />
        </TabsContent>
        <TabsContent value="llm" className="mt-8 space-y-12">
          <IntroLLM />
        </TabsContent>
        <TabsContent value="genai-retail" className="mt-8 space-y-12">
          <IntroGenAIRetail />
        </TabsContent>
        <TabsContent value="multitenant" className="mt-8 space-y-12">
          <IntroMultiTenant />
        </TabsContent>
        <TabsContent value="rag" className="mt-8 space-y-12">
          <IntroRAG />
        </TabsContent>
        <TabsContent value="mas" className="mt-8 space-y-12">
          <IntroMAS />
        </TabsContent>
      </Tabs>
    </Section>
  );
}

function TabPill({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="group relative w-full justify-start gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 backdrop-blur-xl transition-all data-[state=active]:border-transparent data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-neon hover:text-white sm:px-5 sm:py-3"
    >
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white">{icon}</span>
      {label}
    </TabsTrigger>
  );
}

/* ================================================================
   AI TAB
   ================================================================ */

function IntroAI() {
  return (
    <div className="space-y-12">
      <TabHeroImage src={heroAI} alt="Human and AI robot exploring intelligent systems together" caption="Humans + AI — building intelligent systems, together." />
      <Reveal>
        <QuickSummary
          items={[
            'Artificial Intelligence is systems that perceive, reason, learn, and act — not a single model.',
            'Modern stack: Transformers + retrieval + tools → agents. Data quality still beats novelty.',
            'Ship with governance: privacy, bias, security, and traceability are first-class.',
            'Start with the simplest baseline; add complexity only when the metric demands it.',
          ]}
        />
      </Reveal>

      <Reveal>
        <HeroCard
          icon={<Brain className="h-6 w-6" />}
          title="What is Artificial Intelligence?"
          tag="AI · Foundations"
          body="AI is the discipline of building systems that perceive, reason, learn, and act. A classic framing divides goal-oriented definitions into four buckets — systems that think like humans, think rationally, act like humans, or act rationally. The 'acting rationally' framing leads naturally to the idea of an intelligent agent: a system mapping percepts from an environment to actions under a performance objective. Good AI engineering is less about finding a magical model and more about disciplined problem framing, data quality, evaluation design, safe deployment, monitoring, and iteration."
        />
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Hierarchy" title="The AI Stack" subtitle="From the broad discipline down to the agentic apps you use today.">
          <Diagram>
            <StackDiagram
              layers={[
                { label: "AI Agents & Generative Apps", tint: "from-fuchsia-500/40 to-cyan-400/40" },
                { label: "Foundation Models (LLMs, Diffusion, Multimodal)", tint: "from-indigo-500/35 to-fuchsia-500/35" },
                { label: "Deep Learning (CNN, RNN, Transformer)", tint: "from-blue-500/30 to-indigo-500/30" },
                { label: "Machine Learning (Supervised, Unsupervised, RL)", tint: "from-cyan-500/25 to-blue-500/25" },
                { label: "Artificial Intelligence (the broad discipline)", tint: "from-emerald-500/20 to-cyan-500/20" },
              ]}
            />
          </Diagram>
          <Grid cols={4}>
            <ConceptCard icon={<BookOpen />} title="AI" desc="The umbrella discipline — systems that perceive, reason, learn, and act." />
            <ConceptCard icon={<Cpu />} title="Machine Learning" desc="Algorithms that learn patterns from data instead of explicit rules." />
            <ConceptCard icon={<Network />} title="Deep Learning" desc="Multilayer neural networks — power vision, speech, and language." />
            <ConceptCard icon={<Sparkles />} title="Generative & Agents" desc="Foundation models that produce content and use tools to act." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="History" title="A Brief Timeline" subtitle="AI history is not a clean story of one paradigm replacing another. Symbolic methods, probabilistic reasoning, and neural approaches coexist and reinforce each other.">
          <Timeline
            items={[
              { year: "1950", title: "Turing's Test", desc: "Alan Turing reframes 'can machines think?' as an operational behavioral test in dialogue." },
              { year: "1955", title: "Dartmouth Proposal", desc: "John McCarthy and colleagues coin the term 'Artificial Intelligence' and argue intelligence can be formalized." },
              { year: "1958", title: "The Perceptron", desc: "Rosenblatt's perceptron makes 'learning from examples' concrete." },
              { year: "1970s–80s", title: "Symbolic AI & Expert Systems", desc: "Logic, planning, and rule-based expert systems become commercially successful." },
              { year: "1986", title: "Backpropagation Revived", desc: "Multilayer neural networks become practically trainable." },
              { year: "2012", title: "AlexNet & ImageNet", desc: "GPU-trained deep CNN crushes the ImageNet benchmark — the deep learning era begins." },
              { year: "2014", title: "GANs", desc: "Generative Adversarial Networks open the door to modern generative models." },
              { year: "2017", title: "Transformers", desc: "Attention replaces recurrence — the architecture behind today's LLMs and multimodal models." },
              { year: "2022→", title: "LLMs & Agents", desc: "Instruction-tuned LLMs, RAG, tool-use, and orchestrated multi-step agents." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Learning paradigms" title="Types of Machine Learning">
          <Grid cols={3}>
            <ConceptCard icon={<CheckCircle2 />} title="Supervised" desc="Learn from labeled examples — classification and regression. Strong default for tabular problems." />
            <ConceptCard icon={<Workflow />} title="Unsupervised" desc="Find structure without labels — clustering, embeddings, dimensionality reduction." />
            <ConceptCard icon={<Rocket />} title="Reinforcement" desc="Learn from reward signals from an environment — control, games, robotics." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="When to reach for what" title="Modern Model Families">
          <Table
            headers={["Family", "Best first use case", "Intuition", "Main trade-off"]}
            rows={[
              ["Linear / Logistic", "Tabular baselines, calibrated probabilities", "Weighted sum + link function", "Underfits nonlinear data"],
              ["Trees & Gradient Boosting", "Tabular data (XGBoost, LightGBM)", "Recursive splits, ensembled", "Less natural for raw text/images"],
              ["CNNs", "Images, video, signals", "Local filters share weights spatially", "Needs lots of data; transformers now competitive"],
              ["RNN / LSTM", "Sequences before transformers", "State carried across time", "Slow, hard to scale long contexts"],
              ["Transformers", "Text, multimodal, modern LLMs", "Attention over all tokens", "Compute and memory grow with sequence"],
              ["Diffusion", "Image, video, audio generation", "Iteratively denoise from noise", "Slow inference; needs careful conditioning"],
              ["GNNs", "Graph / relational data", "Message passing over nodes", "Tooling and benchmarks still maturing"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="How agents work" title="The Agent Loop">
          <Diagram>
            <AgentLoopDiagram />
          </Diagram>
          <FeatureCard
            icon={<Workflow className="h-5 w-5" />}
            title="Observe → Decide → Act → Evaluate"
            body="An AI agent wraps a model in a loop: observe the environment, decide what to do, call tools, act, evaluate the outcome, and repeat. Production agents add memory, guardrails, traceability, and human review for high-stakes actions. Start with the simplest possible loop and add complexity only when the task demands it."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Build sequence" title="Building an AI System End-to-End">
          <NumberedSteps
            items={[
              { title: "Define task & success metric", desc: "Pin down the user, the input, the output, and how you'll measure quality." },
              { title: "Set constraints & risks", desc: "Latency, privacy, bias, cost, safety. Write down what 'unacceptable' looks like." },
              { title: "Prepare environment & credentials", desc: "Reproducible Python env, version control, secret management." },
              { title: "Assemble data pipeline", desc: "Source → clean → split → leak-proof preprocessing. Track data lineage." },
              { title: "Baseline before deep models", desc: "Logistic regression / trees on tabular. Pretrained pipelines for text/vision." },
              { title: "Evaluate honestly", desc: "Hold-out + cross-validation. Task-appropriate metrics. Human review for generative tasks." },
              { title: "Deploy with observability", desc: "Logging, tracing, drift monitoring, rollback, on-call." },
              { title: "Iterate with governance", desc: "NIST AI RMF lifecycle — measure, manage, govern, map." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Code starter" title="A Minimal scikit-learn Pipeline">
          <Code
            language="python"
            code={`from sklearn.model_selection import train_test_split, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

# 1. Split FIRST to avoid leakage
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y)

# 2. Preprocess inside the pipeline so it's fit only on training folds
clf = Pipeline([
    ("scale", StandardScaler()),
    ("model", LogisticRegression(max_iter=1000)),
])

# 3. Cross-validate
cv = cross_validate(clf, X_train, y_train, cv=5,
                    scoring=["accuracy", "f1_macro"])
print({k: v.mean() for k, v in cv.items() if "test" in k})

# 4. Fit + evaluate on the held-out set
clf.fit(X_train, y_train)
print(classification_report(y_test, clf.predict(X_test)))`}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Responsible AI" title="Risks & Governance">
          <Grid cols={4}>
            <ConceptCard icon={<AlertTriangle />} title="Confabulation" desc="Generative models can produce confident but false statements. Ground with retrieval and citations." />
            <ConceptCard icon={<Lock />} title="Privacy" desc="Don't train on or echo back sensitive data. Apply minimization and redaction." />
            <ConceptCard icon={<ShieldCheck />} title="Bias & Fairness" desc="Evaluate across subgroups; document datasets and known limitations." />
            <ConceptCard icon={<Activity />} title="Security" desc="Treat prompt injection, data exfiltration, and tool misuse as first-class threats." />
          </Grid>
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "AI = perceive, reason, learn, act. ML and Deep Learning are subsets.",
          "Start with simple baselines before deep models. Data quality beats model novelty.",
          "Transformers + retrieval + tools = the modern enterprise AI pattern.",
          "Treat privacy, bias, security, and traceability as first-class requirements — not add-ons.",
        ]}
      />
    </div>
  );
}

/* ================================================================
   CLOUD TAB
   ================================================================ */

function IntroCloud() {
  return (
    <div className="space-y-12">
      <TabHeroImage src={heroCloud} alt="Engineer shaking hands with a robot in front of cloud servers" caption="From bare metal to the cloud — elastic, on-demand, global." />
      <Reveal>
        <QuickSummary
          items={[
            'Cloud = elastic, on-demand compute, storage, networking billed by usage.',
            'Service tiers: IaaS → PaaS → SaaS → Serverless (you manage less at each step).',
            'Identity + regions + zones are the mental model that maps to AWS, Azure, and GCP.',
            'FinOps and observability are day-1 concerns, not afterthoughts.',
          ]}
        />
      </Reveal>

      <Reveal>
        <HeroCard
          icon={<Cloud className="h-6 w-6" />}
          title="What is Cloud Computing?"
          tag="Cloud · Foundations"
          body="Cloud computing means using internet-delivered computing resources instead of owning and operating infrastructure yourself. The practical benefits: elasticity, speed, global reach, reliability, built-in security capabilities, and a shift from large upfront capital spend to usage-based operational spend. The three major providers (AWS, Azure, Google Cloud) expose the same essential patterns — compute, networking, storage, identity, security, observability, and cost control — under different product names."
        />
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Who manages what" title="Service Models">
          <Diagram>
            <ServiceModelDiagram />
          </Diagram>
          <Grid cols={4}>
            <ConceptCard icon={<ServerCog />} title="IaaS" desc="Infrastructure: VMs, storage, networking. You manage OS, runtime, and apps." />
            <ConceptCard icon={<Boxes />} title="PaaS" desc="Platform: managed runtime — deploy code, skip the servers." />
            <ConceptCard icon={<Layers />} title="SaaS" desc="Software: finished apps over the network on subscription." />
            <ConceptCard icon={<Sparkles />} title="Serverless" desc="Functions on demand. Provider handles runtime, scaling, and idle." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Where it runs" title="Deployment Models">
          <Grid cols={4}>
            <ConceptCard icon={<Globe2 />} title="Public" desc="Shared provider infrastructure delivered as a service." />
            <ConceptCard icon={<Lock />} title="Private" desc="Cloud-like infrastructure dedicated to one organization." />
            <ConceptCard icon={<GitBranch />} title="Hybrid" desc="Public + private/on-prem with secure connectivity. About environment mix." />
            <ConceptCard icon={<Network />} title="Multi-cloud" desc="Services from more than one provider at the same time. About provider mix." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="The mental model" title="A Shared Cloud Architecture">
          <Diagram>
            <CloudArchitectureDiagram />
          </Diagram>
          <p className="mt-4 text-sm text-white/70">
            Identity and policy wrap the environment; workloads live in networks inside regions; resilience comes from
            zones; workloads consume storage and managed services. This mental model maps to AWS, Azure, and Google
            Cloud — only the product names change.
          </p>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="What every cloud has" title="Core Building Blocks">
          <Grid cols={4}>
            <ConceptCard icon={<Cpu />} title="Compute" desc="VMs, containers, and serverless functions. Learn VMs first, then containers, then serverless." />
            <ConceptCard icon={<Database />} title="Storage" desc="Object, block, and file. Object storage is the universal default — simple, durable, cheap." />
            <ConceptCard icon={<Network />} title="Networking" desc="VPCs, subnets, load balancers, CDN, DNS. Private by default; expose deliberately." />
            <ConceptCard icon={<KeyRound />} title="Identity & Access" desc="Roles, policies, least privilege. IAM controls everything else in the cloud." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Cross-provider map" title="Same Concepts, Different Names">
          <Table
            headers={["Concept", "AWS", "Azure", "Google Cloud"]}
            rows={[
              ["Virtual machine", "Amazon EC2", "Azure Virtual Machines", "Compute Engine"],
              ["Object storage", "Amazon S3", "Azure Blob Storage", "Cloud Storage"],
              ["Managed Kubernetes", "Amazon EKS", "Azure Kubernetes Service", "Google Kubernetes Engine"],
              ["Serverless functions", "AWS Lambda", "Azure Functions", "Cloud Run functions"],
              ["Managed relational DB", "Amazon RDS / Aurora", "Azure SQL / Database for PostgreSQL", "Cloud SQL / AlloyDB"],
              ["Identity & access", "AWS IAM", "Microsoft Entra ID + Azure RBAC", "Google Cloud IAM"],
              ["Networking", "Amazon VPC", "Azure Virtual Network", "VPC Network"],
              ["Cost tools", "Billing & Cost Management", "Microsoft Cost Management", "Cloud Billing / Cost Management"],
              ["Monitoring", "Amazon CloudWatch", "Azure Monitor", "Cloud Monitoring (Ops Suite)"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Resilience" title="Regions, Zones & High Availability">
          <FeatureCard
            icon={<Globe2 className="h-5 w-5" />}
            title="Region = geography. Zone = isolated datacenter group."
            body="A region is a geographic location (e.g., us-east-1). Within a region, availability zones are isolated datacenter groupings with independent power, cooling, and networking. Running workloads across multiple zones survives a single-datacenter failure — this is the foundation of cloud high availability, and the cheapest HA lever you have. Multi-region adds disaster recovery; it costs more and adds data-consistency complexity."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Hands-on starter" title="First Cloud Mini-Lab (AWS CLI)">
          <Code
            language="bash"
            code={`# 1. Create an S3 bucket for object storage
aws s3api create-bucket --bucket my-first-bucket-2026 --region us-east-1

# 2. Upload a file
echo "hello cloud" > hello.txt
aws s3 cp hello.txt s3://my-first-bucket-2026/

# 3. Launch a tiny EC2 VM (Amazon Linux 2023, t2.micro)
aws ec2 run-instances \\
  --image-id ami-0abcdef1234567890 \\
  --instance-type t2.micro \\
  --key-name my-keypair \\
  --count 1

# 4. List running instances
aws ec2 describe-instances \\
  --query "Reservations[].Instances[].[InstanceId,State.Name]" \\
  --output table`}
          />
          <p className="mt-3 text-sm text-white/65">
            Equivalent commands exist for Azure (<code className="rounded bg-white/10 px-1 py-0.5">az vm create</code>,{" "}
            <code className="rounded bg-white/10 px-1 py-0.5">az storage blob upload</code>) and Google Cloud
            (<code className="rounded bg-white/10 px-1 py-0.5">gcloud compute instances create</code>,{" "}
            <code className="rounded bg-white/10 px-1 py-0.5">gcloud storage cp</code>).
          </p>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Cost & governance" title="Pricing Awareness from Day One">
          <Grid cols={4}>
            <ConceptCard icon={<DollarSign />} title="Pricing calculators" desc="Estimate before you build. Every provider ships one." />
            <ConceptCard icon={<Gauge />} title="Budgets & alerts" desc="Cap spend per project/team. Alert at 50/80/100%." />
            <ConceptCard icon={<LineChart />} title="Tagging" desc="Tag every resource by owner, env, cost-center — or you can't attribute spend." />
            <ConceptCard icon={<ShieldCheck />} title="Compliance" desc="Pick regions and controls to satisfy legal, regulatory, and contractual requirements." />
          </Grid>
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Cloud trades CapEx for OpEx and rents you global infrastructure.",
          "IaaS, PaaS, SaaS, and Serverless differ by what the provider manages on your behalf.",
          "Multi-AZ deployment is the cheapest high-availability lever; multi-region is for disaster recovery.",
          "Identity, networking, storage, observability, and cost tools exist on every major cloud — only the names differ.",
        ]}
      />
    </div>
  );
}

/* ================================================================
   SAAS TAB
   ================================================================ */

function IntroSaaS() {
  return (
    <div className="space-y-12">
      <TabHeroImage src={heroSaaS} alt="Product manager and robot reviewing SaaS dashboards" caption="Software as a service — subscriptions, dashboards, delight." />
      <Reveal>
        <QuickSummary
          items={[
            'SaaS = software delivered as a service — multi-tenant, subscription, cloud-hosted.',
            'Tenancy models: Silo (isolated), Pool (shared), Bridge (mixed stamps).',
            'Row-Level Security + tenant_id everywhere is the bedrock of pooled SaaS.',
            'Metering, billing, and per-tenant observability are product features, not plumbing.',
          ]}
        />
      </Reveal>

      <Reveal>
        <HeroCard
          icon={<Layers className="h-6 w-6" />}
          title="What is SaaS?"
          tag="SaaS · Architecture"
          body="SaaS is a business and delivery model: customers subscribe to software that the provider hosts, operates, secures, and updates over the network. NIST's cloud definition makes the distinction explicit — the consumer uses the provider's application and does not manage the underlying servers, OS, or storage. Crucially, SaaS answers how software is sold; multitenancy answers how customers are isolated inside it. They are related but distinct decisions, and they are often conflated."
        />
      </Reveal>

      <Reveal>
        <SubSection eyebrow="History" title="From WebEx to AI-Native SaaS">
          <Timeline
            items={[
              { year: "1995", title: "WebEx", desc: "Early web-based collaboration software, foreshadowing SaaS." },
              { year: "1998", title: "NetSuite", desc: "Web-delivered ERP — a flagship early SaaS example." },
              { year: "1999", title: "Salesforce", desc: "Popularizes browser-delivered CRM on a subscription model." },
              { year: "2006", title: "Public cloud arrives", desc: "AWS launches S3 and EC2 — SaaS economics expand." },
              { year: "2010s", title: "Multitenant maturity", desc: "Per-tenant isolation, deployment stamps, and tiered architectures become standard." },
              { year: "2020s", title: "AI-native SaaS", desc: "LLMs and agents reshape SaaS beyond traditional human-driven UIs." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="The isolation spectrum" title="Tenancy Models">
          <Diagram>
            <TenancyDiagram />
          </Diagram>
          <Table
            headers={["Model", "Isolation", "Onboarding speed", "Operational overhead", "Typical fit"]}
            rows={[
              ["Silo (dedicated)", "Highest", "Slow", "High (per-tenant infra)", "Regulated industries, large enterprise accounts"],
              ["Pool (shared)", "Logical (RLS / tenant_id)", "Fast", "Low — one stack to operate", "B2B and B2C SaaS at scale"],
              ["Bridge / Stamps", "Pooled by default, dedicated for premium", "Mixed", "Moderate", "Mid-scale B2B with premium tiers"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Match value to cost" title="Pricing Building Blocks">
          <Table
            headers={["Model", "How it works", "Best fit", "Main risk"]}
            rows={[
              ["Flat-rate", "One recurring price per plan", "Simple products, stable usage", "Bad fit when usage varies widely"],
              ["Per-seat", "Price scales with number of users", "Collaboration tools", "Customers share logins to dodge fees"],
              ["Tiered", "Bundled features/limits across tiers", "Multi-segment markets", "Complex packaging; decision paralysis"],
              ["Usage-based", "Pay per API call, GB, AI token, etc.", "Infra, API, AI-heavy products", "Unpredictable bills erode trust"],
              ["Freemium", "Free tier + paid upgrades", "Bottom-up product-led growth", "Conversion rates must justify free-tier cost"],
              ["Hybrid", "Subscription + usage overages", "Most modern SaaS", "More complex billing, but aligns revenue + cost"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Don't roll your own" title="Architecture Pillars">
          <Grid cols={4}>
            <ConceptCard icon={<KeyRound />} title="External Identity" desc="OAuth 2.0 + OpenID Connect via a managed IdP. Homegrown auth is a documented antipattern." />
            <ConceptCard icon={<Workflow />} title="Tenant Routing" desc="Resolve active tenant from subdomain, header, or JWT claim before authorization." />
            <ConceptCard icon={<Database />} title="Tenant-Aware Data" desc="Enforce tenant_id at the data layer (Row Level Security), not just in app code." />
            <ConceptCard icon={<Activity />} title="Per-Tenant Observability" desc="Latency, quota, noisy-neighbor alerts — sliced by tenant." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Reference architecture" title="A Modern Multitenant SaaS">
          <Diagram>
            <SaaSArchitectureDiagram />
          </Diagram>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Code starter" title="Tenant Resolution Middleware (Express)">
          <Code
            language="javascript"
            code={`// Representative middleware: resolve active tenant before authorization
async function resolveTenant(req, res, next) {
  try {
    const host = req.headers["x-forwarded-host"] || req.headers.host || "";
    const subdomain = host.split(".")[0];

    // Prefer JWT claim if present, fall back to subdomain
    const claim = req.auth?.payload?.tenant_slug;
    const slug = claim || subdomain;

    const tenant = await tenantCatalog.findBySlug(slug);
    if (!tenant) return res.status(404).json({ error: "tenant_not_found" });
    if (tenant.status !== "active") return res.status(423).json({ error: "tenant_suspended" });

    req.tenant = {
      id: tenant.id,
      slug: tenant.slug,
      plan: tenant.plan,
      region: tenant.region,
      dbLocator: tenant.db_locator,
    };
    return next();
  } catch (err) {
    return next(err);
  }
}`}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Data layer" title="PostgreSQL Row-Level Security for Pooled Tenants">
          <Code
            language="sql"
            code={`-- Pooled table with a tenant_id discriminator
CREATE TABLE app_tickets (
  id          uuid PRIMARY KEY,
  tenant_id   uuid NOT NULL,
  title       text NOT NULL,
  status      text NOT NULL,
  created_by  uuid NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: each request sees only its own tenant's rows.
-- The app sets the GUC at session start: SET app.tenant_id = '<uuid>';
CREATE POLICY tenant_isolation ON app_tickets
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- Index for tenant-scoped queries
CREATE INDEX idx_tickets_tenant ON app_tickets (tenant_id, created_at DESC);`}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Security: AuthN ≠ Isolation" title="A Minimum Control Set">
          <Table
            headers={["Control area", "Concrete control"]}
            rows={[
              ["Identity", "External OIDC IdP, PKCE for public clients, short-lived access tokens, refresh rotation"],
              ["Authorization", "RBAC + tenant scope on every request; deny by default"],
              ["Data isolation", "tenant_id on every row; RLS in the database; tenant scope in cache keys & queue messages"],
              ["Secrets", "Managed secret store; no secrets in env files or git"],
              ["Transport", "TLS everywhere; HSTS; modern ciphers"],
              ["Audit", "Append-only audit log of admin actions and data exports"],
              ["Operations", "Tested backup/restore; per-tenant export & delete; least-privilege ops tooling"],
              ["Threats", "Cross-tenant leakage, IDOR, tenant impersonation, broken cache isolation, noisy-neighbor DoS"],
              ["Compliance", "Map controls to NIST CSF 2.0; apply zero-trust principles"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="What to watch" title="Tenant-Aware Observability">
          <Grid cols={4}>
            <ConceptCard icon={<Gauge />} title="Route latency" desc="p50/p95/p99 per route AND per tenant — surface noisy tenants early." />
            <ConceptCard icon={<Users />} title="Top noisy tenants" desc="Rolling top-N by request rate, DB time, and AI token spend." />
            <ConceptCard icon={<AlertTriangle />} title="Auth failures" desc="Per-tenant auth failure rate flags credential-stuffing & misconfig." />
            <ConceptCard icon={<DollarSign />} title="Plan quota usage" desc="Track quota burn vs. plan; warn before throttling." />
          </Grid>
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "SaaS = sales/delivery model. Multitenancy = isolation architecture. Don't conflate them.",
          "Default to a pooled tier with bridge/stamps for premium or regulated accounts.",
          "Pick pricing metrics that map to BOTH customer value and your internal cost drivers.",
          "Enforce isolation at every layer: request, data, cache, jobs, storage, and ops tooling.",
        ]}
      />
    </div>
  );
}

/* ================================================================
   ITIL & KANBAN TAB
   ================================================================ */

function IntroITIL() {
  return (
    <div className="space-y-12">
      <TabHeroImage src={heroITIL} alt="IT service manager and robot at a Kanban board" caption="ITIL + Kanban — visualise work, flow value, delight users." />
      <Reveal>
        <QuickSummary
          items={[
            'ITIL 4 = value-driven service management: Incident, Problem, Change, Request.',
            'Kanban visualises flow — WIP limits and pull, not push, cut lead time.',
            'Combine ITIL practices with Kanban cadence for continuous, low-risk delivery.',
            'Measure lead time, cycle time, and change failure rate — not tickets closed.',
          ]}
        />
      </Reveal>

      <Reveal>
        <HeroCard
          icon={<KanbanSquare className="h-6 w-6" />}
          title="ITIL 4 + Kanban — Running Incident, Change, Problem & Request as one flow"
          tag="ITSM · Operating Model"
          body="Modern service management blends ITIL 4's four core practices — Incident, Change, Problem, and Service Request — with Kanban's visual flow, WIP limits, and cycle-time discipline. The result is a lightweight operating model that a greenfield team can stand up quickly, then scale from a 50-user startup to a 20,000-user enterprise without re-architecting."
        />
      </Reveal>

      <Reveal>
        <KeyTakeaways
          items={[
            "Service desk is the single entry point — separate incidents from requests at intake.",
            "Run incidents on a Kanban board with visible blockers and WIP limits per swimlane.",
            "Promote recurring incidents into Problem Management; permanent fixes flow through Change Enablement.",
            "Predefined, low-risk asks belong in a Service Catalog, not the incident queue.",
            "Start lean: taxonomy, ownership, SLAs, and a minimum viable catalog — automate later.",
          ]}
        />
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Value Stream" title="How the four practices fit together">
          <Diagram>
            <ITILFlowDiagram />
          </Diagram>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Incident Kanban" title="A board that scales from 3 analysts to 300">
          <Diagram>
            <KanbanBoardDiagram />
          </Diagram>
          <p className="mt-4 text-sm text-white/70">
            Each column has a WIP limit. When a column is full, upstream work stops until the team pulls a card
            through. Blocked cards get a red flag and a swarm rule for P1/P2 severity.
          </p>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Sizing" title="Right-sized posture by organization band">
          <Table
            headers={["Band", "Users", "Process posture", "Team shape", "Platform fit"]}
            rows={[
              ["Small", "50–200", "One queue, lightweight CAB, compact catalog", "Lead + 2–5 analysts", "Freshservice · ManageEngine · JSM"],
              ["Medium", "200–2,000", "Formal owners, change manager, problem reviews", "Manager + 5–20 analysts + admin", "JSM Premium · Freshservice Pro · ServiceNow"],
              ["Large", ">2,000", "Segregation of duties, CI linkage, audit evidence", "Regional desks, CAB, service owners", "ServiceNow · BMC Helix · JSM"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Roles" title="A minimum RACI that scales">
          <Table
            headers={["Role", "Incident", "Change", "Problem", "Request"]}
            rows={[
              ["Executive sponsor", "I", "I", "I", "I"],
              ["ITSM practice owner", "A", "A", "A", "A"],
              ["Service desk manager", "A", "C", "C", "A"],
              ["Service desk analyst", "R", "I", "C", "R"],
              ["Change manager", "C", "A/R", "C", "I"],
              ["Problem coordinator", "C", "C", "A/R", "I"],
              ["Resolver / SME", "R", "R", "R", "R"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Change Enablement" title="Three change classes, one workflow">
          <Grid cols={3}>
            <ConceptCard icon={<Zap />} title="Standard" desc="Pre-approved, repeatable, low risk. No CAB — just execute and record." />
            <ConceptCard icon={<Wrench />} title="Normal" desc="Assessed by CAB or peer review. Scheduled, tested, backed out on failure." />
            <ConceptCard icon={<AlertTriangle />} title="Emergency" desc="Fast-tracked with post-implementation review. Restore first, document immediately after." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="KPIs" title="What to measure — by size">
          <Table
            headers={["Metric", "Small target", "Medium target", "Large target"]}
            rows={[
              ["Mean time to restore (P1)", "< 4 h", "< 2 h", "< 1 h"],
              ["First-contact resolution", "> 55%", "> 65%", "> 70%"],
              ["Change success rate", "> 90%", "> 95%", "> 98%"],
              ["Emergency change ratio", "< 15%", "< 10%", "< 5%"],
              ["Problem-to-incident ratio", "1:30", "1:20", "1:15"],
              ["Catalog fulfillment SLA hit", "> 90%", "> 95%", "> 97%"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Launch" title="Pre-go-live checklist">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {[
                "Ticket taxonomy & priority matrix defined",
                "Assignment groups mapped to services",
                "Incident Kanban board with WIP limits",
                "Swarm rules for P1/P2 documented",
                "Standard change catalog seeded",
                "CAB cadence & authority defined",
                "Problem review meeting scheduled",
                "Minimum viable service catalog live",
                "Knowledge base seeded with top-20 articles",
                "Reporting pack + KPI baseline captured",
              ].map((it) => (
                <li key={it} className="flex items-start gap-2.5 text-sm text-white/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        </SubSection>
      </Reveal>
    </div>
  );
}

/* ================================================================
   LLM ENGINEERING TAB
   ================================================================ */

function IntroLLM() {
  return (
    <div className="space-y-12">
      <TabHeroImage src={heroLLM} alt="Developer and robot working with a large language model" caption="LLM engineering — prompt, retrieve, evaluate, ship." />
      <Reveal>
        <QuickSummary
          items={[
            'LLMs = Transformer models pretrained on huge corpora, then instruction/RLHF-tuned.',
            'Training scales with data, compute, and parameters — mixed precision + FSDP are table stakes.',
            'Inference is engineering: batching, quantization, KV cache, and served on Triton/vLLM.',
            'Evaluate with perplexity, BLEU/ROUGE, and human review — automated metrics alone mislead.',
          ]}
        />
      </Reveal>

      <Reveal>
        <HeroCard
          icon={<Cpu className="h-6 w-6" />}
          title="Building & Deploying Large Language Models"
          tag="LLM · From Architecture to Production"
          body="A practitioner's tour of the modern LLM stack — transformer variants, pretraining vs. fine-tuning, data curation, scaling laws, quantization & distillation, low-latency inference, and cloud deployment on AWS, GCP, and Azure. Optimized for engineers who need depth without a research paper."
        />
      </Reveal>

      <Reveal>
        <KeyTakeaways
          items={[
            "Transformers dominate: encoder-only (BERT), decoder-only (GPT/LLaMA), encoder–decoder (T5).",
            "Chinchilla scaling laws — for a fixed compute budget, more tokens beat more parameters.",
            "Start from an open base model (LLaMA/Mistral) and fine-tune; training from scratch rarely pays off.",
            "QLoRA (4-bit + LoRA) fine-tunes 65B models on a single 48 GB GPU.",
            "Inference wins come from batching, KV-cache reuse, quantization, and smart serving (vLLM, Triton).",
          ]}
        />
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Architectures" title="Three transformer families you'll actually ship">
          <Grid cols={3}>
            <ConceptCard icon={<Database />} title="Encoder-only" desc="BERT, RoBERTa, DeBERTa. Masked LM. 110M–340M params. Best for classification, retrieval, embeddings." />
            <ConceptCard icon={<Sparkles />} title="Decoder-only" desc="GPT, LLaMA, Mistral, Claude. Causal LM. 100M → 1T+ params. Best for generation & agents." />
            <ConceptCard icon={<Workflow />} title="Encoder–decoder" desc="T5, BART, mT5. Denoising objective. Best for translation, summarization, structured output." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Training Pipeline" title="Pretraining → Fine-tuning → RLHF">
          <NumberedSteps
            items={[
              { title: "Self-supervised pretraining", desc: "Trillions of tokens from Common Crawl, Wikipedia, books, code. Filter, dedupe, license-check." },
              { title: "Supervised fine-tuning (SFT)", desc: "Instruction-tuning on task or domain data. Use LoRA/QLoRA for parameter-efficient fine-tunes." },
              { title: "Preference alignment (RLHF/DPO)", desc: "Shape helpfulness, safety, and style using human preference pairs or direct preference optimization." },
              { title: "Evaluation harness", desc: "Perplexity, MMLU, task-specific benchmarks, red-team probes. Track regressions per commit." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Scaling" title="Compute · Cost · Latency by model size">
          <Table
            headers={["Params", "Pretrain cost", "Fine-tune cost", "Latency (single token, A100)", "Typical use"]}
            rows={[
              ["100M", "~$1K", "~$10", "< 5 ms", "Embeddings, classifiers"],
              ["1B", "~$50K", "~$50", "~10 ms", "Small chat, on-device"],
              ["7B", "~$500K", "~$50–500", "~25 ms", "General chat, RAG backends"],
              ["70B", "~$5M", "~$5K–50K", "~80 ms", "Assistants, agents, coding"],
              ["100B+", "~$50M+", "~$50K+", "~300 ms", "Frontier reasoning, SOTA benchmarks"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Optimization" title="Shrink & speed up before you serve">
          <Grid cols={3}>
            <ConceptCard icon={<Gauge />} title="Quantization" desc="INT8 / INT4 / FP8 with bitsandbytes or GPTQ — 2–4× smaller, minimal accuracy loss." />
            <ConceptCard icon={<GitBranch />} title="Distillation" desc="Teacher–student: transfer capability from a big model into a smaller, cheaper one." />
            <ConceptCard icon={<Boxes />} title="LoRA / QLoRA" desc="Train small adapter matrices instead of full weights. Ship many domain adapters over one base." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Serving" title="Reference inference architecture">
          <Diagram>
            <LLMArchitectureDiagram />
          </Diagram>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Code" title="Fine-tune with QLoRA (HuggingFace + PEFT)">
          <Code
            language="python"
            code={`from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import load_dataset

model_id = "mistralai/Mistral-7B-v0.1"
tok = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id, load_in_4bit=True, device_map="auto",
)
model = prepare_model_for_kbit_training(model)

lora = LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj","v_proj"],
                  lora_dropout=0.05, bias="none", task_type="CAUSAL_LM")
model = get_peft_model(model, lora)

ds = load_dataset("tatsu-lab/alpaca", split="train[:5%]")
ds = ds.map(lambda x: tok(x["text"], truncation=True, max_length=1024), batched=True)

Trainer(
    model=model,
    train_dataset=ds,
    args=TrainingArguments("out", per_device_train_batch_size=4,
                           gradient_accumulation_steps=4, num_train_epochs=1,
                           learning_rate=2e-4, fp16=True, logging_steps=20),
).train()`}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Cloud" title="Where to deploy">
          <Table
            headers={["Cloud", "Managed hosting", "Compute", "Best for"]}
            rows={[
              ["AWS", "SageMaker · Bedrock", "p4d/p5 (A100/H100), g5 (A10G)", "Regulated workloads, deep AWS integration"],
              ["GCP", "Vertex AI · HUGS", "TPU v5, A100 / L40S", "TPU-friendly training, BigQuery pipelines"],
              ["Azure", "Azure ML · Azure OpenAI", "ND-series (H100/A100)", "Microsoft-centric enterprises, Copilot stack"],
              ["Self-hosted K8s", "vLLM · Triton · TGI", "Bare-metal GPUs or spot", "Max control, lowest $/token at scale"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Safety & Compliance" title="Non-negotiables before you ship">
          <Grid cols={2}>
            <ConceptCard icon={<Lock />} title="Data governance" desc="Provenance logs, license compliance, PII scrubbing, DPIA for regulated data." />
            <ConceptCard icon={<ShieldCheck />} title="Model safety" desc="Red-team suites, jailbreak evals, output filtering, refusal policies, RAG grounding." />
            <ConceptCard icon={<Activity />} title="Observability" desc="Token-level tracing, cost per tenant, latency SLOs, drift & hallucination detectors." />
            <ConceptCard icon={<KeyRound />} title="Access control" desc="Per-tenant API keys, rate limits, prompt/response encryption, audit logs." />
          </Grid>
        </SubSection>
      </Reveal>
    </div>
  );
}

/* ================================================================
   ITIL / LLM DIAGRAMS
   ================================================================ */

function ITILFlowDiagram() {
  return (
    <div className="space-y-3">
      <DiagramRow label="User or Monitoring Event" tint="bg-emerald-500/15 border-emerald-400/30 text-emerald-50" />
      <DiagramArrow />
      <DiagramRow label="Service Desk · Intake · Classify" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-2">
        <DiagramRow label="Incident Management (Kanban)" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
        <DiagramRow label="Service Request (Catalog)" tint="bg-cyan-500/15 border-cyan-400/30 text-cyan-50" />
      </div>
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-2">
        <DiagramRow label="Problem Management (RCA)" tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50" />
        <DiagramRow label="Change Enablement (Std · Normal · Emergency)" tint="bg-rose-500/15 border-rose-400/30 text-rose-50" />
      </div>
      <DiagramArrow />
      <DiagramRow label="Validation · Knowledge · Known Error · Runbook" tint="bg-emerald-500/15 border-emerald-400/30 text-emerald-50" />
    </div>
  );
}

function KanbanBoardDiagram() {
  const cols = [
    { name: "Backlog", wip: "—", cards: ["INC-812", "INC-813", "INC-814"] },
    { name: "Triage", wip: "5", cards: ["INC-807", "INC-808"] },
    { name: "In Progress", wip: "3", cards: ["INC-802", "INC-803", "INC-804"] },
    { name: "Blocked", wip: "2", cards: ["INC-799 🚩"] },
    { name: "Done", wip: "—", cards: ["INC-791", "INC-790"] },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {cols.map((c) => (
        <div key={c.name} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-xs font-bold text-white">{c.name}</span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-neon-cyan">WIP {c.wip}</span>
          </div>
          <div className="space-y-1.5">
            {c.cards.map((card) => (
              <div
                key={card}
                className={`rounded-md px-2 py-1.5 text-[11px] font-medium ${
                  card.includes("🚩")
                    ? "border border-rose-400/40 bg-rose-500/20 text-rose-100"
                    : "border border-cyan-400/30 bg-cyan-500/15 text-cyan-50"
                }`}
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LLMArchitectureDiagram() {
  return (
    <div className="space-y-3">
      <DiagramRow label="Users · Clients · Agents" tint="bg-emerald-500/15 border-emerald-400/30 text-emerald-50" />
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-3">
        <DiagramRow label="API Gateway / WAF" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
        <DiagramRow label="Auth · Rate limit · Quotas" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
        <DiagramRow label="Router (model + tenant)" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
      </div>
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-3">
        <DiagramRow label="vLLM / Triton Pods (GPU)" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
        <DiagramRow label="KV-Cache + Redis" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
        <DiagramRow label="RAG · Vector DB" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
      </div>
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-2">
        <DiagramRow label="Model Registry (S3 / GCS)" tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50" />
        <DiagramRow label="Fine-tune Jobs · MLflow" tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50" />
      </div>
      <DiagramArrow />
      <DiagramRow label="Observability · Cost · Safety · Audit" tint="bg-rose-500/15 border-rose-400/30 text-rose-50" />
    </div>
  );
}



/* ================================================================
   GENAI IN RETAIL SUPPLY CHAINS TAB
   ================================================================ */

function IntroGenAIRetail() {
  return (
    <div className="space-y-12">
      <TabHeroImage src={heroRetail} alt="Shopper and robot assistant in a retail store with AI overlays" caption="GenAI in retail — personalise every aisle, every cart." />
      <Reveal>
        <QuickSummary
          items={[
            "Generative AI could unlock $240–$390B of value across retail supply chains (McKinsey).",
            "GenAI augments — not replaces — predictive ML: forecasts stay quantitative, GenAI adds reasoning, scenarios, and natural-language plans.",
            "High-impact stages: demand planning, procurement negotiation, warehouse ops, last-mile dispatch, and returns triage.",
            "Governance up front: privacy, EU AI Act readiness, human-in-the-loop for autonomous agents, kill-switches for rogue actions.",
          ]}
        />
      </Reveal>

      <Reveal>
        <HeroCard
          icon={<ShoppingCart className="h-6 w-6" />}
          title="Generative AI in Retail Supply Chains"
          tag="GenAI · Retail · Supply Chain"
          body="Generative AI creates novel plans, narratives, and decisions from prompts — a step beyond predictive AI's numeric forecasts. In retail supply chains, GenAI copilots and agents ingest sales, inventory, logistics, weather, and social data to draft assortments, negotiate contracts, orchestrate warehouses, dispatch last-mile fleets, and triage returns. Analysts project 1.2–1.9pp margin uplift and 20–50% forecast error reduction when adoption is disciplined and paired with clean data foundations."
        />
      </Reveal>

      <Reveal>
        <SubSection eyebrow="End-to-end map" title="Where GenAI Plugs Into the Supply Chain">
          <Diagram>
            <SupplyChainDiagram />
          </Diagram>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Use cases" title="GenAI Across Retail Stages">
          <Grid cols={3}>
            <ConceptCard icon={<LineChart />} title="Demand Planning" desc="Chat-based forecasting, what-if scenarios (supplier X fails), assortment narratives. Cuts forecast error 20–50%." />
            <ConceptCard icon={<Users />} title="Procurement" desc="Negotiation bots draft & counter RFQs; 65% of vendors preferred the AI negotiator in one Walmart pilot." />
            <ConceptCard icon={<Boxes />} title="Warehousing" desc="Copilots suggest layout, slotting, and pick paths; auto-generate SOPs and safety briefings." />
            <ConceptCard icon={<Workflow />} title="Inventory" desc="Agentic replenishment; explanation-first reorder proposals grounded in policy documents." />
            <ConceptCard icon={<Rocket />} title="Last-Mile" desc="Virtual dispatchers assist 10,000-vehicle fleets: route changes, roadside help, real-time exceptions." />
            <ConceptCard icon={<History />} title="Returns" desc="Read return reasons + damage photos → auto-classify, route, and draft customer replies." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Impact snapshot" title="KPIs & Documented Improvements">
          <Table
            headers={["Stage", "Key KPIs", "Documented Improvement"]}
            rows={[
              ["Demand Planning", "MAPE, bias, stockout rate", "Forecast error −20–50%; stockouts −65% (McKinsey)"],
              ["Procurement", "PPV, RFQ cycle time", "RFQ cycle −30%, spend −15% (Walmart pilot)"],
              ["Warehouse", "Picks/hr, labor cost", "Throughput +10–20%; documentation lead time −60%"],
              ["Last-Mile", "On-time %, cost per stop", "$30–35M annual savings on $2M invest (national parcel carrier)"],
              ["Returns", "Cycle time, refund accuracy", "Triage time −40–60% with vision + LLM classifier"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Adoption journey" title="From 12-month Pilot to 3-Year Scale">
          <NumberedSteps
            items={[
              { title: "Foundations (0–3 mo)", desc: "Data platform, MLOps, guardrails, choose 2–3 pilot use cases with clear ROI." },
              { title: "Pilots (3–12 mo)", desc: "Ship 5–10 use cases behind kill-switches; measure MAPE, PPV, throughput, savings." },
              { title: "Scale (12–24 mo)", desc: "Roll out proven agents cross-region; embed AI champions in each function." },
              { title: "Autonomous ops (24–36 mo)", desc: "Semi-autonomous replenishment and dispatch; GenAI narratives across planning + execution." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Vendor landscape" title="Platform Comparison">
          <Table
            headers={["Vendor / Platform", "Capabilities", "Deployment", "Pricing"]}
            rows={[
              ["Microsoft Dynamics 365 + Copilot", "Embedded Copilot for D365 SCM — planning, insights (Azure OpenAI)", "Cloud (Azure)", "SaaS per user"],
              ["Oracle Fusion Cloud SCM", "AI agents for planning, procurement, warehouse, maintenance", "Cloud (OCI)", "SaaS module-based"],
              ["Kinaxis RapidResponse", "Concurrent planning + AI forecasts; adding GenAI chat", "Cloud", "SaaS per user"],
              ["IBM watsonx Orchestrate", "Agentic AI for order processing and exception workflows", "Hybrid", "Usage + subscription"],
              ["MarkIt", "AI-native agent for global trade compliance + docs", "Cloud", "Per document / process"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Guardrails" title="Governance & Risk">
          <Grid cols={4}>
            <ConceptCard icon={<Lock />} title="Data Privacy" desc="Contract clauses on training data; PII minimisation and vendor-side isolation." />
            <ConceptCard icon={<ShieldCheck />} title="EU AI Act (2027)" desc="Classify supply-chain agents by risk; keep decision + training logs." />
            <ConceptCard icon={<AlertTriangle />} title="Human-in-the-loop" desc="Auto-actions capped by policy — no unscrutinised discounts or purchase orders." />
            <ConceptCard icon={<Wrench />} title="Kill-switches" desc="Every agent has an off-switch and a documented rollback playbook." />
          </Grid>
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Pair GenAI with predictive ML — GenAI reasons, ML forecasts. Together they outperform either alone.",
          "Start where humans already follow checklists (RFQ negotiation, return triage) — fastest ROI, lowest risk.",
          "Track MAPE, PPV, throughput, on-time %, and cost per unit — pick pilots that move real business KPIs.",
          "Governance is a product surface: policy, audit, kill-switch, human review are non-negotiable at scale.",
        ]}
      />
    </div>
  );
}

/* ================================================================
   MULTI-TENANT LLM APPLICATION TAB
   ================================================================ */

function IntroMultiTenant() {
  return (
    <div className="space-y-12">
      <TabHeroImage src={heroMultiTenant} alt="Architect and robot in front of a multi-tenant building diagram" caption="Multi-tenant SaaS — one platform, many isolated tenants." />
      <Reveal>
        <QuickSummary
          items={[
            "A modern LLM SaaS is: Transformer model + FastAPI inference + React UI + Kafka/RabbitMQ + Postgres/Mongo + K8s + CI/CD.",
            "Multi-tenancy = shared infra, isolated data. Choose Silo (per-tenant DB), Pool (shared with tenant_id + RLS), or Bridge (mixed stamps).",
            "Kafka for event streaming and pub/sub; RabbitMQ for task queues, RPC, and complex routing.",
            "Containerise everything, orchestrate with Kubernetes, secure with RBAC + JWT, ship via CI/CD with health checks and autoscaling.",
          ]}
        />
      </Reveal>

      <Reveal>
        <HeroCard
          icon={<Building2 className="h-6 w-6" />}
          title="Build a Multi-Tenant LLM Application"
          tag="LLM · SaaS · Cloud-Native"
          body="This module is the end-to-end blueprint: design and train a Transformer LLM, wrap it in a REST/gRPC inference service, front it with a React/TypeScript UI, wire in messaging (Kafka/RabbitMQ), model data in Postgres and MongoDB with tenant isolation, and orchestrate the whole stack on Kubernetes with CI/CD. Each layer maps to a decision — tenancy model, queue technology, database engine — and each decision has trade-offs we make explicit."
        />
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Stack overview" title="Reference Architecture">
          <Diagram>
            <MultiTenantArchDiagram />
          </Diagram>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Isolation" title="Tenancy Patterns">
          <Diagram>
            <TenancyDiagram />
          </Diagram>
          <Grid cols={3}>
            <ConceptCard icon={<Lock />} title="Silo" desc="Dedicated DB / cluster per tenant. Best isolation, highest cost. Regulated / enterprise plans." />
            <ConceptCard icon={<Layers />} title="Pool" desc="One shared stack; tenant_id everywhere + Postgres RLS. Best economics; needs discipline." />
            <ConceptCard icon={<GitBranch />} title="Bridge / Stamps" desc="Pool for small tenants, silo stamps for VIPs. Common at scale." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="LLM basics" title="Train → Serve Pipeline">
          <NumberedSteps
            items={[
              { title: "Data pipeline", desc: "Crawl → clean → dedupe → tokenise (BPE / SentencePiece). Quality > quantity." },
              { title: "Pretrain / Fine-tune", desc: "Foundation model + LoRA / PEFT for cheap adaptation. AdamW, warmup, gradient clipping." },
              { title: "Distributed training", desc: "FSDP or DeepSpeed ZeRO for models that don't fit on one GPU. Mixed precision (BF16)." },
              { title: "Evaluation", desc: "Perplexity, BLEU/ROUGE, plus human review. Automated metrics alone hide hallucinations." },
              { title: "Optimise inference", desc: "Quantise (INT8/FP16), batch, cache prompts, serve on Triton / vLLM." },
              { title: "Deploy", desc: "Containerise, Helm chart, Kubernetes Deployment + HPA, canary rollout." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Messaging" title="Kafka vs RabbitMQ — Pick the Right Tool">
          <Table
            headers={["Dimension", "Kafka", "RabbitMQ"]}
            rows={[
              ["Primary model", "Log-based pub/sub, consumer offsets", "Broker with exchanges + queues"],
              ["Best for", "Event streaming, analytics pipelines, high throughput", "Task queues, RPC, complex routing"],
              ["Ordering", "Per-partition ordered", "Per-queue ordered"],
              ["Retention", "Long (days–weeks); replayable", "Until consumed / ack'd"],
              ["Delivery", "At-least-once (default)", "At-most / at-least / exactly-once via ack + tx"],
              ["Ops complexity", "Higher (ZK/KRaft, partitions)", "Lower for typical workloads"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Data layer" title="Postgres or Mongo?">
          <Grid cols={2}>
            <ConceptCard icon={<Database />} title="PostgreSQL" desc="Relational, ACID, Row-Level Security for pooled multi-tenancy, streaming replication, logical partitioning." />
            <ConceptCard icon={<Database />} title="MongoDB" desc="Document, flexible schema, replica sets for HA, sharding on tenant_id for horizontal scale." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Kubernetes" title="Minimal Deployment Manifest">
          <Code
            language="yaml"
            code={`apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-server
spec:
  replicas: 3
  selector:
    matchLabels: { app: llm }
  template:
    metadata:
      labels: { app: llm }
    spec:
      containers:
        - name: llm
          image: registry.example.com/llm-server:\${SHA}
          resources:
            limits: { nvidia.com/gpu: "1", memory: "16Gi" }
          env:
            - name: TENANT_HEADER
              value: "X-Tenant-Id"
          readinessProbe:
            httpGet: { path: /healthz, port: 8080 }
---
apiVersion: v1
kind: Service
metadata: { name: llm-server }
spec:
  selector: { app: llm }
  ports: [{ port: 80, targetPort: 8080 }]`}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="CI/CD" title="Pipeline Stages">
          <Diagram>
            <CICDPipelineDiagram />
          </Diagram>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Security" title="Baseline Controls">
          <Grid cols={4}>
            <ConceptCard icon={<KeyRound />} title="RBAC + JWT" desc="Every request carries a tenant + role claim. Middleware enforces boundaries." />
            <ConceptCard icon={<ShieldCheck />} title="Row-Level Security" desc="Postgres RLS on tenant_id — even a bug can't leak across tenants." />
            <ConceptCard icon={<Gauge />} title="Quotas + Rate Limits" desc="Per-tenant token, request, and cost quotas prevent noisy-neighbour blow-ups." />
            <ConceptCard icon={<Activity />} title="Observability" desc="Structured logs, traces, per-tenant metrics; alert on latency + error budgets." />
          </Grid>
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Choose tenancy model early — refactoring from silo→pool (or the reverse) is painful.",
          "Kafka for streams and audit logs; RabbitMQ for task queues and RPC. Don't force one to be the other.",
          "Kubernetes + Helm + CI/CD is the paved road — spend time on golden templates, not one-off yamls.",
          "Security is per-tenant by default: RLS, quotas, and per-tenant observability from day one.",
        ]}
      />
    </div>
  );
}

/* ================================================================
   BUILDING & DEPLOYING LLMs WITH RAG TAB
   ================================================================ */

function IntroRAG() {
  return (
    <div className="space-y-12">
      <TabHeroImage src={heroRAG} alt="Researcher and robot retrieving documents from a knowledge library" caption="RAG — retrieve, ground, cite. Trustworthy AI answers." />
      <Reveal>
        <QuickSummary
          items={[
            "RAG = retrieve grounding docs from a vector store, then let the LLM generate an answer using them.",
            "The pipeline: chunk → embed → index (FAISS/Milvus/Pinecone/Weaviate) → ANN search → augment prompt → generate.",
            "Fine-tune cheaply with LoRA / PEFT — 10,000× fewer trainable params vs full fine-tuning.",
            "Latency comes from batching, quantisation, KV caching, ANN indexes, and edge caches — not one silver bullet.",
          ]}
        />
      </Reveal>

      <Reveal>
        <HeroCard
          icon={<Search className="h-6 w-6" />}
          title="Building & Deploying LLMs with RAG"
          tag="RAG · Vector Search · Inference"
          body="Retrieval-Augmented Generation grounds an LLM in your own documents so it stops hallucinating and starts citing. This module walks the full loop — data preparation, embedding strategy, vector databases, retrieval-then-generate vs fusion-in-decoder, LoRA fine-tuning, latency optimisation, secure deployment on AWS/GCP/Azure, and a production-readiness checklist."
        />
      </Reveal>

      <Reveal>
        <SubSection eyebrow="The core loop" title="RAG Pipeline">
          <Diagram>
            <RAGPipelineDiagram />
          </Diagram>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Data prep" title="From Raw Docs to Retrievable Chunks">
          <NumberedSteps
            items={[
              { title: "Collect", desc: "Aggregate domain corpora — docs, FAQs, tickets, contracts, wikis." },
              { title: "Clean & dedupe", desc: "Unicode fix, boilerplate strip, exact + fuzzy + semantic dedupe (NVIDIA guidance)." },
              { title: "Redact PII", desc: "Regex + ML detectors for names/emails/IDs. Consider differential privacy for sensitive domains." },
              { title: "Chunk", desc: "200–500 tokens per chunk; overlap when context continuity matters." },
              { title: "Embed", desc: "SentenceTransformers / OpenAI embeddings. L2-normalise before indexing." },
              { title: "Index", desc: "FAISS (local), Milvus / Weaviate (self-host), Pinecone (managed). IVF-PQ or HNSW." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Vector databases" title="Pick a Vector Store">
          <Table
            headers={["Store", "Hosting", "Strengths", "Watch out for"]}
            rows={[
              ["FAISS", "Library (local)", "Fastest for in-process ANN, no ops", "No persistence / multi-tenant story out of the box"],
              ["Milvus", "Self-host / cloud", "Scale-out, hybrid search, GPU acceleration", "Ops complexity"],
              ["Pinecone", "Managed SaaS", "Zero ops, incremental indexing, filters", "Vendor lock-in and cost at scale"],
              ["Weaviate", "Self-host / cloud", "Built-in vectorizers, GraphQL, hybrid search", "Less mature multi-region story"],
              ["pgvector", "Postgres extension", "Reuse your existing DB + RLS", "Slower for 100M+ vectors; needs HNSW"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Fine-tune cheaply" title="LoRA / PEFT in ~15 Lines">
          <Code
            language="python"
            code={`from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model

model = AutoModelForCausalLM.from_pretrained("gpt2")
tokenizer = AutoTokenizer.from_pretrained("gpt2")

lora = LoraConfig(
    task_type="CAUSAL_LM",
    r=8,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj"],
    lora_dropout=0.05,
)
model = get_peft_model(model, lora)
model.print_trainable_parameters()   # ~0.1% of total params

# Train as usual — only the LoRA adapters update.`}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Serve fast" title="Inference Latency Levers">
          <Grid cols={4}>
            <ConceptCard icon={<Zap />} title="Quantise" desc="INT8 / FP16 via TensorRT-LLM or bitsandbytes — 2–4× speedup, small quality loss." />
            <ConceptCard icon={<Gauge />} title="Batch + KV cache" desc="Dynamic batching on Triton / vLLM; reuse KV for streaming tokens." />
            <ConceptCard icon={<Database />} title="Approximate KNN" desc="HNSW / IVF-PQ over exact cosine — recall stays high, latency drops." />
            <ConceptCard icon={<Cloud />} title="Edge cache" desc="Redis for identical prompts; CDN for static system prompts and few-shots." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Cloud choice" title="Where to Run It">
          <Table
            headers={["Cloud", "Managed LLM Service", "Highlights"]}
            rows={[
              ["AWS", "SageMaker Endpoints / Bedrock", "Broad GPU inventory (A100/H100), Bedrock foundation-model API"],
              ["GCP", "Vertex AI / Model Garden", "TPU access, tight BigQuery integration"],
              ["Azure", "Azure OpenAI Service / AI Foundry", "Enterprise GPT-4/5, private networking, compliance"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Production checklist" title="Before You Ship">
          <Grid cols={4}>
            <ConceptCard icon={<ShieldCheck />} title="Security" desc="PII redaction, prompt-injection defence, tenant-scoped indexes." />
            <ConceptCard icon={<Activity />} title="Observability" desc="Trace prompt → retrieved docs → completion. Log latency, tokens, cost." />
            <ConceptCard icon={<Wrench />} title="Evaluation" desc="Golden set + LLM-as-judge + human review; alert on regression." />
            <ConceptCard icon={<Rocket />} title="Autoscaling" desc="Target 70% GPU utilisation; scale on QPS + queue depth, not just CPU." />
          </Grid>
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "RAG beats naked LLMs on factuality — grounding is cheaper than retraining.",
          "Chunking + embedding quality drives retrieval accuracy more than the model size.",
          "LoRA / PEFT makes domain adaptation affordable for small teams.",
          "Ship with evaluation harnesses, per-tenant observability, and a rollback plan — treat the LLM like a database.",
        ]}
      />
    </div>
  );
}

/* ================================================================
   NEW DIAGRAMS
   ================================================================ */

function SupplyChainDiagram() {
  const stages = ["Plan", "Source", "Make / Store", "Move", "Deliver", "Return"];
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-6">
        {stages.map((s) => (
          <div key={s} className="rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-3 py-2 text-center text-xs font-semibold text-cyan-50 backdrop-blur">
            {s}
          </div>
        ))}
      </div>
      <div className="flex justify-center text-white/40">↓</div>
      <div className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/15 px-4 py-3 text-center text-sm font-semibold text-fuchsia-50 backdrop-blur">
        GenAI Agents · Copilots · Forecast + Scenario Reasoning
      </div>
      <div className="flex justify-center text-white/40">↓</div>
      <div className="grid gap-2 sm:grid-cols-3">
        <DiagramRow label="ERP · WMS · TMS" tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50" />
        <DiagramRow label="Data Platform + Feature Store" tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50" />
        <DiagramRow label="External Signals (weather · social · macro)" tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50" />
      </div>
    </div>
  );
}

function MultiTenantArchDiagram() {
  return (
    <div className="space-y-3">
      <DiagramRow label="React / TypeScript UI (per-tenant subdomain)" tint="bg-emerald-500/15 border-emerald-400/30 text-emerald-50" />
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-3">
        <DiagramRow label="API Gateway + JWT" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
        <DiagramRow label="OIDC Identity Provider" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
        <DiagramRow label="Rate Limits + Quotas" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
      </div>
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-3">
        <DiagramRow label="FastAPI Inference (GPU)" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
        <DiagramRow label="App Services" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
        <DiagramRow label="Workers" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
      </div>
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-2">
        <DiagramRow label="Kafka (events / audit)" tint="bg-cyan-500/15 border-cyan-400/30 text-cyan-50" />
        <DiagramRow label="RabbitMQ (task queues / RPC)" tint="bg-cyan-500/15 border-cyan-400/30 text-cyan-50" />
      </div>
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-2">
        <DiagramRow label="PostgreSQL + Row-Level Security" tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50" />
        <DiagramRow label="MongoDB Replica Set" tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50" />
      </div>
      <DiagramArrow />
      <DiagramRow label="Kubernetes · Helm · CI/CD · Observability" tint="bg-rose-500/15 border-rose-400/30 text-rose-50" />
    </div>
  );
}

function CICDPipelineDiagram() {
  const steps = ["Commit", "CI Build + Test", "Docker Image", "Registry", "K8s Rollout", "Canary + Monitor"];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
            {s}
          </div>
          {i < steps.length - 1 && <span className="text-white/40">→</span>}
        </div>
      ))}
    </div>
  );
}

function RAGPipelineDiagram() {
  const steps = [
    { label: "User Query", icon: <Users className="h-4 w-4" /> },
    { label: "Embed", icon: <Sparkles className="h-4 w-4" /> },
    { label: "Vector ANN Search", icon: <Search className="h-4 w-4" /> },
    { label: "Top-K Docs", icon: <Database className="h-4 w-4" /> },
    { label: "Augmented Prompt", icon: <Code2 className="h-4 w-4" /> },
    { label: "LLM Answer", icon: <Brain className="h-4 w-4" /> },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
            <span className="text-neon-cyan">{s.icon}</span>
            {s.label}
          </div>
          {i < steps.length - 1 && <span className="text-white/40">→</span>}
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   QUICK SUMMARY GUIDE
   ================================================================ */

function QuickSummary({ items }: { items: string[] }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/10 via-white/[0.03] to-fuchsia-500/10 p-4 shadow-glow backdrop-blur-xl sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-white">
          <Zap className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-neon-cyan">Quick Summary Guide</div>
          <div className="font-display text-base font-bold text-white">Read this first — the whole module in 30 seconds</div>
        </div>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm text-white/85 sm:p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-neon-cyan" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================================================================
   REUSABLE PRESENTATION COMPONENTS
   ================================================================ */


function HeroCard({ icon, title, tag, body }: { icon: React.ReactNode; title: string; tag: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-flashy rounded-3xl glass-strong p-5 shadow-glow sm:p-8 md:p-10"
    >
      <div className="relative z-[3] flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-start">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur sm:h-14 sm:w-14">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <Badge className="w-fit bg-white/10 text-white hover:bg-white/15">{tag}</Badge>
          <h2 className="mt-3 font-display text-xl font-bold text-white sm:text-2xl md:text-3xl">{title}</h2>
          <p className="mt-3 text-sm text-white/75 sm:text-base">{body}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SubSection({
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
        <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-white/65">{subtitle}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Grid({ cols = 4, children }: { cols?: 2 | 3 | 4; children: React.ReactNode }) {
  const colClass = cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  return <div className={`grid gap-3 sm:gap-4 ${colClass}`}>{children}</div>;
}

function ConceptCard({ icon, title, desc }: { icon?: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="card-flashy group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-shadow hover:shadow-glow sm:p-5"
    >
      {icon && (
        <div className="relative z-[3] mb-3 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white sm:h-10 sm:w-10">
          {icon}
        </div>
      )}
      <h3 className="relative z-[3] text-sm font-semibold text-white group-hover:text-gradient sm:text-base">{title}</h3>
      <p className="relative z-[3] mt-2 text-sm text-white/65">{desc}</p>
    </motion.div>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-neon sm:h-10 sm:w-10">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white sm:text-base">{title}</h3>
          <p className="mt-2 text-sm text-white/70">{body}</p>
        </div>
      </div>
    </div>
  );
}

function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <Reveal>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-4 backdrop-blur-xl sm:p-7">
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

function Timeline({ items }: { items: { year: string; title: string; desc: string }[] }) {
  return (
    <div className="relative">
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-cyan-400/60 via-fuchsia-500/40 to-transparent sm:left-[11px]" />
      <ol className="space-y-4 sm:space-y-5">
        {items.map((it) => (
          <li key={it.year + it.title} className="relative pl-7 sm:pl-10">
            <span className="absolute left-0 top-1.5 grid h-[15px] w-[15px] place-items-center rounded-full bg-brand-gradient shadow-neon sm:h-[23px] sm:w-[23px]">
              <History className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
            </span>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl sm:p-4">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-mono text-xs font-semibold text-neon-cyan">{it.year}</span>
                <h3 className="text-sm font-semibold text-white">{it.title}</h3>
              </div>
              <p className="mt-1.5 text-sm text-white/65">{it.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function NumberedSteps({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <ol className="grid gap-3 sm:gap-4 sm:grid-cols-2">
      {items.map((it, idx) => (
        <li
          key={it.title}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-shadow hover:shadow-glow sm:p-5"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-gradient text-sm font-bold text-white shadow-neon">
              {idx + 1}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-white">{it.title}</h3>
              <p className="mt-1 text-sm text-white/65">{it.desc}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neon-cyan">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                {row.map((c, j) => (
                  <td key={j} className="px-4 py-3 align-top text-white/75">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Code({ language, code }: { language: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0d1a]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-neon-cyan" />
          <span className="font-mono text-xs uppercase tracking-wider text-white/60">{language}</span>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-white/85">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

function Diagram({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl">
      {children}
    </div>
  );
}

/* ---------- SVG / layout diagrams ---------- */

function StackDiagram({ layers }: { layers: { label: string; tint: string }[] }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-2">
      {layers.map((l, i) => (
        <motion.div
          key={l.label}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className={`relative rounded-xl border border-white/10 bg-gradient-to-r ${l.tint} px-5 py-3 text-sm font-medium text-white shadow-glow`}
          style={{ marginLeft: `${i * 14}px`, marginRight: `${i * 14}px` }}
        >
          {l.label}
        </motion.div>
      ))}
    </div>
  );
}

function AgentLoopDiagram() {
  const steps = [
    { label: "Observe", icon: <Activity className="h-4 w-4" /> },
    { label: "Decide", icon: <Brain className="h-4 w-4" /> },
    { label: "Use Tools", icon: <Workflow className="h-4 w-4" /> },
    { label: "Act", icon: <Rocket className="h-4 w-4" /> },
    { label: "Evaluate", icon: <CheckCircle2 className="h-4 w-4" /> },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
            <span className="text-neon-cyan">{s.icon}</span>
            {s.label}
          </div>
          {i < steps.length - 1 ? (
            <span className="text-white/40">→</span>
          ) : (
            <span className="text-white/40">↻</span>
          )}
        </div>
      ))}
    </div>
  );
}

function ServiceModelDiagram() {
  const cols = [
    { name: "On-Prem", you: ["Apps", "Data", "Runtime", "OS", "Virt.", "Servers", "Storage", "Network"] },
    { name: "IaaS", you: ["Apps", "Data", "Runtime", "OS"], them: ["Virt.", "Servers", "Storage", "Network"] },
    { name: "PaaS", you: ["Apps", "Data"], them: ["Runtime", "OS", "Virt.", "Servers", "Storage", "Network"] },
    { name: "SaaS", you: [], them: ["Apps", "Data", "Runtime", "OS", "Virt.", "Servers", "Storage", "Network"] },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cols.map((c) => (
        <div key={c.name} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur">
          <div className="mb-2 font-display text-sm font-bold text-white">{c.name}</div>
          <div className="space-y-1">
            {[...(c.you || []).map((l) => ({ l, kind: "you" as const })), ...(c.them || []).map((l) => ({ l, kind: "them" as const }))].map(
              ({ l, kind }) => (
                <div
                  key={l}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                    kind === "you"
                      ? "bg-fuchsia-500/20 text-fuchsia-100"
                      : "bg-cyan-500/15 text-cyan-100"
                  }`}
                >
                  {l}
                </div>
              ),
            )}
          </div>
        </div>
      ))}
      <div className="col-span-2 mt-2 flex justify-center gap-4 text-xs text-white/60 sm:col-span-4">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-fuchsia-500/50" /> You manage
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500/40" /> Provider manages
        </span>
      </div>
    </div>
  );
}

function CloudArchitectureDiagram() {
  return (
    <div className="space-y-3">
      <DiagramRow label="Users / Apps" tint="bg-emerald-500/15 border-emerald-400/30 text-emerald-50" />
      <DiagramArrow />
      <DiagramRow label="IAM · RBAC · Policies" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
      <DiagramArrow />
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-neon-cyan">Region</div>
        <div className="grid gap-2 sm:grid-cols-3">
          <DiagramRow label="Zone A" tint="bg-cyan-500/15 border-cyan-400/30 text-cyan-50" />
          <DiagramRow label="Zone B" tint="bg-cyan-500/15 border-cyan-400/30 text-cyan-50" />
          <DiagramRow label="Zone C" tint="bg-cyan-500/15 border-cyan-400/30 text-cyan-50" />
        </div>
        <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <div className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-white/60">Virtual Network</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <DiagramRow label="VMs" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
            <DiagramRow label="Containers / K8s" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
            <DiagramRow label="Serverless" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
          </div>
        </div>
      </div>
      <DiagramArrow />
      <DiagramRow label="Storage · Databases · Managed Services" tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50" />
    </div>
  );
}

function TenancyDiagram() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        { name: "Silo", tenants: ["T1"], stacks: 1, hint: "Dedicated infra per tenant" },
        { name: "Pool", tenants: ["T1", "T2", "T3", "T4"], stacks: 1, hint: "One shared stack, tenant_id everywhere" },
        { name: "Bridge / Stamps", tenants: ["T1", "T2", "T3"], stacks: 2, hint: "Pooled + dedicated stamps" },
      ].map((m) => (
        <div key={m.name} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="mb-3 text-center font-display text-sm font-bold text-white">{m.name}</div>
          <div className="space-y-2">
            <div className="flex flex-wrap justify-center gap-1.5">
              {m.tenants.map((t) => (
                <span key={t} className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-100">
                  {t}
                </span>
              ))}
            </div>
            <div className="flex justify-center">
              <span className="text-white/40">↓</span>
            </div>
            <div className={`grid gap-2 ${m.stacks === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {Array.from({ length: m.stacks }).map((_, i) => (
                <div key={i} className="rounded-md border border-cyan-400/30 bg-cyan-500/15 px-2 py-2 text-center text-[11px] text-cyan-50">
                  App + DB
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-white/55">{m.hint}</p>
        </div>
      ))}
    </div>
  );
}

function SaaSArchitectureDiagram() {
  return (
    <div className="space-y-3">
      <DiagramRow label="Customer Tenants (subdomains, mobile, API clients)" tint="bg-emerald-500/15 border-emerald-400/30 text-emerald-50" />
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-3">
        <DiagramRow label="CDN / WAF" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
        <DiagramRow label="OIDC IdP" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
        <DiagramRow label="API Gateway" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
      </div>
      <DiagramArrow />
      <DiagramRow label="Tenant Resolver Middleware (subdomain / JWT / header)" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-3">
        <DiagramRow label="App Services (pooled)" tint="bg-cyan-500/15 border-cyan-400/30 text-cyan-50" />
        <DiagramRow label="Background Jobs" tint="bg-cyan-500/15 border-cyan-400/30 text-cyan-50" />
        <DiagramRow label="Per-Tenant Cache" tint="bg-cyan-500/15 border-cyan-400/30 text-cyan-50" />
      </div>
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-2">
        <DiagramRow label="Pooled Postgres + Row-Level Security" tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50" />
        <DiagramRow label="Premium Stamps (dedicated DB/region)" tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50" />
      </div>
      <DiagramArrow />
      <DiagramRow label="Observability · Billing · Audit · Backups" tint="bg-rose-500/15 border-rose-400/30 text-rose-50" />
    </div>
  );
}

function DiagramRow({ label, tint }: { label: string; tint: string }) {
  return (
    <div className={`rounded-xl border px-4 py-2.5 text-center text-sm font-medium backdrop-blur ${tint}`}>{label}</div>
  );
}

function DiagramArrow() {
  return (
    <div className="flex justify-center">
      <span className="text-white/40">↓</span>
    </div>
  );
}

/* ================================================================
   MULTI-AGENT SYSTEMS TAB
   ================================================================ */

const MAS_PATTERN_SCORES = [
  { pattern: "Centralized", scalability: 4, resilience: 3, optimality: 9, simplicity: 8 },
  { pattern: "Decentralized", scalability: 9, resilience: 9, optimality: 5, simplicity: 5 },
  { pattern: "Peer-to-peer", scalability: 8, resilience: 8, optimality: 4, simplicity: 4 },
  { pattern: "Blackboard", scalability: 5, resilience: 6, optimality: 7, simplicity: 4 },
  { pattern: "Broker", scalability: 7, resilience: 6, optimality: 7, simplicity: 6 },
  { pattern: "Hierarchical", scalability: 8, resilience: 7, optimality: 8, simplicity: 6 },
];

const MAS_TRANSPORT_RADAR = [
  { axis: "Latency", "ROS 2 / DDS": 9, "MQTT v5": 7, gRPC: 9, REST: 4 },
  { axis: "Throughput", "ROS 2 / DDS": 9, "MQTT v5": 6, gRPC: 8, REST: 5 },
  { axis: "Typed contracts", "ROS 2 / DDS": 8, "MQTT v5": 4, gRPC: 9, REST: 5 },
  { axis: "Interoperability", "ROS 2 / DDS": 5, "MQTT v5": 8, gRPC: 7, REST: 10 },
  { axis: "Ops simplicity", "ROS 2 / DDS": 4, "MQTT v5": 8, gRPC: 7, REST: 9 },
  { axis: "QoS control", "ROS 2 / DDS": 10, "MQTT v5": 7, gRPC: 5, REST: 3 },
];

const MAS_VIDEOS = [
  {
    id: "kopoLzvh5jY",
    title: "Multi-Agent Hide and Seek",
    author: "OpenAI",
    note: "Emergent tool use and counter-strategies from self-play — the classic demonstration of learning agents.",
  },
  {
    id: "qgb0gyrpiGk",
    title: "Introduction to Multi-Agent Reinforcement Learning",
    author: "MATLAB",
    note: "Centralised vs decentralised training, non-stationarity, and reward shaping for MARL.",
  },
  {
    id: "QzHaNSgWdlI",
    title: "ROS 2 Multi-Robot Simulation: Autonomous Fleet Control",
    author: "Felipe Alves",
    note: "Fleet coordination over ROS 2 / DDS — namespacing, topics, and shared world state in simulation.",
  },
  {
    id: "6dCbe4ItxPY",
    title: "ROS 2 multi-robot: namespacing, teleop, SLAM Toolbox & Nav2",
    author: "Alysson Ribeiro da Silva",
    note: "Hands-on walkthrough of the runtime plumbing behind a multi-robot stack.",
  },
  {
    id: "cc8Sd2vVG9M",
    title: "Multi-Agent Negotiation — Contract Net Protocol explained",
    author: "Padhai Nest",
    note: "CFP → propose → accept/reject: the allocation protocol used in the warehouse reference design.",
  },
  {
    id: "tBEOf6xzEeo",
    title: "3D Swarm in the Real World: Robot Swarms Guided by a UAV",
    author: "More-Than-One Robotics Laboratory",
    note: "Local rules, no central planner — swarm behaviour on real hardware.",
  },
];

function VideoCard({ id, title, author, note }: { id: string; title: string; author: string; note: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:border-neon-cyan/50">
      <div className="relative aspect-video w-full bg-black/40">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${title}`}
            className="absolute inset-0 h-full w-full"
          >
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt={title}
              width={480}
              height={360}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 grid place-items-center bg-black/25 transition group-hover:bg-black/10">
              <PlayCircle className="h-14 w-14 text-white drop-shadow-lg" />
            </span>
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-neon-cyan">{author}</div>
        <h4 className="mt-1 font-display text-sm font-bold text-white sm:text-base">{title}</h4>
        <p className="mt-1.5 text-sm text-white/70">{note}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-4 backdrop-blur-xl sm:p-6">
      <div className="mb-4">
        <div className="font-display text-base font-bold text-white">{title}</div>
        <p className="text-sm text-white/60">{subtitle}</p>
      </div>
      <div className="h-[320px] w-full">{children}</div>
    </div>
  );
}

function MASLayerDiagram() {
  return (
    <StackDiagram
      layers={[
        { label: "Environment / market / plant — sensors, actuators, external APIs", tint: "border-white/10 bg-white/5 text-white/80" },
        { label: "Agent layer — reactive · deliberative / BDI · learning agents", tint: "border-blue-400/30 bg-blue-400/10 text-white" },
        { label: "Coordination & semantics — directory, negotiation, planning, ontologies", tint: "border-cyan-400/30 bg-cyan-400/10 text-white" },
        { label: "Communication substrate — DDS · MQTT · gRPC · REST · message schemas", tint: "border-fuchsia-400/30 bg-fuchsia-400/10 text-white" },
        { label: "Operations & trust — security policy, telemetry, tracing, CI/CD", tint: "border-emerald-400/30 bg-emerald-400/10 text-white" },
      ]}
    />
  );
}

function ContractNetDiagram() {
  const steps = [
    { label: "Task arrives", icon: <Workflow className="h-4 w-4" /> },
    { label: "CFP broadcast", icon: <Radio className="h-4 w-4" /> },
    { label: "Proposals (cost · ETA · battery)", icon: <Share2 className="h-4 w-4" /> },
    { label: "Accept / reject", icon: <CheckCircle2 className="h-4 w-4" /> },
    { label: "Reserve resources", icon: <Lock className="h-4 w-4" /> },
    { label: "inform-progress → inform-result", icon: <Activity className="h-4 w-4" /> },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
            <span className="text-neon-cyan">{s.icon}</span>
            {s.label}
          </div>
          {i < steps.length - 1 && <span className="text-white/40">→</span>}
        </div>
      ))}
    </div>
  );
}

function SwarmDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {["Robot i", "Robot j"].map((robot) => (
        <div key={robot} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Bot className="h-4 w-4 text-neon-cyan" /> {robot}
          </div>
          <div className="space-y-2">
            {["Local sensing", "Reactive safety loop", "Local planner / policy", "Neighbour coordination"].map((l) => (
              <DiagramRow key={l} label={l} tint="border-white/10 bg-white/5 text-white/80" />
            ))}
          </div>
        </div>
      ))}
      <p className="sm:col-span-2 text-center text-xs text-white/50">
        No remote planner sits in the safety loop. Neighbour messages carry compact intent, never full world models.
      </p>
    </div>
  );
}

function IntroMAS() {
  return (
    <div className="space-y-12">
      <TabHeroImage
        src={heroMAS}
        alt="Engineer coordinating a group of autonomous robots with a holographic agent network graph"
        caption="Multi-agent systems — autonomy at the edges, explicit coordination in the middle."
      />

      <Reveal>
        <QuickSummary
          items={[
            "A MAS is not “many agents” — it is coordination topology + timing model + trust boundary, decided before any framework.",
            "Pick the fabric by workload: ROS 2 / DDS for real-time robotics, MQTT v5 for constrained IoT, gRPC for typed service calls, REST for partner interop.",
            "FIPA ACL still earns its place as the semantic conversation layer (performative, ontology, conversation-id, deadlines) on top of a modern transport.",
            "Simulate first — Gazebo, Webots, PettingZoo, VMAS, Unity ML-Agents, ABIDES — and benchmark the socio-technical system, not one agent's IQ.",
            "Zero trust by default: NIST SP 800-207 + AI RMF, DDS Security / SROS 2, OAuth 2.0 / OIDC / mTLS, OpenTelemetry traces without raw payloads.",
          ]}
        />
      </Reveal>

      <Reveal>
        <HeroCard
          icon={<Bot className="h-6 w-6" />}
          title="Building Multi-Agent Systems"
          tag="MAS · Coordination · Robotics · Markets"
          body="A distributed architecture in which autonomous processes sense an environment, reason under partial information, coordinate through explicit protocols, and act through tools, APIs, or actuators. This module walks the full engineering path — MAS taxonomy, layered reference architecture, coordination patterns, protocol and framework selection, ontology strategy, simulation and benchmarking, fault tolerance and security, and three end-to-end reference designs (swarm, warehouse, marketplace) with an implementation roadmap."
        />
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Taxonomy" title="Six Kinds of Agent, Six Failure Modes">
          <Table
            headers={["MAS type", "Core control idea", "Strengths", "Main liabilities", "Best fit"]}
            rows={[
              ["Reactive", "Tight perception-to-action coupling, minimal symbolic state", "Very low latency, robust under fast dynamics", "Weak long-horizon planning and explainability", "Obstacle avoidance, local safety controllers"],
              ["Deliberative", "Explicit world/task models with planning or search", "Long-horizon optimisation, constraint handling", "Higher latency, model brittleness", "Mission planning, scheduling, optimisation agents"],
              ["Hybrid", "Reactive layer for immediacy + deliberative layer for goals", "Balances responsiveness and strategy", "Integration complexity, fragile arbitration", "Mobile robots, warehouse orchestration, CPS"],
              ["BDI", "Beliefs, desires, intentions with explicit commitments", "Interpretable commitment model, mature literature", "Engineering cost above pure reactive", "Enterprise decision support, human-agent workflows"],
              ["Learning agents", "Policy/value adaptation via RL or MARL", "Exploits complex patterns, adapts online or offline", "Sample inefficiency, non-stationarity, reproducibility", "Simulation-rich domains, routing, market policy"],
              ["Swarm", "Many simple agents following local rules", "Excellent scalability, graceful degradation", "Weak global guarantees without careful design", "Coverage, flocking, search, distributed monitoring"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Reference architecture" title="Five Layers That Change Independently">
          <Diagram>
            <MASLayerDiagram />
          </Diagram>
          <div className="mt-6">
            <Grid cols={4}>
              <ConceptCard icon={<Cpu />} title="Agent runtime" desc="Lifecycle, local state, behaviours, bounded mailbox, tool access. JADE, SPADE, ROS 2 nodes, RLlib policies." />
              <ConceptCard icon={<Globe2 />} title="Environment model" desc="World / simulation / market state and dynamics. Gazebo, Webots, Unity, VMAS, ABIDES, Open-RMF." />
              <ConceptCard icon={<Network />} title="Communication middleware" desc="Discovery, routing, delivery semantics, QoS, backpressure. DDS, MQTT v5, gRPC, HTTP/REST, XMPP." />
              <ConceptCard icon={<Database />} title="Schema & serialization" desc="Type contracts, versioning, validation. Protobuf, ROS IDL, JSON Schema, FIPA ACL parameters." />
              <ConceptCard icon={<Search />} title="Directory services" desc="White pages / yellow pages, capability registration and matching. FIPA AMS + DF, ROS graph, broker registries." />
              <ConceptCard icon={<Brain />} title="Planning & reasoning" desc="Task decomposition, scheduling, constraint solving, BDI plan execution." />
              <ConceptCard icon={<Activity />} title="Observability" desc="OpenTelemetry traces + Prometheus metrics keyed on conversation-id, not raw payloads." />
              <ConceptCard icon={<ShieldCheck />} title="Security & policy" desc="Zero trust, DDS Security / SROS 2, OAuth 2.0 / OIDC / mTLS, admissibility checks." />
            </Grid>
          </div>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Interactive" title="Coordination Patterns Scored">
          <ChartCard
            title="Pattern trade-off profile"
            subtitle="Qualitative 0–10 scores. Hover a bar for the exact value — nothing scores high on every axis."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MAS_PATTERN_SCORES} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="pattern" tick={{ fontSize: 11 }} interval={0} angle={-12} dy={8} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <RTooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="scalability" name="Scalability" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resilience" name="Resilience" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="optimality" name="Global optimality" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="simplicity" name="Operational simplicity" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <div className="mt-6">
            <Table
              headers={["Pattern", "Strengths", "Risks", "Best domains"]}
              rows={[
                ["Centralized", "Simpler optimisation, easier governance and debugging", "Single bottleneck, weaker fault isolation", "Warehouse orchestration, compliance-heavy workflows"],
                ["Decentralized", "Resilience and locality", "Harder global optimality, trickier consistency", "Swarms, edge IoT, resilient sensing"],
                ["Peer-to-peer", "No central dependency, natural scaling", "Coordination complexity, weak policy enforcement", "Ad hoc collaboration, open agent platforms"],
                ["Blackboard", "Great for heterogeneous specialists and opportunistic reasoning", "Shared-state contention", "Research assistants, knowledge fusion"],
                ["Broker", "Simpler clients, strong policy control", "Broker becomes bottleneck / trust choke-point", "Dynamic service discovery, marketplaces, federated MAS"],
                ["Hierarchical", "Strong decomposition for large programs", "Layer coupling, slow adaptation if rigid", "Multi-robot fleets, mission planning, enterprise workflows"],
              ]}
            />
          </div>
          <p className="mt-4 text-sm text-white/60">
            Default guidance: hierarchical-centralized when a visible control plane matters (throughput, compliance,
            human supervision); decentralized-hybrid when locality, intermittent connectivity, or safety loops dominate.
          </p>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Interactive" title="Transport Fit — Six Axes">
          <ChartCard
            title="Protocol radar"
            subtitle="ROS 2/DDS wins QoS and real-time control; MQTT wins constrained networks; gRPC wins typed service calls; REST wins interoperability."
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={MAS_TRANSPORT_RADAR} outerRadius="72%">
                <PolarGrid stroke="rgba(148,163,184,0.35)" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                <Radar name="ROS 2 / DDS" dataKey="ROS 2 / DDS" stroke="#2563eb" fill="#2563eb" fillOpacity={0.25} />
                <Radar name="MQTT v5" dataKey="MQTT v5" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                <Radar name="gRPC" dataKey="gRPC" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.18} />
                <Radar name="REST" dataKey="REST" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <RTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
          <div className="mt-6">
            <Table
              headers={["Protocol", "Interaction model", "Payload style", "Most suitable role"]}
              rows={[
                ["FIPA ACL", "Speech-act semantics + interaction protocols", "Performative, content, ontology, conversation-id", "Negotiation, directory-aware conversations, explainable workflows"],
                ["ROS 2 on DDS", "Data-centric pub/sub, services, actions, discovery, QoS", "ROS IDL over DDS serialization", "Multi-robot coordination, sensor streams, edge robotics"],
                ["MQTT v5", "Brokered lightweight pub/sub + request-response", "Small binary/text payloads + user properties", "Telemetry and low-overhead command/event fabrics"],
                ["gRPC", "Typed RPC and streaming over HTTP/2", "Protocol Buffers", "Planning, policy and risk services; low-latency internal APIs"],
                ["REST / HTTP", "Request-response over stable resource URLs", "JSON", "External partner integration, tooling, broad interoperability"],
              ]}
            />
          </div>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Frameworks" title="What to Build On">
          <Table
            headers={["Framework", "Language", "Maturity", "Scalability", "Best use", "Key caution"]}
            rows={[
              ["JADE", "Java", "High", "Medium", "Classical FIPA-style MAS, teaching, prototyping", "Older ecosystem, awkward for ML-heavy pipelines"],
              ["SPADE", "Python", "Medium-High", "Medium", "Python-native agent services, XMPP messaging, LLM-adjacent agents", "XMPP-centric; not for low-latency cyber-physical loops"],
              ["ROS 2 + Open-RMF", "C++ / Python", "High", "High", "Multi-robot fleets, sensor-rich cyber-physical MAS", "Higher operational complexity than software-only stacks"],
              ["PettingZoo + Gymnasium", "Python", "High", "Medium", "Standardised MARL environments, benchmark portability", "Environment API only — not a production runtime"],
              ["Ray RLlib", "Python", "High", "High", "Scalable MARL training and distributed RL", "Training stack, not an agent-management platform"],
              ["Unity ML-Agents", "C# + Python", "High", "Medium-High", "3D embodied simulation, perception-rich MARL", "Unity-centred; plan runtime portability explicitly"],
            ]}
          />
          <p className="mt-4 text-sm text-white/60">
            Caveat worth repeating: OpenAI Gym has been unmaintained since 2022. For new multi-agent work use
            Gymnasium + PettingZoo, with compatibility wrappers only where legacy Gym is unavoidable.
          </p>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Semantics" title="Three Levels of Meaning">
          <NumberedSteps
            items={[
              { title: "Transport level", desc: "Efficient typed schemas — Protocol Buffers or ROS IDL — for runtime traffic." },
              { title: "API / document level", desc: "JSON + JSON Schema for validation, versioning, and external contracts." },
              { title: "Semantic-integration level", desc: "RDF / RDFS / OWL when agents must share richer domain meaning or a cross-system knowledge graph." },
              { title: "Message envelope", desc: "Keep FIPA ACL's explicit fields — content language, encoding, ontology, protocol, conversation-id — whatever the wire format." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Protocol in motion" title="Contract Net — Task Allocation Loop">
          <Diagram>
            <ContractNetDiagram />
          </Diagram>
          <div className="mt-6">
            <Code
              language="python"
              code={`# Contract Net over any transport — the semantics are what matter.
from dataclasses import dataclass

@dataclass
class ACL:
    performative: str        # cfp | propose | accept-proposal | reject-proposal | inform | failure
    sender: str
    receiver: str
    conversation_id: str
    ontology: str
    reply_by: float          # explicit deadline -> retries & dead-lettering
    content: dict

async def allocate(task, agents, bus, deadline=2.0):
    cid = new_conversation_id()
    await bus.broadcast(ACL("cfp", "orchestrator", "*", cid, "warehouse.v1", deadline,
                            {"task": task, "constraints": task.constraints}))

    proposals = await bus.collect(cid, performative="propose", timeout=deadline)
    if not proposals:
        return None                                   # explicit failure state, not silence

    winner = min(proposals, key=lambda p: p.content["cost"])
    await bus.send(ACL("accept-proposal", "orchestrator", winner.sender, cid,
                       "warehouse.v1", deadline, {"task_id": task.id}))
    for loser in (p for p in proposals if p is not winner):
        await bus.send(ACL("reject-proposal", "orchestrator", loser.sender, cid,
                           "warehouse.v1", deadline, {"task_id": task.id}))
    return winner.sender`}
            />
          </div>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Watch it work" title="Live Video Examples">
          <p className="mb-5 text-sm text-white/60">
            Six short walkthroughs covering emergent multi-agent behaviour, MARL fundamentals, ROS 2 fleet plumbing,
            contract-net negotiation, and real-hardware swarms. Click a thumbnail to play inline.
          </p>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {MAS_VIDEOS.map((v) => (
              <VideoCard key={v.id} {...v} />
            ))}
          </div>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Reference design 1" title="Robotic Swarm — Decentralized Hybrid">
          <Diagram>
            <SwarmDiagram />
          </Diagram>
          <div className="mt-6">
            <Grid cols={4}>
              <FeatureCard icon={<Cpu className="h-5 w-5" />} title="Stack" body="ROS 2 nodes per robot, DDS QoS tuned per stream, Protobuf/ROS IDL schemas, OWL only for mission metadata." />
              <FeatureCard icon={<Timer className="h-5 w-5" />} title="Timing" body="Safety loop stays local and non-blocking. No remote planner in the control path." />
              <FeatureCard icon={<Gauge className="h-5 w-5" />} title="Metrics" body="Coverage, collision rate, task yield, message volume, resilience under agent dropout." />
              <FeatureCard icon={<RadarIcon className="h-5 w-5" />} title="Simulation" body="VMAS / MPE2 for fast policy iteration, then Gazebo or Webots before hardware-in-the-loop." />
            </Grid>
          </div>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Reference design 2" title="Multi-Robot Warehouse — Central Plane + Contract Net">
          <NumberedSteps
            items={[
              { title: "Warehouse manager issues a pick task", desc: "WMS integrates over REST or gRPC; the MAS owns scheduling, not the WMS." },
              { title: "Fleet orchestrator broadcasts a CFP", desc: "Open-RMF provides task queuing and conflict-free resource scheduling across vendor fleets." },
              { title: "Robots propose cost, ETA, battery", desc: "Transparent, extensible allocation with conversation IDs and deadlines." },
              { title: "Accept / reject + resource reservation", desc: "Doors, elevators and chargers are reserved before motion starts." },
              { title: "inform-progress → inform-result", desc: "ROS actions for long-running navigation; explicit failure states drive recovery." },
            ]}
          />
          <div className="mt-6">
            <Grid cols={3}>
              <ConceptCard icon={<ShieldCheck />} title="Security" desc="SROS 2 + DDS Security for protected comms; separate telemetry and command QoS profiles." />
              <ConceptCard icon={<LineChart />} title="Benchmarks" desc="RWARE / TA-RWARE for allocation experiments; Gazebo or Webots for congestion tests." />
              <ConceptCard icon={<Gauge />} title="KPIs" desc="Order lines/hour, mean task latency, makespan, blockage rate, battery utilisation, plan recovery time." />
            </Grid>
          </div>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Reference design 3" title="Trading & Marketplace — Brokered">
          <Diagram>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {[
                { label: "Market data / listings", icon: <Globe2 className="h-4 w-4" /> },
                { label: "Strategy agents", icon: <Brain className="h-4 w-4" /> },
                { label: "Risk & policy agent", icon: <ShieldCheck className="h-4 w-4" /> },
                { label: "Execution / negotiation", icon: <Workflow className="h-4 w-4" /> },
                { label: "Exchange / matching core", icon: <Boxes className="h-4 w-4" /> },
                { label: "Event log & replay", icon: <History className="h-4 w-4" /> },
              ].map((s, i, arr) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                    <span className="text-neon-cyan">{s.icon}</span>
                    {s.label}
                  </div>
                  {i < arr.length - 1 && <span className="text-white/40">→</span>}
                </div>
              ))}
            </div>
          </Diagram>
          <p className="mt-4 text-sm text-white/60">
            Use gRPC/Protobuf for strategy → risk → execution flows, keep the exchange simulation event-driven
            (ABIDES / ABIDES-Gym with configurable pairwise latencies), and centralise admissibility and limit
            enforcement in the policy agent. Metrics: execution delay, fill ratio, inventory path, portfolio
            evolution, policy stability under latency variation.
          </p>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Evaluation" title="Benchmark the System, Not the Agent">
          <Table
            headers={["Dimension", "Representative metrics", "Benchmarks / tools"]}
            rows={[
              ["Task success & coordination", "Completion rate, makespan, throughput, missed tasks, conflicts", "Open-RMF demos, RWARE, TA-RWARE"],
              ["Communication quality", "End-to-end latency, deadline misses, reliability, loss, bandwidth", "ROS 2 QoS experiments, DDS deployments, MQTT load tests"],
              ["Learning quality", "Episodic return, sample efficiency, regret, generalisation, seed reproducibility", "PettingZoo, BenchMARL, SMAC, Melting Pot"],
              ["Swarm performance", "Coverage, collision rate, connectivity, energy per task, resilience to agent loss", "VMAS, MPE2, swarm-robotics surveys"],
              ["Market behaviour", "Execution quality, latency sensitivity, inventory path, fill ratio, order-flow impact", "ABIDES, ABIDES-Gym"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Trust" title="Fault Tolerance, Security & Privacy">
          <Grid cols={4}>
            <ConceptCard icon={<AlertTriangle />} title="Explicit conversation state" desc="Deadlines, conversation IDs, accept/reject, failure and not-understood states are the hooks for retries, supervisors, dead-letters and compensation." />
            <ConceptCard icon={<Lock />} title="Zero trust" desc="NIST SP 800-207 — no implicit trust, continuous verification. mTLS, OAuth 2.0, OIDC for service-centric MAS." />
            <ConceptCard icon={<ShieldCheck />} title="Robotics security" desc="SROS 2 and DDS Security give authentication, access control and encryption at the transport layer." />
            <ConceptCard icon={<Activity />} title="Privacy-aware telemetry" desc="Minimise agent-visible data, separate telemetry from sensitive payloads, log trace IDs — not secrets. OpenTelemetry + Prometheus." />
          </Grid>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Roadmap" title="Interface-First, Simulation-First">
          <Timeline
            items={[
              { year: "M1", title: "Problem framing & assumptions", desc: "Domain boundaries, agent roles, objectives, trust boundary, latency classes, success metrics. Write ADRs with measurable acceptance criteria." },
              { year: "M2", title: "Schema & ontology baseline", desc: "Message contracts, versioning rules, domain vocabulary. Protobuf/ROS IDL for runtime, JSON Schema for APIs, optional OWL/RDF for shared semantics." },
              { year: "M3", title: "Minimal communication substrate", desc: "One dominant internal fabric, message validation, mailbox abstractions, conversation identifiers, explicit compatibility surfaces." },
              { year: "M4", title: "Core agent runtime", desc: "Lifecycle, local state, behaviour scheduling, retries, timeouts, health endpoints. Bounded inboxes, idempotent handlers, explicit failure states." },
              { year: "M5", title: "Coordination & directory", desc: "Capability registration, matching, contract-net or auction allocation, supervisor recovery paths." },
              { year: "M6", title: "Simulation & benchmarks", desc: "Reproducible seeds, scenario library, latency injection, agent-dropout drills, regression thresholds in CI." },
              { year: "M7", title: "Trust & operations", desc: "Zero-trust identity, policy enforcement, OpenTelemetry traces, Prometheus alerting, CI/CD with traceable rollback." },
            ]}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Choose coordination topology, timing model and trust boundary before choosing a framework.",
          "Standardise interfaces and protocols hard; leave internal agent cognition to the application.",
          "Make coordination explicit — CFPs, proposals, deadlines, conversation IDs and failure states are what make a MAS debuggable.",
          "Simulate and benchmark the whole socio-technical system; Gymnasium + PettingZoo, not legacy Gym.",
          "Treat observability, security and safety as first-class components, not post-launch add-ons.",
        ]}
      />
    </div>
  );
}
