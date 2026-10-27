import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/about", label: "Executive Profile" },
  { to: "/experience", label: "Experience" },
  { to: "/leadership", label: "Leadership" },
  { to: "/achievements", label: "Achievements" },
  { to: "/certifications", label: "Certifications" },
] as const;

export function PortfolioPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <>
      <Section className="pb-6 pt-16 lg:pt-24">
        <Badge variant="secondary" className="mb-4">{eyebrow}</Badge>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{intro}</p>
        <nav aria-label="Portfolio sections" className="mt-8 flex flex-wrap gap-2">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-muted" activeProps={{ className: "bg-primary text-primary-foreground border-primary" }}>
              {n.label}
            </Link>
          ))}
        </nav>
      </Section>
      <Section className="pt-4">{children}</Section>
      <Section className="pt-0">
        <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card p-6">
          <Button asChild><a href="/api/download/pdf?doc=executive-summary">Download Resume</a></Button>
          <Button asChild variant="outline"><Link to="/blog">Leadership Insights</Link></Button>
          <Button asChild variant="outline"><Link to="/contact">Contact Me</Link></Button>
        </div>
      </Section>
    </>
  );
}

export function pageHead(path: string, title: string, description: string) {
  const url = `https://www.dibyamishra.co.in${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
