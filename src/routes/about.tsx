import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Award, Briefcase, GraduationCap, Globe, Search } from "lucide-react";
import photoAsset from "@/assets/dibya-mishra.png.asset.json";
import * as React from "react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Dibya Ranjan Mishra — Engineering Leader" },
      { name: "description", content: "VP Engineering with 20+ years leading 500+ engineers and $28M+ budgets across Shipping, BFSI, Insurance and SaaS." },
      { property: "og:title", content: "About Dibya Ranjan Mishra — Engineering Leader" },
      { property: "og:description", content: "VP Engineering with 20+ years, 500+ engineers, $28M+ budgets, and AI/Cloud transformation across global enterprises." },
      { property: "og:url", content: "https://dibyamishrablog.lovable.app/about" },
      { property: "og:type", content: "profile" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/pI8mCXobICTShgzD4uthW89NKmv1/social-images/social-1781504443585-picofme_(4).webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "About Dibya Ranjan Mishra — Engineering Leader" },
      { name: "twitter:description", content: "VP Engineering with 20+ years, 500+ engineers, and AI/Cloud transformation across global enterprises." },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/pI8mCXobICTShgzD4uthW89NKmv1/social-images/social-1781504443585-picofme_(4).webp" },

    ],
    links: [{ rel: "canonical", href: "https://dibyamishrablog.lovable.app/about" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Dibya Ranjan Mishra",
        jobTitle: "Vice President & Country Head | Head of Engineering | Senior Director",
        description: "Vice President & Head of Engineering with 20+ years leading 500+ engineers, $28M+ budgets, and AI/Cloud platforms across Shipping, BFSI, Insurance and SaaS.",

        url: "https://dibyamishrablog.lovable.app/about",
        image: "https://storage.googleapis.com/gpt-engineer-file-uploads/pI8mCXobICTShgzD4uthW89NKmv1/social-images/social-1781504443585-picofme_(4).webp",
        sameAs: [
          "https://www.linkedin.com/in/dibya-mishra-55b94654",
          "https://github.com/mishradibyaranjan-dot/",
        ],
        knowsAbout: [
          "Artificial Intelligence",
          "Machine Learning",
          "Agentic AI",
          "Cloud Computing",
          "DevSecOps",
          "SaaS Architecture",
          "Engineering Leadership",
          "Digital Transformation",
        ],
        worksFor: { "@type": "Organization", name: "Crystal Tech Ventures" },
        alumniOf: [
          { "@type": "Organization", name: "Centific India Pvt Ltd" },
          { "@type": "Organization", name: "Deloitte Support Services" },
          { "@type": "Organization", name: "Capgemini" },
          { "@type": "Organization", name: "CGI" },
          { "@type": "Organization", name: "Accenture" },
        ],
      }),
    }],
  }),
  component: About,
});

const timeline = [
  { year: "2026 — Present", role: "Vice President & Country Head — Crystal Tech Ventures", text: "Leading Gen AI-powered retail and supply chain products, driving platform strategy, engineering delivery, and AI transformation at scale." },
  { year: "2022 — 2026", role: "Global Application Support — Inchcape Shipping Services", text: "Led 25 engineers across 5 time zones on a cloud-native vessel management platform." },
  { year: "2019 — 2022", role: "Director of Delivery — Centific India", text: "Ran a 450-person delivery org with $8M budget. Delivered Microsoft 365 and Data Platform programs for 10,000+ users. Grew revenue $1M → $20M in 24 months." },
  { year: "2017 — 2019", role: "Delivery Manager — Deloitte Support Services", text: "Built a unified web/mobile platform for Deloitte University, replacing 5 tools and automating event lifecycle for 2,000+ guests. Zero critical outages over 2.5 years." },
  { year: "2011 — 2017", role: "Senior Consultant — BFSI Domain SME — Capgemini", text: "Banking & Payments SME across 6 engagements. Architected Biller Advantage platform — cut merchant onboarding from 3 months to 4 hours (98%)." },
  { year: "2009 — 2011", role: "Senior Software Engineer — Telecom SME — CGI", text: "Designed the Payment Engine for Bell Canada serving millions of subscribers. Maintained <4-hour P1 SLA." },
  { year: "2006 — 2008", role: "Software Engineer — Accenture India", text: "Built web apps for Aflac, AAA, and Auto Club across concurrent client programs." },
];

