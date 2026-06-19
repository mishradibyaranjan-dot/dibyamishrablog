import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Cloud,
  Layers,
  Clock,
  BookOpen,
  ShieldCheck,
  Database,
  KeyRound,
  Workflow,
  Cpu,
  Network,
  Activity,
  Globe2,
  DollarSign,
  Gauge,
  Users,
  AlertTriangle,
  Lock,
  Boxes,
  ServerCog,
  GitBranch,
  Sparkles,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/cinematic/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  TOPIC_LABEL,
  TOPIC_TAG,
  getLesson,
  getAdjacent,
  type TopicKey,
} from "@/lib/lessons";
import {
  HeroCard,
  SubSection,
  Grid,
  ConceptCard,
  FeatureCard,
  KeyTakeaways,
  Table,
  Code,
  Diagram,
  DiagramWalkthrough,
  StackDiagram,
  AgentLoopDiagram,
  ServiceModelDiagram,
  CloudArchitectureDiagram,
  TenancyDiagram,
  SaaSArchitectureDiagram,
  Timeline,
  NumberedSteps,
} from "@/components/learn/lesson-ui";

const TOPIC_ICON: Record<TopicKey, React.ReactNode> = {
  ai: <Brain className="h-6 w-6" />,
  cloud: <Cloud className="h-6 w-6" />,
  saas: <Layers className="h-6 w-6" />,
};

export const Route = createFileRoute("/_authenticated/learn/$topic/$lesson")({
  beforeLoad: ({ params }) => {
    const topic = params.topic as TopicKey;
    if (!["ai", "cloud", "saas"].includes(topic)) throw notFound();
    if (!getLesson(topic, params.lesson)) throw notFound();
  },
  head: ({ params }) => {
    const topic = params.topic as TopicKey;
    const lesson = getLesson(topic, params.lesson);
    return {
      meta: [
        { title: `${lesson?.title ?? "Lesson"} — ${TOPIC_LABEL[topic] ?? "Learn"}` },
        { name: "description", content: lesson?.summary ?? "Lesson detail page." },
      ],
    };
  },
  component: LessonPage,
});

function LessonPage() {
  const { topic, lesson: slug } = Route.useParams();
  const t = topic as TopicKey;
  const lesson = getLesson(t, slug)!;
  const { prev, next } = getAdjacent(t, slug);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    supabase.from("page_visits").insert({
      user_id: user.id,
      page: `/learn/${t}/${slug}`,
      referrer: typeof document !== "undefined" ? document.referrer : null,
    });
  }, [user, t, slug]);

  return (
    <Section className="pb-4 pt-16 lg:pt-24">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60">
        <Link to="/learn" className="hover:text-white">
          Learn
        </Link>
        <span>/</span>
        <Link to="/learn" className="hover:text-white">
          {TOPIC_LABEL[t]}
        </Link>
        <span>/</span>
        <span className="text-white">{lesson.title}</span>
      </div>

      <SectionHeader
        eyebrow={TOPIC_TAG[t]}
        title={lesson.title}
        description={lesson.summary}
      />

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Badge className="bg-white/10 text-white hover:bg-white/15">
          <Clock className="mr-1.5 h-3 w-3" /> {lesson.duration} read
        </Badge>
        <Badge className="bg-white/10 text-white hover:bg-white/15">
          <BookOpen className="mr-1.5 h-3 w-3" /> Lesson
        </Badge>
      </div>

      <div className="space-y-12">
        <Reveal>
          <HeroCard icon={TOPIC_ICON[t]} title={lesson.title} tag={TOPIC_TAG[t]} body={lesson.summary} />
        </Reveal>

        <LessonBody topic={t} slug={slug} />
      </div>

      <nav className="mt-14 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            to="/learn/$topic/$lesson"
            params={{ topic: t, lesson: prev.slug }}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-shadow hover:shadow-glow"
          >
            <ArrowLeft className="h-5 w-5 text-neon-cyan transition-transform group-hover:-translate-x-1" />
            <div>
              <p className="text-xs uppercase tracking-widest text-white/50">Previous</p>
              <p className="text-sm font-semibold text-white">{prev.title}</p>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/learn/$topic/$lesson"
            params={{ topic: t, lesson: next.slug }}
            className="group flex items-center justify-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-right backdrop-blur transition-shadow hover:shadow-glow"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-white/50">Next</p>
              <p className="text-sm font-semibold text-white">{next.title}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-neon-cyan transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </Section>
  );
}

/* =================================================================
   LESSON BODIES — one component per (topic, slug)
   ================================================================= */

