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
          "An in-depth, beginner-friendly learning library covering Artificial Intelligence, Cloud Computing, and Software-as-a-Service (SaaS) — concepts, history, architecture, diagrams, code, and security.",
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
    <Section className="pb-4 pt-16 lg:pt-24">
      <SectionHeader
        eyebrow="Learning Library"
        title="Learn — AI, Cloud & SaaS, from the ground up"
        description="Three self-contained mini-courses with concepts, history, architecture diagrams, comparison tables, code snippets, and security guidance. Designed for beginners with basic technical literacy who want depth, not just buzzwords."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="mt-6">
        <TabsList className="grid w-full grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-3">
          <TabPill value="ai" icon={<Brain className="h-4 w-4" />} label="Intro to AI" />
          <TabPill value="cloud" icon={<Cloud className="h-4 w-4" />} label="Intro to Cloud" />
          <TabPill value="saas" icon={<Layers className="h-4 w-4" />} label="Intro to SaaS" />
        </TabsList>

        <TabsContent value="ai" className="mt-8 space-y-12">
          <LessonsIndex topic="ai" />
          <IntroAI />
        </TabsContent>
        <TabsContent value="cloud" className="mt-8 space-y-12">
          <LessonsIndex topic="cloud" />
          <IntroCloud />
        </TabsContent>
        <TabsContent value="saas" className="mt-8 space-y-12">
          <LessonsIndex topic="saas" />
          <IntroSaaS />
        </TabsContent>
      </Tabs>
    </Section>
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

function LessonsIndex({ topic }: { topic: TopicKey }) {
  const lessons = LESSONS[topic];
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neon-cyan">Lessons</p>
          <h3 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
            Jump straight into a lesson
          </h3>
        </div>
        <p className="hidden text-sm text-white/55 sm:block">Each lesson includes a diagram walkthrough and detailed summary.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((l, i) => (
          <Link
            key={l.slug}
            to="/learn/$topic/$lesson"
            params={{ topic, lesson: l.slug }}
            className="card-flashy group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-shadow hover:shadow-glow"
          >
            <div className="relative z-[3] flex items-center justify-between text-xs text-white/55">
              <span className="font-mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {l.duration}
              </span>
            </div>
            <h4 className="relative z-[3] mt-3 text-base font-semibold text-white group-hover:text-gradient">
              {l.title}
            </h4>
            <p className="relative z-[3] mt-2 line-clamp-3 text-sm text-white/65">{l.summary}</p>
            <span className="relative z-[3] mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-neon-cyan">
              Open lesson <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   AI TAB
   ================================================================ */

function IntroAI() {
  return (
    <div className="space-y-12">
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
   REUSABLE PRESENTATION COMPONENTS
   ================================================================ */

function HeroCard({ icon, title, tag, body }: { icon: React.ReactNode; title: string; tag: string; body: string }) {
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
        <h3 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">{title}</h3>
        {subtitle && <p className="mt-2 text-sm text-white/65">{subtitle}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Grid({ cols = 4, children }: { cols?: 2 | 3 | 4; children: React.ReactNode }) {
  const colClass = cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  return <div className={`grid gap-4 ${colClass}`}>{children}</div>;
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

function Timeline({ items }: { items: { year: string; title: string; desc: string }[] }) {
  return (
    <div className="relative">
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-cyan-400/60 via-fuchsia-500/40 to-transparent sm:left-[11px]" />
      <ol className="space-y-5">
        {items.map((it) => (
          <li key={it.year + it.title} className="relative pl-7 sm:pl-10">
            <span className="absolute left-0 top-1.5 grid h-[15px] w-[15px] place-items-center rounded-full bg-brand-gradient shadow-neon sm:h-[23px] sm:w-[23px]">
              <History className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
            </span>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-mono text-xs font-semibold text-neon-cyan">{it.year}</span>
                <h5 className="text-sm font-semibold text-white">{it.title}</h5>
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
    <ol className="grid gap-4 sm:grid-cols-2">
      {items.map((it, idx) => (
        <li
          key={it.title}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-shadow hover:shadow-glow"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-gradient text-sm font-bold text-white shadow-neon">
              {idx + 1}
            </span>
            <div>
              <h5 className="text-sm font-semibold text-white">{it.title}</h5>
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