const skillGroups = [
  { title: "AI, ML & Agentic AI", items: ["LLM Integration & Prompt Engineering", "Agentic AI System Design", "Model Context Protocol (MCP)", "AI Product Strategy & Roadmap", "MLOps & AI Automation Pipelines", "GenAI Platforms", "Human Action Detection"] },
  { title: "Cloud & Infrastructure", items: ["AWS", "Azure", "GCP", "Cloud-Native Architecture", "DevSecOps & MLOps Pipelines", "CI/CD & Release Engineering", "Microservices & API Design", "Infrastructure as Code (IaC)", "Docker", "Kubernetes", "GitHub"] },
  { title: "Technology Stack", items: [".NET Core / C#", "React", "Angular", "TypeScript", "Node.js", "Python", "SQL / NoSQL / Data Platforms", "REST APIs", "BI & Analytics", "Mobile App Development"] },
  { title: "Leadership & Delivery", items: ["P&L Management", "OKR Cascading", "Talent & Succession Planning", "C-Suite Engagement", "Vendor & Contract Mgmt", "Product Roadmap Ownership", "SAFe 6.0", "Scrum", "ITIL Service Mgmt", "Enterprise Architecture", "Lean Six Sigma", "Presales & Bid Mgmt"] },
];

const education = [
  { school: "Utkal University", degree: "Master of Computer Applications (MCA)", year: "2006" },
  { school: "Utkal University", degree: "Bachelor of Computer Applications (BCA)", year: "2004" },
];

const categories = ["All", "AI", "Cloud", "Leadership", "Delivery"] as const;

type Category = (typeof categories)[number];

interface Certification {
  name: string;
  category: Category;
  year?: string;
}

const certifications: Certification[] = [
  { name: "Model Context Protocol (MCP) — Agentic AI", category: "AI", year: "2026" },
  { name: "Agentic AI System Design — LinkedIn", category: "AI", year: "2026" },
  { name: "Generative AI on Azure — Microsoft", category: "AI", year: "2026" },
  { name: "Advanced AI Analytics on AWS — Bedrock, SageMaker, QuickSight", category: "AI", year: "2026" },
  { name: "Claude 101 — Anthropic", category: "AI", year: "2026" },
  { name: "Apache Kafka Essential Training", category: "Cloud", year: "2026" },
  { name: "SAFe 6.0 — Scaled Agile Framework", category: "Leadership", year: "2026" },
  { name: "Lean Six Sigma Foundations — PMIEF", category: "Leadership", year: "2026" },
  { name: "AWS Cloud Practitioner (CLF-C02)", category: "Cloud", year: "2025" },
  { name: "CSM — Certified Scrum Master, Scrum Alliance", category: "Leadership", year: "2017" },
  { name: "MCP / MCAD / MCPDEA — Microsoft", category: "Cloud", year: "2008" },
];

const summaryCert = "60+ certifications across AI, Cloud, Leadership & Delivery";


const languages = ["English", "Hindi", "Bengali", "Punjabi"];

