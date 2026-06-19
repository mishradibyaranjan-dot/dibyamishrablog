import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  CheckCircle2,
  Code2,
  History,
  Rocket,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/cinematic/Reveal";

export function HeroCard({
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

export function SubSection({
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

export function Grid({ cols = 4, children }: { cols?: 2 | 3 | 4; children: React.ReactNode }) {
  const colClass =
    cols === 2
      ? "sm:grid-cols-2"
      : cols === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";
  return <div className={`grid gap-4 ${colClass}`}>{children}</div>;
}

export function ConceptCard({
  icon,
  title,
  desc,
}: {
  icon?: React.ReactNode;
  title: string;
  desc: string;
}) {
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

export function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
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

export function KeyTakeaways({ items, title = "Key Takeaways" }: { items: string[]; title?: string }) {
  return (
    <Reveal>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-7 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-neon-cyan" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neon-cyan">{title}</p>
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

export function Timeline({ items }: { items: { year: string; title: string; desc: string }[] }) {
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

export function NumberedSteps({ items }: { items: { title: string; desc: string }[] }) {
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

export function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
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

export function Code({ language, code }: { language: string; code: string }) {
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

export function Diagram({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl">
      {children}
    </div>
  );
}

export function DiagramRow({ label, tint }: { label: string; tint: string }) {
  return (
    <div className={`rounded-xl border px-4 py-2.5 text-center text-sm font-medium backdrop-blur ${tint}`}>{label}</div>
  );
}

export function DiagramArrow() {
  return (
    <div className="flex justify-center">
      <span className="text-white/40">↓</span>
    </div>
  );
}

/* ------------ Diagrams ------------ */

export function StackDiagram({ layers }: { layers: { label: string; tint: string }[] }) {
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

export function AgentLoopDiagram() {
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
          {i < steps.length - 1 ? <span className="text-white/40">→</span> : <span className="text-white/40">↻</span>}
        </div>
      ))}
    </div>
  );
}

export function ServiceModelDiagram() {
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
            {[
              ...(c.you || []).map((l) => ({ l, kind: "you" as const })),
              ...(c.them || []).map((l) => ({ l, kind: "them" as const })),
            ].map(({ l, kind }) => (
              <div
                key={l}
                className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                  kind === "you" ? "bg-fuchsia-500/20 text-fuchsia-100" : "bg-cyan-500/15 text-cyan-100"
                }`}
              >
                {l}
              </div>
            ))}
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

export function CloudArchitectureDiagram() {
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
          <div className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-white/60">
            Virtual Network
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <DiagramRow label="VMs" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
            <DiagramRow label="Containers / K8s" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
            <DiagramRow label="Serverless" tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50" />
          </div>
        </div>
      </div>
      <DiagramArrow />
      <DiagramRow
        label="Storage · Databases · Managed Services"
        tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50"
      />
    </div>
  );
}

export function TenancyDiagram() {
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
                <span
                  key={t}
                  className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-100"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="flex justify-center">
              <span className="text-white/40">↓</span>
            </div>
            <div className={`grid gap-2 ${m.stacks === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {Array.from({ length: m.stacks }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-md border border-cyan-400/30 bg-cyan-500/15 px-2 py-2 text-center text-[11px] text-cyan-50"
                >
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

export function SaaSArchitectureDiagram() {
  return (
    <div className="space-y-3">
      <DiagramRow
        label="Customer Tenants (subdomains, mobile, API clients)"
        tint="bg-emerald-500/15 border-emerald-400/30 text-emerald-50"
      />
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-3">
        <DiagramRow label="CDN / WAF" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
        <DiagramRow label="OIDC IdP" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
        <DiagramRow label="API Gateway" tint="bg-amber-500/15 border-amber-400/30 text-amber-50" />
      </div>
      <DiagramArrow />
      <DiagramRow
        label="Tenant Resolver Middleware (subdomain / JWT / header)"
        tint="bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-50"
      />
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-3">
        <DiagramRow label="App Services (pooled)" tint="bg-cyan-500/15 border-cyan-400/30 text-cyan-50" />
        <DiagramRow label="Background Jobs" tint="bg-cyan-500/15 border-cyan-400/30 text-cyan-50" />
        <DiagramRow label="Per-Tenant Cache" tint="bg-cyan-500/15 border-cyan-400/30 text-cyan-50" />
      </div>
      <DiagramArrow />
      <div className="grid gap-2 sm:grid-cols-2">
        <DiagramRow
          label="Pooled Postgres + Row-Level Security"
          tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50"
        />
        <DiagramRow
          label="Premium Stamps (dedicated DB/region)"
          tint="bg-indigo-500/15 border-indigo-400/30 text-indigo-50"
        />
      </div>
      <DiagramArrow />
      <DiagramRow
        label="Observability · Billing · Audit · Backups"
        tint="bg-rose-500/15 border-rose-400/30 text-rose-50"
      />
    </div>
  );
}

/* ------------ Diagram walkthrough ------------ */

export function DiagramWalkthrough({
  steps,
}: {
  steps: { label: string; desc: string }[];
}) {
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li
          key={s.label}
          className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-gradient text-xs font-bold text-white shadow-neon">
            {i + 1}
          </span>
          <div>
            <h6 className="text-sm font-semibold text-white">{s.label}</h6>
            <p className="mt-1 text-sm text-white/70">{s.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
