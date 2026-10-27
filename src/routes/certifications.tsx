import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage, pageHead } from "@/components/portfolio/PortfolioPage";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import { certifications, categories, summaryCert } from "@/lib/profile";

const T = "Certifications — Dibya Ranjan Mishra";
const D = "Certifications across AI, Cloud, Leadership and Delivery, including CSM (Scrum Alliance) and SAFe 6.0.";

export const Route = createFileRoute("/certifications")({
  head: () => ({ ...pageHead("/certifications", T, D), scripts: [breadcrumbScript([{ name: "Certifications", path: "/certifications" }])] }),
  component: Certifications,
});

function Certifications() {
  return (
    <PortfolioPage eyebrow="Credentials" title="Certifications" intro={summaryCert + "."}>
      {categories.filter((c) => c !== "All").map((cat) => {
        const list = certifications.filter((c) => c.category === cat);
        if (!list.length) return null;
        return (
          <div key={cat} className="mb-10">
            <h2 className="font-display text-2xl font-semibold">{cat}</h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {list.map((c) => (
                <li key={c.name} className="flex justify-between gap-4 rounded-xl border border-border bg-card p-4">
                  <span>{c.name}</span>
                  {c.year && <span className="text-sm text-muted-foreground">{c.year}</span>}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </PortfolioPage>
  );
}