function About() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<Category>("All");
  const filteredCerts = certifications.filter((c) => {
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase()) ||
      (c.year?.includes(query) ?? false);
    const matchesCategory = category === "All" || c.category === category;
    return matchesQuery && matchesCategory;
  });
  return (
    <>
      <Section className="pb-8 pt-16 lg:pt-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Badge variant="secondary" className="mb-4">About me</Badge>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Dibya Ranjan Mishra — Engineering Leader
            </h1>
            <p className="mt-3 text-lg font-medium text-gradient">
              Vice President & Country Head — Crystal Tech Ventures
            </p>
            <p className="mt-5 text-lg text-muted-foreground">
              Technology executive with 20+ years leading 500+ engineers, $28M+ budgets, and
              cloud-native platforms across Shipping, BFSI, Insurance, and SaaS. Grew revenue
              $1M → $20M in 24 months. 42 certifications spanning AI, Cloud, and Agile.
            </p>
            <p className="mt-4 text-muted-foreground">
              Delivers AI/ML and Agentic AI at scale, translating strategy into executable roadmaps.
              Deep fluency in .NET Core, React, Node.js, Python, DevSecOps, and MLOps. Seeking
              a VP Engineering or Senior Director role to drive transformational impact.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <Button asChild className="bg-brand-gradient text-white">
                <a href="https://bold.pro/my/dibya-mishra-260203120923" target="_blank" rel="noreferrer">Full Portfolio</a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Get in touch</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="card-flashy mx-auto max-w-xs overflow-hidden rounded-3xl glass-strong shadow-lg">
              <img
                src={photoAsset.url}
                alt="Portrait of Dibya Ranjan Mishra, Vice President & Head of Engineering and AI, Cloud & SaaS leader"
                width={640}
                height={640}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="aspect-square w-full object-cover"
              />
              <div className="border-t border-border p-5">
                <div className="font-display text-lg font-semibold">Dibya Ranjan Mishra</div>
                <div className="text-sm text-muted-foreground">Vice President & Country Head — Crystal Tech Ventures</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="border-t border-border pb-8">
        <SectionHeader eyebrow="Overview" title="At a glance" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Briefcase, k: "Industries", v: "BFSI · Telecom · Payments · Supply Chain · Retail · Health Care · Automobile" },
            { icon: Globe, k: "Reach", v: "Global engineering teams across 4 continents" },
            { icon: Award, k: "Focus", v: "AI Strategy · Platform · Architecture · Delivery" },
            { icon: GraduationCap, k: "Approach", v: "Research-driven, outcome-obsessed leadership" },
          ].map((c) => (
            <div key={c.k} className="card-flashy flex items-start gap-4 rounded-2xl glass-strong p-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.k}</div>
                <div className="mt-0.5 text-sm font-medium">{c.v}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border">
        <SectionHeader eyebrow="Capabilities" title="Skills & technology stack" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((g) => (
            <div key={g.title} className="card-flashy rounded-2xl glass-strong p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gradient">{g.title}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <span key={s} className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border">
        <SectionHeader eyebrow="Journey" title="Professional timeline" />
        <ol className="relative space-y-6 border-l border-border pl-6">
          {timeline.map((t) => (
            <li key={t.year} className="relative">
              <span className="absolute -left-[33px] top-1.5 grid h-4 w-4 place-items-center rounded-full bg-brand-gradient ring-4 ring-background" />
              <div className="card-flashy rounded-2xl glass-strong p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-gradient">{t.year}</div>
                <div className="mt-1 font-semibold">{t.role}</div>
                <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="border-t border-border">
        <SectionHeader eyebrow="Education & Certifications" title="Academic background & credentials" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-flashy rounded-2xl glass-strong p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gradient">
              <GraduationCap className="h-4 w-4" /> Education
            </div>
            <ul className="space-y-4">
              {education.map((e) => (
                <li key={e.degree} className="border-l-2 border-border pl-4">
                  <div className="font-semibold">{e.degree}</div>
                  <div className="text-sm text-muted-foreground">{e.school} · {e.year}</div>
                </li>
              ))}
            </ul>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div className="card-flashy cursor-pointer rounded-2xl glass-strong p-6 transition-colors hover:bg-accent/50">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gradient">
                  <Award className="h-4 w-4" /> Certifications
                </div>
                <ul className="space-y-2">
                  {certifications.map((c, i) => (
                    <li key={c.name} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gradient" />
                      <span className={i === certifications.length - 1 ? "font-bold" : ""}>
                        {c.name}{c.year ? `, ${c.year}` : ""}
                      </span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gradient" />
                    <span className="font-bold">{summaryCert}</span>
                  </li>
                </ul>
                <div className="mt-4 text-xs font-medium text-brand-1">Click to search all certifications</div>
                <div className="mt-6 border-t border-border pt-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Globe className="h-4 w-4" /> Languages
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {languages.map((l) => (
                      <span key={l} className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium">{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden p-0">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" /> Certifications
                </DialogTitle>
                <DialogDescription>
                  Search across {certifications.length} credentials
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 p-6 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search certifications..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        category === cat
                          ? "bg-brand-gradient text-white"
                          : "bg-accent text-foreground hover:bg-accent/80"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-y-auto px-6 pb-6">
                <ul className="space-y-2">
                  {filteredCerts.map((c) => (
                    <li key={c.name} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gradient" />
                      <span>
                        {c.name}{c.year ? `, ${c.year}` : ""}
                        <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {c.category}
                        </span>
                      </span>
                    </li>
                  ))}
                  {filteredCerts.length > 0 && (
                    <li className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gradient" />
                      <span className="font-bold">{summaryCert}</span>
                    </li>
                  )}
                  {filteredCerts.length === 0 && (
                    <li className="text-sm text-muted-foreground">No certifications match your search.</li>
                  )}
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Section>

    </>
  );
}