function LessonBody({ topic, slug }: { topic: TopicKey; slug: string }) {
  const key = `${topic}/${slug}`;
  switch (key) {
    /* ---------- AI ---------- */
    case "ai/ai-stack":
      return <AiStack />;
    case "ai/ml-types":
      return <AiMlTypes />;
    case "ai/model-families":
      return <AiModelFamilies />;
    case "ai/agent-loop":
      return <AiAgentLoop />;
    case "ai/governance":
      return <AiGovernance />;
    /* ---------- Cloud ---------- */
    case "cloud/service-models":
      return <CloudServiceModels />;
    case "cloud/deployment-models":
      return <CloudDeploymentModels />;
    case "cloud/architecture":
      return <CloudArchitecture />;
    case "cloud/provider-map":
      return <CloudProviderMap />;
    case "cloud/cost":
      return <CloudCost />;
    /* ---------- SaaS ---------- */
    case "saas/tenancy":
      return <SaasTenancy />;
    case "saas/pricing":
      return <SaasPricing />;
    case "saas/architecture":
      return <SaasArchitecture />;
    case "saas/security":
      return <SaasSecurity />;
    case "saas/observability":
      return <SaasObservability />;
    default:
      return null;
  }
}

/* ======================= AI LESSONS ======================= */

function AiStack() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="Why a hierarchy helps">
          <FeatureCard
            icon={<BookOpen className="h-5 w-5" />}
            title="One field, four layers"
            body="AI is the broad discipline of building systems that perceive, reason, learn, and act. Machine learning sits inside AI as the subfield that learns patterns from data instead of explicit rules. Deep learning is the neural-network-heavy slice of ML. Foundation models — today's LLMs, diffusion models, and multimodal systems — are pre-trained at scale on top of deep learning. Agentic apps wrap those models in loops with tools, memory, and guardrails. The hierarchy isn't decorative: it tells you where to look for the source of any given capability — and the source of any given failure."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="Reading the stack bottom-up">
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
          <DiagramWalkthrough
            steps={[
              { label: "AI (base)", desc: "The widest layer — any system that exhibits perception, reasoning, learning, or action. Includes symbolic systems and search algorithms that aren't ML at all." },
              { label: "Machine Learning", desc: "A subset that improves from data. Algorithms like linear regression, decision trees, and clustering live here without being 'deep'." },
              { label: "Deep Learning", desc: "Multi-layer neural networks. Convolutional nets dominate vision, recurrent and transformer nets dominate sequences." },
              { label: "Foundation Models", desc: "Pretrained at massive scale and adapted to many tasks via fine-tuning, prompting, or retrieval. The base for modern generative AI." },
              { label: "Agentic Apps", desc: "Models wired into tools, memory, and a control loop. This is where most user-visible AI products now live." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="History" title="How we got here">
          <Timeline
            items={[
              { year: "1950", title: "Turing's Test", desc: "Reframes 'can machines think?' as an operational behavioral test." },
              { year: "1955", title: "Dartmouth Proposal", desc: "Coins the term 'Artificial Intelligence'." },
              { year: "1986", title: "Backpropagation", desc: "Multilayer neural networks become practically trainable." },
              { year: "2012", title: "AlexNet", desc: "Deep CNN crushes ImageNet — the deep learning era begins." },
              { year: "2017", title: "Transformers", desc: "Attention replaces recurrence — the architecture behind today's LLMs." },
              { year: "2022→", title: "LLMs & Agents", desc: "Instruction-tuned LLMs, RAG, tool-use, multi-step agents." },
            ]}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "AI is the umbrella, ML is the data-driven subset, deep learning is the neural slice.",
          "Foundation models are the engine; agentic apps are the chassis.",
          "When a feature breaks, ask which layer it actually lives in — the fix is usually layer-specific.",
        ]}
      />
    </>
  );
}

function AiMlTypes() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="Three learning paradigms">
          <FeatureCard
            icon={<Cpu className="h-5 w-5" />}
            title="Match the paradigm to the signal you have"
            body="Supervised learning needs labeled examples — for every input you also have the correct answer. Unsupervised learning works without labels and instead exposes structure: clusters, embeddings, anomalies. Reinforcement learning replaces labels with a reward signal: the agent acts, the environment scores it, and over time it learns a policy that maximizes long-term reward. The choice isn't a matter of taste — it's determined by what kind of feedback your data actually provides."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="What flows in, what flows out">
          <Diagram>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { name: "Supervised", inputs: "x, y pairs", out: "Predict y for new x" },
                { name: "Unsupervised", inputs: "x only", out: "Structure: clusters, embeddings" },
                { name: "Reinforcement", inputs: "state + reward", out: "Policy: best action per state" },
              ].map((p) => (
                <div key={p.name} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
                  <h5 className="font-display text-sm font-bold text-white">{p.name}</h5>
                  <div className="mt-3 rounded-md bg-cyan-500/15 px-2 py-1 text-[12px] text-cyan-100">{p.inputs}</div>
                  <div className="my-2 text-white/40">↓</div>
                  <div className="rounded-md bg-fuchsia-500/15 px-2 py-1 text-[12px] text-fuchsia-100">{p.out}</div>
                </div>
              ))}
            </div>
          </Diagram>
          <DiagramWalkthrough
            steps={[
              { label: "Supervised", desc: "Spam detection, credit scoring, image classification — anywhere you can collect (input, correct answer) pairs at scale." },
              { label: "Unsupervised", desc: "Customer segmentation, anomaly detection, embeddings for semantic search. No 'right answer' exists; quality is judged by usefulness." },
              { label: "Reinforcement", desc: "Game-playing, robotics, optimization. Powerful but data-hungry and harder to evaluate in production." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Comparison" title="Side by side">
          <Table
            headers={["Paradigm", "Signal", "Typical metric", "Watch out for"]}
            rows={[
              ["Supervised", "Labeled examples", "Accuracy, F1, RMSE, ROC-AUC", "Label leakage, class imbalance"],
              ["Unsupervised", "Just inputs", "Silhouette, reconstruction error", "No ground truth — evaluation is subjective"],
              ["Reinforcement", "Reward signal", "Cumulative reward, regret", "Reward hacking, sample inefficiency"],
            ]}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Choose the paradigm that fits your feedback signal, not the other way around.",
          "Supervised wins when labels are cheap and plentiful; unsupervised wins for exploration; RL wins for sequential decisions.",
          "Many real systems blend paradigms — e.g., self-supervised pretraining + supervised fine-tuning + RL from human feedback.",
        ]}
      />
    </>
  );
}

