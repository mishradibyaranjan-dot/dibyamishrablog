import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewsletterCta } from "@/components/marketing/NewsletterCta";
import { caseStudies, posts } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";
import type { LandingPageContent } from "@/lib/landing-pages";

/**
 * Shared renderer for the SEO landing pages. Sections follow the master
 * brief: business problem, executive context, approach, architecture
 * perspective, relevant experience, case studies, related research, CTA.
 */
export function LandingPage({ page }: { page: LandingPageContent }) {
  const relatedCaseStudies = caseStudies.filter((cs) => page.caseStudySlugs.includes(cs.slug));
  const relatedPosts = posts.filter((p) => page.relatedPostSlugs.includes(p.slug));

  return (
    <div>
      <Section className="pb-10 pt-16 lg:pt-24">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <Link to="/advisory" className="hover:text-foreground">Advisory</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{page.eyebrow}</span>
        </nav>
        <Badge variant="secondary" className="mb-4">{page.eyebrow}</Badge>
        <h1 className="max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-5xl">
          {page.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {page.heroCopy}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild className="bg-brand-gradient text-white">
            <Link
              to="/contact"
              onClick={() => trackEvent("advisory_cta_click", { source: page.slug })}
            >
              {page.ctaLabel}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/case-studies">Explore Case Studies</Link>
          </Button>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card-flashy rounded-3xl glass-strong p-7 sm:p-10">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {page.problem.heading}
          </h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">{page.problem.body}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {page.problem.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          The Executive Context
        </h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
          {page.executiveContext}
        </p>
      </Section>

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          The Approach
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {page.approach.map((step, i) => (
            <div key={step.title} className="card-flashy rounded-2xl glass-strong p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-1">
                Step {i + 1}
              </div>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card-flashy rounded-3xl glass-strong p-7 sm:p-10">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            The Architecture Perspective
          </h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">{page.architecture.body}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {page.architecture.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Relevant Experience
        </h2>
        <ul className="mt-6 space-y-3">
          {page.experience.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm sm:text-base">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {relatedCaseStudies.length > 0 && (
        <Section className="pt-0">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Related Case Studies
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {relatedCaseStudies.map((cs) => (
              <Link
                key={cs.slug}
                to="/case-study/$slug"
                params={{ slug: cs.slug }}
                onClick={() => trackEvent("case_study_view", { source: page.slug })}
                className="card-flashy rounded-2xl glass-strong p-6 transition-all hover:-translate-y-0.5 hover:shadow-glow"
              >
                <Badge variant="secondary" className="mb-2">{cs.industry}</Badge>
                <div className="font-semibold">{cs.title}</div>
                <ul className="mt-3 space-y-1.5">
                  {cs.outcomeMetrics.slice(0, 3).map((m) => (
                    <li key={m} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-1">
                  View Case Study <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {relatedPosts.length > 0 && (
        <Section className="pt-0">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Related Research
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                onClick={() => trackEvent("research_view", { source: page.slug })}
                className="card-flashy rounded-2xl glass-strong p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
              >
                <Badge variant="secondary" className="mb-2">{p.category}</Badge>
                <div className="font-semibold">{p.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{p.readingTime}</div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section className="pt-0">
        <div className="card-flashy rounded-3xl glass-strong p-7 text-center sm:p-10">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {page.ctaLabel}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            A focused conversation about your situation — no pitch decks, no obligation.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-brand-gradient text-white">
              <Link
                to="/contact"
                onClick={() => trackEvent("advisory_cta_click", { source: `${page.slug}-footer` })}
              >
                Start a Conversation
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/advisory">All Advisory Areas</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <NewsletterCta />
      </Section>
    </div>
  );
}
