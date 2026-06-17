import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Briefcase, GraduationCap, Globe } from "lucide-react";
import photoAsset from "@/assets/dibya-mishra.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Dibya Ranjan Mishra | Head of Engineering · VP · AI & Cloud Leader" },
      { name: "description", content: "Dibya Ranjan Mishra — Head of Engineering / Senior Director / VP Engineering with 20+ years across Shipping, BFSI, Insurance and Enterprise SaaS. Led 500+ engineers, managed $28M+ budgets, scaled revenue $1M → $20M, and 42 certifications across AI, Cloud and Agile." },
      { property: "og:title", content: "About Dibya Ranjan Mishra | Head of Engineering · VP · AI & Cloud Leader" },
      { property: "og:description", content: "Technology executive with 20+ years leading 500+ engineers, $28M+ budgets, AI/Agentic AI transformation, and cloud-native SaaS platforms across global enterprises." },
      { property: "og:url", content: "https://dibyamishrablog.lovable.app/about" },
      { property: "og:type", content: "profile" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/pI8mCXobICTShgzD4uthW89NKmv1/social-images/social-1781504443585-picofme_(4).webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "About Dibya Ranjan Mishra | Head of Engineering · VP · AI & Cloud Leader" },
      { name: "twitter:description", content: "Technology executive with 20+ years leading 500+ engineers, $28M+ budgets, AI/Agentic AI transformation, and cloud-native SaaS platforms across global enterprises." },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/pI8mCXobICTShgzD4uthW89NKmv1/social-images/social-1781504443585-picofme_(4).webp" },

    ],
    links: [{ rel: "canonical", href: "https://dibyamishrablog.lovable.app/about" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Dibya Ranjan Mishra",
        jobTitle: "Head of Engineering | Senior Director | Vice President of Engineering",
        description: "Technology executive with 20+ years leading 500+ engineers, $28M+ budgets, and cloud-native AI/SaaS platforms across Shipping, BFSI, Insurance and Enterprise SaaS.",

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
        worksFor: { "@type": "Organization", name: "Inchcape Shipping Services" },
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
  { year: "Nov 2022 — Jun 2026", role: "Head of Engineering & Global Application Support — Inchcape Shipping Services, Hyderabad", text: "Led 2 cross-functional teams of 40 engineers across 5 time zones owning a cloud-native vessel management platform (onboarding, customs, prefunding, agent payments) with 5+ SaaS integrations (Unit4, Eye-share). Executed multi-year roadmap cutting time-to-market 35%; AI transformation reduced recurring incidents 76% (3,800 → 900) and manual training effort 60%; biweekly releases with <2% rollback." },
  { year: "Dec 2019 — Jun 2022", role: "Director of Delivery — Centific India Pvt Ltd, Hyderabad", text: "Directed 450-person delivery org (15 Managers, 70 Tech Leads, 130 Senior Associates, 235 Junior Associates); $8M combined CAPEX+OPEX. Delivered Microsoft Office 365 / Office IP, Data Platform & BI programs for 10,000+ Microsoft employees. Grew account revenue $1M → $20M in 24 months. 200% delivery throughput, 300% performance uplift via Azure migration; ~$2M vendor savings at 99.5% SLA." },
  { year: "Jul 2017 — Dec 2019", role: "Delivery Manager — Deloitte Support Services, Hyderabad", text: "Architected unified web + mobile platform for Deloitte University (Texas) replacing 5 third-party tools and automating 100% of event lifecycle for 2,000+ annual guests. Integrated AI automation and SaaS payments — eliminated ~15 hrs/week of manual entry, reduced booking errors 90%. 10+ weekly production deployments with zero critical outages for 2.5 years." },
  { year: "Mar 2011 — Apr 2017", role: "Senior Consultant — BFSI Domain SME — Capgemini, Hyderabad", text: "SME for Banking & Payments across 6 engagements (Global Payments, Bank of America, Selective Insurance) covering 20+ US states. Architected Biller Advantage multi-portal payment platform — merchant onboarding cut from 3 months to 4 hours (98%). Delivered Boarding & Servicing platform at 99.9% uptime and core Payment Engines for Selective Insurance CLAS." },
  { year: "Jan 2009 — Dec 2011", role: "Senior Software Engineer — Telecom SME — CGI, Bangalore", text: "SME for Telecom domain. Designed and developed the Payment Engine for Bell Canada serving millions of subscribers. Led production support with <4-hour P1 resolution SLA across full defect lifecycle." },
  { year: "Jun 2006 — Dec 2008", role: "Software Engineer — Accenture India, Bangalore", text: "Built web applications for Aflac, AAA, and Auto Club. Delivered production support and enhancements across 3 concurrent client programs using Java and Python." },
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

const certifications = [
  "Getting Started with Generative AI in Azure — Microsoft, 2026",
  "Google Cloud Foundations — LinkedIn, 2026",
  "AWS Certified Cloud Practitioner (CLF-C02) Cert Prep — AWS, 2025",
  "AWS Cloud Computing — AWS, 2024",
  "Model Context Protocol (MCP): Hands-On with Agentic AI — 2026",
  "Agentic AI: Build Your First Agentic AI System — LinkedIn, 2026",
  "Agentic AI Fundamentals: Architectures, Frameworks & Applications — LinkedIn, 2026",
  "Claude 101 / Claude Code / Claude Code 101 — Anthropic, 2026",
  "Deep Learning: Getting Started — 2026",
  "Generative AI — Art of the Possible — AWS, 2026",
  "Advanced AI Analytics on AWS: Bedrock, Q, SageMaker & QuickSight — AWS, 2026",
  "Learning Amazon Bedrock — AWS, 2026",
  "Learning Amazon SageMaker AI — AWS, 2026",
  "Apache Kafka Essential Training — 2026",
  "SAFe 6.0 — Scaled Agile Framework Complete Course, 2026",
  "Lean Six Sigma Foundations — PMIEF & LinkedIn, 2026",
  "CSM — Certified Scrum Master, Scrum Alliance, 2017",
  "MCP / MCAD / MCPDEA — Microsoft, 2008",
  "42 total certifications across AI, Cloud, Leadership & Delivery",
];


const languages = ["English", "Hindi", "Bengali", "Punjabi"];

function About() {
  return (
    <>
      <Section className="pb-8 pt-16 lg:pt-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Badge variant="secondary" className="mb-4">About me</Badge>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Dibya Ranjan Mishra
            </h1>
            <p className="mt-3 text-lg font-medium text-gradient">
              Technology leader building AI-native enterprises
            </p>
            <p className="mt-5 text-lg text-muted-foreground">
              Results-driven technology executive with 21+ years of progressive leadership across
              Shipping, BFSI, Insurance, and Enterprise SaaS. Track record of growing revenue from
              $1M to $20M in 24 months, managing $28M+ combined budgets, and leading 450+ engineers
              across 5 time zones.
            </p>
            <p className="mt-4 text-muted-foreground">
              Expert at delivering cloud-native platforms (AWS, Azure, GCP), embedding AI/ML and
              Agentic AI at scale, and translating business strategy into executable technology
              roadmaps. Deep technical fluency in .NET Core, React, Node.js, Python, DevSecOps,
              and MLOps — with proven impact across enterprise architecture, change management,
              and digital transformation.
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
            <div className="card-flashy overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
              <img
                src={photoAsset.url}
                alt="Dibya Ranjan Mishra — Technology & Engineering Leader"
                className="aspect-square w-full object-cover"
                loading="eager"
              />
              <div className="border-t border-border p-5">
                <div className="font-display text-lg font-semibold">Dibya Ranjan Mishra</div>
                <div className="text-sm text-muted-foreground">Head of Engineering · AI & Cloud Leader</div>
              </div>
            </div>
            {[
              { icon: Briefcase, k: "Industries", v: "Shipping · BFSI · Insurance · Enterprise SaaS" },
              { icon: Globe, k: "Reach", v: "Global engineering teams across 4 continents" },
              { icon: Award, k: "Focus", v: "AI Strategy · Platform · Architecture · Delivery" },
              { icon: GraduationCap, k: "Approach", v: "Research-driven, outcome-obsessed leadership" },
            ].map((c) => (
              <div key={c.k} className="card-flashy flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
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
        </div>
      </Section>

      <Section className="border-t border-border">
        <SectionHeader eyebrow="Capabilities" title="Skills & technology stack" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((g) => (
            <div key={g.title} className="card-flashy rounded-2xl border border-border bg-card p-6">
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
              <div className="card-flashy rounded-2xl border border-border bg-card p-5">
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
          <div className="card-flashy rounded-2xl border border-border bg-card p-6">
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
          <div className="card-flashy rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gradient">
              <Award className="h-4 w-4" /> Certifications
            </div>
            <ul className="space-y-2">
              {certifications.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gradient" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
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
        </div>
      </Section>

    </>
  );
}