function AiModelFamilies() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="Pick the simplest family that fits">
          <FeatureCard
            icon={<Network className="h-5 w-5" />}
            title="Architecture follows data shape"
            body="The right model family is driven by the shape of your data and the latency you can tolerate. Tabular problems are almost always best served by linear models or gradient-boosted trees — they're fast, interpretable, and very hard to beat. Images map naturally to convolutional networks. Sequences and language map to transformers. Generation of high-fidelity images, video, and audio maps to diffusion. Graph and relational structure maps to graph neural networks. Reach for deep models only when simpler families plateau."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="From data shape to model">
          <Diagram>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { data: "Tabular rows", arrow: "→", model: "Linear / Trees / Boosting" },
                { data: "Images, video", arrow: "→", model: "CNNs (or vision transformers)" },
                { data: "Text, sequences", arrow: "→", model: "Transformers" },
                { data: "Generate pixels/audio", arrow: "→", model: "Diffusion" },
                { data: "Graphs / relations", arrow: "→", model: "GNNs" },
                { data: "Multimodal", arrow: "→", model: "Multimodal transformers" },
              ].map((r) => (
                <div
                  key={r.data}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
                >
                  <span className="rounded-md bg-cyan-500/15 px-2 py-1 text-xs text-cyan-100">{r.data}</span>
                  <span className="text-white/40">{r.arrow}</span>
                  <span className="rounded-md bg-fuchsia-500/15 px-2 py-1 text-xs text-fuchsia-100">{r.model}</span>
                </div>
              ))}
            </div>
          </Diagram>
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="When to use what" title="Family comparison">
          <Table
            headers={["Family", "Best first use case", "Strength", "Trade-off"]}
            rows={[
              ["Linear / Logistic", "Tabular baselines", "Fast, interpretable, calibrated", "Underfits nonlinear data"],
              ["Trees & Boosting", "Tabular SOTA", "Strong default for structured data", "Less natural for raw text/images"],
              ["CNNs", "Images, signals", "Local feature reuse", "Needs data, transformers catching up"],
              ["Transformers", "Text & multimodal", "Scales with data and compute", "Memory grows with sequence length"],
              ["Diffusion", "Image/video/audio gen", "High-fidelity generation", "Slow inference, careful conditioning"],
              ["GNNs", "Graph data", "Native message passing", "Tooling and benchmarks still maturing"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Starter code" title="A leak-safe tabular pipeline">
          <Code
            language="python"
            code={`from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_validate

clf = Pipeline([
    ("scale", StandardScaler()),
    ("model", LogisticRegression(max_iter=1000)),
])

cv = cross_validate(clf, X, y, cv=5, scoring=["accuracy", "f1_macro"])
print({k: v.mean() for k, v in cv.items() if "test" in k})`}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Start with a baseline that's easy to debug — usually linear or trees.",
          "Reach for deep models only when you have the data, the compute, and a real plateau on the baseline.",
          "Architecture is downstream of data shape and latency, not the other way around.",
        ]}
      />
    </>
  );
}

