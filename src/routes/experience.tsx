import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage, pageHead } from "@/components/portfolio/PortfolioPage";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { timeline, education } from "@/lib/profile";

const T = "Professional Experience — Dibya Ranjan Mishra";
const D = "20+ years across Crystal Tech Ventures, Inchcape Shipping, Centific, Deloitte, Capgemini, CGI and Accenture.";

export const Route = createFileRoute("/experience")({
  head: () => ({ ...pageHead("/experience", T, D), scripts: [breadcrumbScript([{ name: "Experience", path: "/experience" }])] }),
  component: Experience,
});

function Experience() {
  return (
    <PortfolioPage eyebrow="Career" title="Professional Experience" intro="Two decades of engineering, delivery and country leadership across shipping, BFSI, insurance, retail, SaaS and supply chain.">
      <ol className="relative space-y-8 border-l border-border pl-6">
        {timeline.map((t) => (
          <li key={t.role}>
            <span className="absolute -left-1.5 mt-2 h-3 w-3 rounded-full bg-primary" aria-hidden />
            <p className="text-sm font-medium text-primary">{t.year}</p>
            <h2 className="mt-1 font-display text-xl font-semibold">{t.role}</h2>
            <p className="mt-2 text-muted-foreground">{t.text}</p>
          </li>
        ))}
      </ol>
      <h2 className="mt-14 font-display text-2xl font-semibold">Education</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {education.map((e) => (
          <li key={e.degree} className="rounded-xl border border-border bg-card p-5">
            <p className="font-semibold">{e.degree}</p>
            <p className="text-sm text-muted-foreground">{e.school} · {e.year}</p>
          </li>
        ))}
      </ul>
    </PortfolioPage>
  );
}
