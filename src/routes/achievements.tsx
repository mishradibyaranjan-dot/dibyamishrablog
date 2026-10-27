import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage, pageHead } from "@/components/portfolio/PortfolioPage";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { keyAchievements } from "@/lib/profile";

const T = "Key Achievements — Dibya Ranjan Mishra";
const D = "Revenue scaled $1M to $20M in 24 months, 76% incident reduction, $28M+ budget authority and three engineering orgs built.";

export const Route = createFileRoute("/achievements")({
  head: () => ({ ...pageHead("/achievements", T, D), scripts: [breadcrumbScript([{ name: "Achievements", path: "/achievements" }])] }),
  component: Achievements,
});

function Achievements() {
  return (
    <PortfolioPage eyebrow="Impact" title="Key Achievements" intro="Measured outcomes from engineering and delivery leadership roles, as recorded in my resume.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {keyAchievements.map((a) => (
          <div key={a.k} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-primary">{a.k}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{a.v}</p>
          </div>
        ))}
      </div>
    </PortfolioPage>
  );
}