function AiAgentLoop() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="An agent is a model in a loop">
          <FeatureCard
            icon={<Workflow className="h-5 w-5" />}
            title="Observe → Decide → Use Tools → Act → Evaluate → repeat"
            body="An AI agent is fundamentally a wrapper around a model: it observes the environment, decides what to do, calls tools to gather information or take actions, evaluates the result, and loops. Production agents add three things the toy version skips: persistent memory, traceable logging, and guardrails — including hard-stop human approvals for irreversible actions. The biggest failure mode in practice is not 'the model is dumb'; it's that the loop has no exit condition, no budget, and no way to recover from a bad tool result."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="The five-step loop">
          <Diagram>
            <AgentLoopDiagram />
          </Diagram>
          <DiagramWalkthrough
            steps={[
              { label: "Observe", desc: "Read the latest message, tool result, or sensor input. Normalize it into the model's context." },
              { label: "Decide", desc: "The model proposes the next step: a final answer, a tool call, or a clarification question." },
              { label: "Use Tools", desc: "Execute approved tool calls — search, code, database queries, API calls. Apply rate limits and permission checks." },
              { label: "Act", desc: "Surface the result to the user, write to a system of record, or send a downstream message." },
              { label: "Evaluate", desc: "Score the step (success/failure, cost, latency). Decide whether to loop again, stop, or escalate to a human." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Build sequence" title="From toy to production">
          <NumberedSteps
            items={[
              { title: "Define the task", desc: "Single user goal, single success metric. Resist 'do everything' framing." },
              { title: "Pick the smallest tool set", desc: "Each tool is an attack surface. Start with one or two." },
              { title: "Set hard limits", desc: "Max steps, max cost, max wall-clock time. Always." },
              { title: "Log every step", desc: "Inputs, outputs, tool calls, costs — for replay and audit." },
              { title: "Add human approvals", desc: "Anything irreversible (payments, deletes, sends) requires explicit confirmation." },
              { title: "Evaluate offline", desc: "Build a small eval set of representative tasks; measure pass rate before shipping changes." },
            ]}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "An agent is a control loop, not a model. Most failures are loop failures, not model failures.",
          "Hard limits on steps, cost, and wall-clock are non-negotiable.",
          "Treat tools as privileged surfaces — minimize, log, and gate behind permissions.",
        ]}
      />
    </>
  );
}

function AiGovernance() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="Risk surfaces and how to manage them">
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Govern across the lifecycle, not at launch"
            body="Modern AI systems introduce risk surfaces that traditional software doesn't have: confabulation (confident-sounding falsehoods), data leakage through prompts and outputs, bias that compounds with scale, and a new class of attacks like prompt injection and tool misuse. The NIST AI Risk Management Framework treats these as lifecycle concerns — map the system, measure its behavior, manage the risks, and govern the program. Bolting governance on at launch is the most expensive way to learn this lesson."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="Four risk surfaces, four controls">
          <Diagram>
            <Grid cols={4}>
              <ConceptCard icon={<AlertTriangle />} title="Confabulation" desc="Ground in retrieval, cite sources, require evidence." />
              <ConceptCard icon={<Lock />} title="Privacy" desc="Minimize, redact, never log raw secrets, isolate training data." />
              <ConceptCard icon={<Activity />} title="Bias" desc="Slice metrics by subgroup; document datasets and limitations." />
              <ConceptCard icon={<ShieldCheck />} title="Security" desc="Treat prompt injection, exfiltration, and tool misuse as P0 threats." />
            </Grid>
          </Diagram>
          <DiagramWalkthrough
            steps={[
              { label: "Map", desc: "Inventory models, data sources, tools, and downstream consumers." },
              { label: "Measure", desc: "Define quality, safety, and bias metrics with thresholds — not vibes." },
              { label: "Manage", desc: "Apply mitigations: filters, human review, rate limits, scoped credentials." },
              { label: "Govern", desc: "Assign owners, run periodic reviews, retire models that fail thresholds." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Checklist" title="A pre-deploy minimum">
          <Table
            headers={["Area", "Minimum control"]}
            rows={[
              ["Data", "Documented sources, redaction, retention policy"],
              ["Evaluation", "Held-out test set + subgroup slices + manual review for generative outputs"],
              ["Safety", "Refusal coverage, jailbreak tests, prompt-injection tests with adversarial samples"],
              ["Observability", "Per-request trace: prompt, model, cost, latency, tool calls, outcome"],
              ["Human override", "Clear escalation path, irreversible actions gated behind approval"],
              ["Lifecycle", "Drift monitoring, scheduled re-eval, deprecation/rollback plan"],
            ]}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Confabulation, privacy, bias, and security are the four big AI risk surfaces.",
          "NIST AI RMF: map, measure, manage, govern — across the full lifecycle.",
          "Pre-deploy thresholds beat post-deploy apologies.",
        ]}
      />
    </>
  );
}

/* ======================= CLOUD LESSONS ======================= */

