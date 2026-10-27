import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage, pageHead } from "@/components/portfolio/PortfolioPage";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { skillGroups } from "@/lib/profile";

const T = "Engineering Leadership — Dibya Ranjan Mishra";
const D = "Leadership across GCC setup, global delivery, cloud modernisation, GenAI and Agentic AI, with org design and P&L ownership.";

const pillars = [
  { h: "GCC & India development centres", p: "Ground-up Global Capability Centre setup in India — country P&L, org design, hiring and delivery governance." },
  { h: "Global engineering & delivery", p: "Led delivery organisations of up to 450 people and OKRs cascaded across 500+ engineers in India, Europe and the Americas." },
  { h: "Cloud & AI transformation", p: "Cloud-native architecture on AWS, Azure and GCP, with GenAI, Agentic AI and MLOps built in from day one." },
  { h: "Budget & vendor governance", p: "$28M+ combined CAPEX/OPEX authority and ~$2M saved by renegotiating vendor contracts." },
];

export const Route = createFileRoute("/leadership")({
  head: () => ({ ...pageHead("/leadership", T, D), scripts: [breadcrumbScript([{ name: "Leadership", path: "/leadership" }])] }),
  component: Leadership,
});

function Leadership() {
  return (
    <PortfolioPage eyebrow="Leadership" title="Engineering Leadership" intro="How I build, scale and run engineering organisations — from first hire to multi-country delivery.">
      <div className="grid gap-5 md:grid-cols-2">
        {pillars.map((x) => (
          <div key={x.h} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">{x.h}</h2>
            <p className="mt-2 text-muted-foreground">{x.p}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-14 font-display text-2xl font-semibold">Capabilities</h2>
      <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((g) => (
          <div key={g.title} className="rounded-xl border border-border p-5">
            <h3 className="font-semibold">{g.title}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {g.items.map((i) => <li key={i} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground">{i}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </PortfolioPage>
  );
}