function CloudServiceModels() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="Who manages what">
          <FeatureCard
            icon={<ServerCog className="h-5 w-5" />}
            title="The trade is convenience for control"
            body="The four cloud service models — IaaS, PaaS, SaaS, and serverless — differ in where the line of responsibility falls between you and the provider. IaaS leaves you with the OS and everything above it, in exchange for full control. PaaS lifts the OS and runtime off your plate so you can focus on code. SaaS hands you a finished product. Serverless is a special case of PaaS where the provider runs functions on demand and scales them to zero. Most modern stacks blend several models — pick per workload, not per vendor."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="Side-by-side responsibility split">
          <Diagram>
            <ServiceModelDiagram />
          </Diagram>
          <DiagramWalkthrough
            steps={[
              { label: "On-Prem", desc: "You own every layer from network to apps. Maximum control, maximum overhead." },
              { label: "IaaS", desc: "Provider owns hardware, virtualization, network, and storage. You own OS, runtime, and apps." },
              { label: "PaaS", desc: "Provider owns OS and runtime too. You ship code and data; the platform handles the rest." },
              { label: "SaaS", desc: "Provider owns everything, including the application. You consume a finished product." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="When to use what" title="Service model fit">
          <Table
            headers={["Model", "Strength", "Trade-off", "Typical use"]}
            rows={[
              ["IaaS", "Maximum control", "Most operational work for you", "Lift-and-shift, custom workloads"],
              ["PaaS", "Focus on code", "Less control over runtime", "Web apps, internal tools"],
              ["Serverless", "Auto-scale, pay-per-request", "Cold starts, execution limits", "Bursty APIs, event handlers"],
              ["SaaS", "Zero ops", "Locked into the product", "Email, CRM, analytics"],
            ]}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Service models are about responsibility boundaries, not technology.",
          "Most modern systems mix IaaS/PaaS/serverless per workload.",
          "More provider responsibility = less control + more velocity. Pick deliberately.",
        ]}
      />
    </>
  );
}

function CloudDeploymentModels() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="Public, private, hybrid, multi-cloud">
          <FeatureCard
            icon={<Globe2 className="h-5 w-5" />}
            title="Environment mix vs. provider mix"
            body="Public cloud means shared provider infrastructure delivered as a service. Private cloud means cloud-like infrastructure dedicated to one organization. Hybrid combines public with private/on-prem. Multi-cloud means using more than one provider. Hybrid and multi-cloud are often conflated, but they answer different questions: hybrid is about environment mix; multi-cloud is about provider mix. A team can absolutely be both."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="Four deployment shapes">
          <Diagram>
            <Grid cols={4}>
              <ConceptCard icon={<Globe2 />} title="Public" desc="Shared infra, fastest start, lowest ops burden." />
              <ConceptCard icon={<Lock />} title="Private" desc="Dedicated infra, highest control, highest cost." />
              <ConceptCard icon={<GitBranch />} title="Hybrid" desc="Public + private/on-prem, connected with secure links." />
              <ConceptCard icon={<Network />} title="Multi-cloud" desc="Two or more providers — sometimes per workload, sometimes per region." />
            </Grid>
          </Diagram>
          <DiagramWalkthrough
            steps={[
              { label: "Public", desc: "Default for new workloads. Elastic, global, and you only pay for what you use." },
              { label: "Private", desc: "Driven by regulation, latency to on-prem systems, or sunk hardware investment." },
              { label: "Hybrid", desc: "Used during migration, for data gravity, or for sensitive workloads kept on-prem." },
              { label: "Multi-cloud", desc: "Used to avoid lock-in, meet customer requirements, or get the best service per workload." },
            ]}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Hybrid = environment mix. Multi-cloud = provider mix. They are not the same.",
          "Public-first is the modern default. Hybrid and multi-cloud should be justified by concrete drivers.",
          "Multi-cloud has a real operational tax — networking, identity, and tooling all multiply.",
        ]}
      />
    </>
  );
}

function CloudArchitecture() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="One mental model, every cloud">
          <FeatureCard
            icon={<Cpu className="h-5 w-5" />}
            title="Identity wraps networks; networks live in regions; resilience comes from zones"
            body="Every major cloud exposes the same primitive shape. Identity and access management wrap the whole environment. Workloads live inside virtual networks. Networks live inside regions, which are geographic locations. Within a region, availability zones are isolated datacenter groupings — independent power, cooling, and networking. Spreading workloads across zones is the cheapest high-availability lever you have. Multi-region is for disaster recovery and adds real data-consistency complexity."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="From user to storage">
          <Diagram>
            <CloudArchitectureDiagram />
          </Diagram>
          <DiagramWalkthrough
            steps={[
              { label: "User / App", desc: "Requests enter from the public internet or a private network." },
              { label: "IAM / Policies", desc: "Identity is checked first. Least-privilege roles and policies decide what can be done." },
              { label: "Region", desc: "Pick a region near your users for latency, or a specific region for compliance." },
              { label: "Zones", desc: "Inside a region, distribute compute across two or more zones to survive a datacenter failure." },
              { label: "Virtual Network", desc: "Compute (VMs, containers, serverless) is wired together inside private networks with controlled egress." },
              { label: "Storage & Services", desc: "Object storage, databases, queues, and managed services back the workload." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Core building blocks" title="What every cloud has">
          <Grid cols={4}>
            <ConceptCard icon={<Cpu />} title="Compute" desc="VMs first, then containers, then serverless." />
            <ConceptCard icon={<Database />} title="Storage" desc="Object storage is the universal default — simple and cheap." />
            <ConceptCard icon={<Network />} title="Networking" desc="VPCs, subnets, load balancers, CDN, DNS." />
            <ConceptCard icon={<KeyRound />} title="Identity" desc="Roles and policies — IAM controls everything else." />
          </Grid>
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Identity wraps the environment; workloads live in networks inside regions.",
          "Multi-AZ is the cheapest HA lever. Multi-region is for disaster recovery.",
          "Object storage and managed databases should be the default — own less infrastructure.",
        ]}
      />
    </>
  );
}

function CloudProviderMap() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="Same concepts, different names">
          <FeatureCard
            icon={<Boxes className="h-5 w-5" />}
            title="Learn the concept once"
            body="The three major clouds (AWS, Azure, Google Cloud) expose the same essential patterns — only the product names differ. Once you can name the concepts (VM, object storage, managed Kubernetes, serverless function, IAM, VPC), the providers become interchangeable for onboarding purposes. This map is the cheat sheet that lets a team move between clouds without re-learning."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="Side-by-side service map">
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
              ["Cost tools", "Billing & Cost Management", "Microsoft Cost Management", "Cloud Billing"],
              ["Monitoring", "Amazon CloudWatch", "Azure Monitor", "Cloud Monitoring (Ops Suite)"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Mini-lab" title="A first VM on each cloud">
          <Code
            language="bash"
            code={`# AWS
aws ec2 run-instances --image-id ami-xxx --instance-type t2.micro --count 1

# Azure
az vm create --resource-group rg --name vm1 --image Ubuntu2204 --size Standard_B1s

# Google Cloud
gcloud compute instances create vm1 \\
  --machine-type=e2-micro --image-family=debian-12 --image-project=debian-cloud`}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Master the concepts; the product names are just a translation table.",
          "Pick a primary cloud for depth, then learn the map for breadth.",
          "Mini-labs across providers reveal how similar — and how different — the consoles really are.",
        ]}
      />
    </>
  );
}

function CloudCost() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="Cost is an architecture concern">
          <FeatureCard
            icon={<DollarSign className="h-5 w-5" />}
            title="Awareness, attribution, alerting"
            body="Cloud bills surprise teams that didn't design for cost. Three habits prevent most of those surprises. First, estimate before you build — every provider ships a pricing calculator. Second, tag every resource by owner, environment, and cost center so you can actually attribute spend later. Third, set budgets with alerts at 50, 80, and 100 percent. Compliance is the fourth axis: pick regions, services, and controls that satisfy your legal and contractual constraints up front, not in audit week."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="A practical cost workflow">
          <Diagram>
            <Grid cols={4}>
              <ConceptCard icon={<DollarSign />} title="Estimate" desc="Pricing calculator before any resource is created." />
              <ConceptCard icon={<Gauge />} title="Budget" desc="Per-project budgets with email alerts at 50/80/100%." />
              <ConceptCard icon={<Activity />} title="Tag" desc="owner, env, cost-center on every resource." />
              <ConceptCard icon={<ShieldCheck />} title="Compliance" desc="Region, encryption, data residency by policy." />
            </Grid>
          </Diagram>
          <DiagramWalkthrough
            steps={[
              { label: "Estimate", desc: "Model the workload's baseline + peak before provisioning anything." },
              { label: "Tag", desc: "Enforce tagging via policy — untagged resources should fail to deploy." },
              { label: "Monitor", desc: "Daily cost dashboards by team; weekly review for anomalies." },
              { label: "Alert", desc: "Budgets with multi-threshold alerts. Hard caps for dev/staging." },
              { label: "Optimize", desc: "Right-size, schedule shutdowns, commit to reserved or savings plans where stable." },
            ]}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Estimate, tag, alert. Three habits that prevent most surprise bills.",
          "Untagged resources are unattributable — make tagging a deploy-time policy.",
          "Compliance choices belong at design time, not at audit time.",
        ]}
      />
    </>
  );
}

/* ======================= SAAS LESSONS ======================= */

function SaasTenancy() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="The isolation spectrum">
          <FeatureCard
            icon={<Layers className="h-5 w-5" />}
            title="There's no single 'correct' tenancy model"
            body="SaaS is a sales/delivery model; multitenancy is the architectural decision about how customers are isolated inside it. The spectrum runs from silo (dedicated infrastructure per tenant) through pool (one shared stack with tenant-aware isolation) to bridge or stamps (pooled by default with dedicated stamps for premium or regulated tenants). The right answer depends on isolation needs, onboarding speed, cross-tenant analytics, backup/restore requirements, and how tightly you want infrastructure cost to track tenant revenue."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="Three positions on the spectrum">
          <Diagram>
            <TenancyDiagram />
          </Diagram>
          <DiagramWalkthrough
            steps={[
              { label: "Silo", desc: "One stack per tenant. Highest isolation, slowest onboarding, highest cost. Fits regulated or large enterprise accounts." },
              { label: "Pool", desc: "One shared stack with tenant_id everywhere. Fastest onboarding, lowest unit cost. Default for most B2B/B2C SaaS." },
              { label: "Bridge / Stamps", desc: "Pooled by default with dedicated stamps for premium tenants. Best of both worlds, but more operational surface." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Comparison" title="Trade-off matrix">
          <Table
            headers={["Model", "Isolation", "Onboarding", "Ops overhead", "Typical fit"]}
            rows={[
              ["Silo", "Highest", "Slow", "High", "Regulated, large enterprise"],
              ["Pool", "Logical (RLS / tenant_id)", "Fast", "Low", "B2B & B2C at scale"],
              ["Bridge / Stamps", "Mixed", "Mixed", "Moderate", "Premium tiers + pooled base"],
            ]}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Default to pooled with a bridge path for premium accounts.",
          "Tenancy is a per-component decision — app, cache, DB, and storage can each sit at a different point on the spectrum.",
          "Resist 'silo per tenant' until a specific requirement (regulation, isolation, cost) demands it.",
        ]}
      />
    </>
  );
}

function SaasPricing() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="Pricing is an architecture decision">
          <FeatureCard
            icon={<DollarSign className="h-5 w-5" />}
            title="Match the metric to value AND cost"
            box=""
            body="Commercial packaging defines what a customer buys; entitlement logic defines what the software actually enables. The technically sound pattern is to choose a pricing metric that maps to customer value and to your internal cost drivers. Collaboration tools fit per-seat or tiered pricing naturally. Infra, API, and AI-heavy products often need usage-based or hybrid pricing so margin doesn't collapse on a usage spike."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="Six building blocks">
          <Table
            headers={["Model", "How it works", "Best fit", "Main risk"]}
            rows={[
              ["Flat-rate", "One recurring price per plan", "Simple, stable usage", "Bad when usage varies widely"],
              ["Per-seat", "Price scales with users", "Collaboration tools", "Customers share logins"],
              ["Tiered", "Bundled features/limits", "Multi-segment markets", "Decision paralysis"],
              ["Usage-based", "Pay per API call / GB / token", "Infra, API, AI products", "Unpredictable bills"],
              ["Freemium", "Free tier + paid upgrades", "Bottom-up PLG", "Free-tier cost vs. conversion"],
              ["Hybrid", "Subscription + overages", "Most modern SaaS", "Billing complexity"],
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Decision flow" title="Picking a pricing model">
          <NumberedSteps
            items={[
              { title: "Identify value metric", desc: "What grows as the customer gets more value? Seats? API calls? AI tokens? Pages?" },
              { title: "Identify cost driver", desc: "What grows your infra bill as usage grows? Match the metric to it when possible." },
              { title: "Pick a base + overage", desc: "A subscription floor + usage overages aligns predictability with elasticity." },
              { title: "Validate margins", desc: "Model gross margin at low, expected, and 10x usage. Refuse models that break at 10x." },
            ]}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Pricing is part of architecture — it determines what the system has to track and bill.",
          "Hybrid (subscription + overage) is the modern default for most SaaS.",
          "Stress-test margin at 10x expected usage before launch.",
        ]}
      />
    </>
  );
}

function SaasArchitecture() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="Four pillars">
          <FeatureCard
            icon={<Workflow className="h-5 w-5" />}
            title="Identity, routing, data, observability"
            body="Modern SaaS converges on four architectural pillars. Identity lives in an external OIDC provider — building your own is a documented antipattern. Tenant routing resolves the active tenant from a subdomain, header, or JWT claim before authorization runs. Tenant-aware data enforces isolation at the database layer (typically row-level security), not just in application code. Per-tenant observability slices latency, error, and cost metrics by tenant — without it, noisy neighbors are invisible until they take production down."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="A reference multitenant architecture">
          <Diagram>
            <SaaSArchitectureDiagram />
          </Diagram>
          <DiagramWalkthrough
            steps={[
              { label: "Edge", desc: "CDN and WAF terminate TLS and shed obvious abuse before traffic reaches your origin." },
              { label: "Identity", desc: "OIDC provider authenticates users; JWTs carry tenant + role claims." },
              { label: "Tenant Resolver", desc: "Middleware extracts the active tenant from subdomain or JWT and attaches it to the request context." },
              { label: "App + Jobs + Cache", desc: "Pooled services run per-tenant scoped work; cache keys and queue messages include the tenant ID." },
              { label: "Data", desc: "Pooled Postgres with RLS by default; dedicated stamps for premium or regulated accounts." },
              { label: "Cross-cutting", desc: "Observability, billing, audit, and backups all carry the tenant ID end to end." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Code starter" title="Tenant resolver middleware">
          <Code
            language="javascript"
            code={`async function resolveTenant(req, res, next) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  const subdomain = host.split(".")[0];
  const slug = req.auth?.payload?.tenant_slug || subdomain;

  const tenant = await tenantCatalog.findBySlug(slug);
  if (!tenant) return res.status(404).json({ error: "tenant_not_found" });
  if (tenant.status !== "active") return res.status(423).json({ error: "tenant_suspended" });

  req.tenant = { id: tenant.id, slug: tenant.slug, plan: tenant.plan };
  next();
}`}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Don't build identity. Use OIDC + PKCE with a managed provider.",
          "Resolve tenant BEFORE authorization, and propagate the tenant ID end to end.",
          "Enforce isolation at the data layer (RLS), not just in app code.",
        ]}
      />
    </>
  );
}

function SaasSecurity() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="AuthN ≠ Isolation">
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Isolation must hold at every layer"
            body="Authentication and authorization alone do not guarantee tenant isolation. Cross-tenant leakage can happen at the request path, the data layer, the cache layer, background jobs, storage, and operations tooling. A rigorous SaaS security program enforces isolation at every one of those layers, treats cross-tenant access as a P0 incident class, and maps controls to a recognized framework like NIST CSF 2.0 plus zero-trust principles."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="Layers that can leak">
          <Diagram>
            <Grid cols={3}>
              <ConceptCard icon={<KeyRound />} title="Request path" desc="Tenant resolved before authorization on every request." />
              <ConceptCard icon={<Database />} title="Data layer" desc="tenant_id on every row, enforced by RLS." />
              <ConceptCard icon={<Activity />} title="Cache" desc="Tenant ID in every cache key. No global keys." />
              <ConceptCard icon={<Workflow />} title="Jobs" desc="Tenant ID in every queue message and worker context." />
              <ConceptCard icon={<Lock />} title="Storage" desc="Per-tenant prefixes; signed URLs scoped to tenant." />
              <ConceptCard icon={<Users />} title="Ops tooling" desc="Admin queries scoped and audited — no 'SELECT * everywhere'." />
            </Grid>
          </Diagram>
          <DiagramWalkthrough
            steps={[
              { label: "Resolve", desc: "Tenant comes from JWT or subdomain — never from a user-controlled body field." },
              { label: "Authorize", desc: "Every action checks role AND tenant scope. Default deny." },
              { label: "Persist", desc: "tenant_id non-null on every row; RLS policy enforces it; index includes tenant_id." },
              { label: "Cache", desc: "Compose keys as `<tenant_id>:<rest>` so a cache hit can never serve another tenant." },
              { label: "Background work", desc: "Workers re-establish tenant context from message metadata before touching data." },
              { label: "Audit", desc: "Append-only log of admin actions, exports, and cross-tenant queries." },
            ]}
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Postgres" title="Row-Level Security for the pooled tier">
          <Code
            language="sql"
            code={`ALTER TABLE app_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON app_tickets
  USING      (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- Application sets this at session start:
--   SET app.tenant_id = '<uuid-from-request>';`}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Authentication ≠ isolation. Enforce at every layer.",
          "Cross-tenant leakage is a P0 incident class — design and test for it.",
          "Map controls to NIST CSF 2.0; apply zero-trust principles.",
        ]}
      />
    </>
  );
}

function SaasObservability() {
  return (
    <>
      <Reveal>
        <SubSection eyebrow="Detailed Summary" title="Watch per-tenant, not just per-system">
          <FeatureCard
            icon={<Gauge className="h-5 w-5" />}
            title="System-wide dashboards hide noisy neighbors"
            body="Tenant-aware observability means every important metric is sliced by tenant. Route latency, error rates, auth failures, DB time, AI token spend, and plan-quota consumption should all be queryable per tenant. Without this, one customer's runaway job degrades everyone else and looks like a generic system problem on the dashboards. With this, you find and throttle the noisy neighbor before anyone else notices."
          />
        </SubSection>
      </Reveal>

      <Reveal>
        <SubSection eyebrow="Diagram Walkthrough" title="A minimum signal set">
          <Diagram>
            <Grid cols={4}>
              <ConceptCard icon={<Gauge />} title="Route latency" desc="p50/p95/p99 per route AND per tenant." />
              <ConceptCard icon={<Users />} title="Top noisy tenants" desc="Rolling top-N by request rate and DB time." />
              <ConceptCard icon={<AlertTriangle />} title="Auth failures" desc="Per-tenant auth-failure rate flags abuse and misconfig." />
              <ConceptCard icon={<DollarSign />} title="Plan quota" desc="Burn vs. plan — warn before throttling." />
            </Grid>
          </Diagram>
          <DiagramWalkthrough
            steps={[
              { label: "Instrument", desc: "Tenant ID on every log line, span, and metric label." },
              { label: "Aggregate", desc: "Pre-aggregate per-tenant metrics so dashboards stay fast." },
              { label: "Alert", desc: "Alert on per-tenant SLO breaches, not just system-wide averages." },
              { label: "Throttle", desc: "Automatic per-tenant throttles and circuit breakers for runaway clients." },
              { label: "Report", desc: "Per-tenant monthly report — useful for upsell, support, and incident review." },
            ]}
          />
        </SubSection>
      </Reveal>

      <KeyTakeaways
        items={[
          "Every metric should have a tenant_id label.",
          "Per-tenant SLOs catch noisy neighbors before system-wide SLOs do.",
          "Automatic throttling beats midnight pages.",
        ]}
      />
    </>
  );
}

// Suppress unused-import warnings for icons referenced via JSX above.
void [Sparkles];
