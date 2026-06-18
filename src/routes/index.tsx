import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Cloud,
  Database,
  Layers,
  Rocket,
  Users,
  Sparkles,
  Zap,
  Shield,
  Quote,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/cinematic/Reveal";


import { Marquee } from "@/components/cinematic/Marquee";
import { posts, projects, caseStudies } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dibya Ranjan Mishra — AI, Cloud & Engineering Leadership" },
      {
        name: "description",
        content:
          "Dibya Ranjan Mishra — Head of Engineering / VP candidate. 20+ years across Shipping, BFSI, Insurance & SaaS. 500+ engineers led, $28M+ budgets, AI-first transformation.",
      },
      { property: "og:title", content: "Dibya Ranjan Mishra — Head of Engineering | AI, Cloud & SaaS Leader" },
      { property: "og:description", content: "20+ years. 500+ engineers led. $1M → $20M revenue in 24 months. 76% incident reduction via AI automation. 42 certifications." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const expertise = [
  { icon: Brain, title: "AI, ML & Agentic AI", desc: "LLM integration, prompt engineering, Model Context Protocol (MCP), and agentic system design at enterprise scale." },
  { icon: Sparkles, title: "GenAI Platforms", desc: "ChatGPT, Gemini, Claude, Amazon Bedrock, SageMaker, MLOps pipelines, and AI-driven automation." },
  { icon: Cloud, title: "Cloud-Native Architecture", desc: "AWS, Azure, GCP — DevSecOps, CI/CD, microservices, Kubernetes, and infrastructure as code." },
  { icon: Layers, title: "Enterprise SaaS Delivery", desc: "Greenfield SaaS builds, SAFe 6.0 PI planning, API strategy, and multi-tenant platform engineering." },
  { icon: Database, title: "Data & BI Platforms", desc: "Snowflake, Redshift, Kafka, dbt, Power BI — semantic layers and analytics serving 10,000+ users." },
  { icon: Users, title: "VP-Level Engineering Leadership", desc: "500+ engineers across 5 time zones, $28M+ budgets, OKR cascading, and global org transformation." },
];


const testimonials = [
  { quote: "Scaled our portfolio from $1M to $20M in 24 months through disciplined presales, POC-led bidding, and four new business lines.", author: "Microsoft Partner Account Sponsor — Centific" },
  { quote: "Zero critical production outages across 10+ weekly deployments over 2.5 years. Rigorous DevSecOps is just how Dibya operates.", author: "Engineering Partner — Deloitte University" },
  { quote: "Cut recurring incidents 76% and manual training effort 60% by deploying intelligent bots and MLOps pipelines across the platform.", author: "VP, Global Operations — Inchcape Shipping" },
  { quote: "Compressed merchant onboarding from 3 months to 4 hours — a 98% reduction — with the Biller Advantage multi-portal platform.", author: "Payments Practice Lead — Capgemini BFSI" },
];

const integrations = [
  "AWS", "Azure", "GCP", "Kubernetes", "Docker", "GitHub Actions",
  "Amazon Bedrock", "SageMaker", "Snowflake", "Redshift", "Kafka", "Power BI",
  "Claude", "ChatGPT", "Gemini", "MCP", ".NET Core", "React", "Angular", "TypeScript", "Node.js", "Python",
];


function Home() {
  const featured = posts.filter((p) => p.featured);
  const showcase = projects.slice(0, 8);
  const studies = caseStudies;
  const latest = posts.slice(0, 6);

  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section
        ref={heroRef}
        className="relative isolate flex min-h-0 items-center overflow-hidden"
      >
        {/* Local hero spotlight on top of global aurora */}
        <div className="pointer-events-none absolute inset-0 bg-hero opacity-90" />
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" />

        {/* Floating neon orbs */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-neon-purple/30 blur-3xl animate-float"
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute right-10 top-1/3 h-80 w-80 rounded-full bg-neon-cyan/25 blur-3xl animate-float"
          style={{ animationDelay: "-2s" }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-6"
        >
          <div className="mx-auto max-w-4xl text-center">
            <Reveal direction="down" duration={0.5}>
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/85">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-cyan" />
                </span>
                Head of Engineering · Senior Director · VP of Engineering
              </div>
            </Reveal>

            <Reveal delay={0.1} duration={0.9}>
              <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-8xl">
                Engineering leader behind{" "}
                <span className="shimmer-headline">AI-first transformation</span>
              </h1>
            </Reveal>

            <Reveal delay={0.25}>
              <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
                20+ years across Shipping, BFSI, Insurance and Enterprise SaaS — building cloud-native
                platforms, embedding GenAI and Agentic AI at scale, and scaling revenue from $1M to $20M in 24 months.
              </p>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-gradient text-white shadow-neon hover:opacity-95 animate-pulse-glow"
                >
                  <Link to="/research">
                    Explore Research <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white backdrop-blur hover:bg-white/10"
                >
                  <Link to="/projects">View Projects</Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
                  <Link to="/contact">Let's connect</Link>
                </Button>
              </div>
            </Reveal>

          </div>
        </motion.div>

      </section>

      {/* ===================== INTEGRATIONS MARQUEE ===================== */}
      <section className="border-y border-border/40 bg-background/40 py-6 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <p className="mb-5 text-center text-xs uppercase tracking-[0.3em] text-white/40">
            Stack & ecosystem
          </p>
          <Marquee>
            {integrations.map((tech) => (
              <div
                key={tech}
                className="flex h-12 items-center rounded-full glass px-6 text-sm font-medium text-white/80 transition-colors hover:text-neon"
              >
                {tech}
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ===================== EXPERTISE BENTO ===================== */}
      <section className="relative mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:py-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-neon-cyan/80">Key Expertise</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
              Where <span className="text-gradient">AI, platforms, and leadership</span> intersect
            </h2>
            <p className="mt-4 text-white/65">
              Disciplines I work across — applied to real enterprise outcomes, not slideware.
            </p>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {expertise.map((e, i) => (
            <Reveal key={e.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
                className="card-flashy h-full rounded-2xl glass-strong p-6"
              >
                <div className="relative z-[3] mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient text-white shadow-neon">
                  <e.icon className="h-5 w-5" />
                </div>
                <h3 className="relative z-[3] text-lg font-semibold text-white">{e.title}</h3>
                <p className="relative z-[3] mt-2 text-sm text-white/65">{e.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================== FEATURED RESEARCH RAIL (Netflix-style) ===================== */}
      <section className="relative py-6">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <Reveal>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neon-purple/80">
                  Featured Research
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                  Selected deep dives
                </h2>
              </div>
              <Button asChild variant="ghost" className="shrink-0 text-white/80 hover:text-white">
                <Link to="/research">
                  All research <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>

          <Marquee>
            {featured.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group card-flashy relative h-72 w-[440px] shrink-0 overflow-hidden rounded-2xl glass-strong p-7"
              >
                <div className="relative z-[3] flex h-full flex-col">
                  <Badge variant="secondary" className="w-fit bg-white/10 text-white/85">
                    {p.category}
                  </Badge>
                  <h3 className="mt-4 text-xl font-semibold text-white group-hover:text-neon transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm text-white/65">{p.summary}</p>
                  <div className="mt-auto flex items-center justify-between text-xs text-white/50">
                    <span>
                      {new Date(p.date).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1 text-neon-cyan">
                      Read <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ===================== PROJECT SHOWCASE RAIL ===================== */}
      <section className="relative py-6">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <Reveal>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neon-cyan/80">
                  Selected Projects
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                  From AI platforms to global modernization
                </h2>
              </div>
              <Button asChild variant="ghost" className="shrink-0 text-white/80 hover:text-white">
                <Link to="/projects">
                  All projects <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>

          <Marquee>
            {showcase.map((p) => (
              <div
                key={p.slug}
                className="card-flashy relative h-[22rem] w-[420px] shrink-0 overflow-hidden rounded-2xl glass-strong p-7"
              >
                <div className="relative z-[3] flex h-full flex-col">
                  <Badge variant="secondary" className="w-fit bg-white/10 text-white/85">
                    {p.area}
                  </Badge>
                  <h3 className="mt-4 text-lg font-semibold text-white">{p.name}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-white/65">{p.solution}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.metrics.map((m) => (
                      <span
                        key={m}
                        className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-neon-cyan"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Link to="/projects">View details <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ===================== CASE STUDIES TIMELINE ===================== */}
      <section className="relative py-6">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-neon-purple/80">
                Customer Success Stories
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
                Case studies at <span className="text-gradient">enterprise scale</span>
              </h2>
            </div>
          </Reveal>

          <div className="relative mt-8">
            {/* Vertical neon line */}
            <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-neon-blue/0 via-neon-purple/60 to-neon-cyan/0 md:block" />

            <div className="space-y-6">
              {studies.map((s, i) => (
                <Reveal key={s.slug} direction={i % 2 === 0 ? "right" : "left"}>
                  <div className={`grid items-center gap-6 md:grid-cols-2 ${i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"}`}>
                    <div className="card-flashy rounded-2xl glass-strong p-7">
                      <Badge variant="secondary" className="bg-white/10 text-white/85">
                        {s.area}
                      </Badge>
                      <h3 className="mt-3 text-xl font-semibold text-white">{s.title}</h3>
                      <p className="mt-3 text-sm text-white/70">{s.challenge}</p>
                      <p className="mt-3 text-sm text-white/65">
                        <span className="font-semibold text-neon-cyan">Outcome — </span>
                        {s.outcome}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {s.stack.slice(0, 5).map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/75"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="hidden md:flex md:justify-center">
                      <div className="relative h-44 w-44 rounded-full bg-brand-gradient opacity-90 shadow-neon animate-pulse-glow">
                        <div className="absolute inset-3 rounded-full bg-background/80 backdrop-blur" />
                        <div className="absolute inset-0 grid place-items-center">
                          <Zap className="h-10 w-10 text-neon-cyan" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button asChild size="lg" className="bg-brand-gradient text-white shadow-neon hover:opacity-90">
              <Link to="/case-studies">All case studies <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS MARQUEE ===================== */}
      <section className="relative py-6">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-neon-cyan/80">Testimonials</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
                Trusted by leaders across <span className="text-gradient">global enterprises</span>
              </h2>
            </div>
          </Reveal>

          <div className="mt-6">
            <Marquee>
              {testimonials.map((t) => (
                <div
                  key={t.author}
                  className="w-[28rem] shrink-0 rounded-2xl glass-strong p-7"
                >
                  <Quote className="h-6 w-6 text-neon-purple" />
                  <p className="mt-3 text-sm leading-relaxed text-white/80">"{t.quote}"</p>
                  <p className="mt-4 text-xs uppercase tracking-wider text-white/50">
                    — {t.author}
                  </p>
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </section>

      {/* ===================== LATEST POSTS GRID ===================== */}
      <section className="relative py-6">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <Reveal>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neon-blue/80">Latest Posts</p>
                <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                  From the research & blog
                </h2>
              </div>
              <Button asChild variant="ghost" className="shrink-0 text-white/80 hover:text-white">
                <Link to="/research">
                  All articles <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>

          <Marquee>
            {latest.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group card-flashy flex h-72 w-[400px] shrink-0 flex-col rounded-2xl glass p-6"
              >
                <div className="relative z-[3] flex items-center justify-between text-xs text-white/55">
                  <span className="rounded-full border border-white/15 px-2 py-0.5 text-neon-cyan">
                    {p.category}
                  </span>
                  <span>{p.readingTime}</span>
                </div>
                <h3 className="relative z-[3] mt-4 text-lg font-semibold text-white group-hover:text-neon transition-colors">
                  {p.title}
                </h3>
                <p className="relative z-[3] mt-2 line-clamp-3 text-sm text-white/65">
                  {p.summary}
                </p>
                <div className="relative z-[3] mt-auto flex items-center justify-between pt-4 text-xs text-white/50">
                  <span>
                    {new Date(p.date).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <ArrowRight className="h-4 w-4 text-neon-cyan transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="relative px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="card-flashy relative overflow-hidden rounded-[2rem] glass-strong p-10 text-center shadow-neon sm:p-16">
              <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-aurora animate-aurora" />
              <div className="relative z-[3]">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-neon">
                  <Rocket className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-3xl font-bold text-white sm:text-5xl">
                  Let's build the next <span className="text-gradient">breakthrough</span>.
                </h3>
                <p className="mx-auto mt-4 max-w-xl text-white/70">
                  Advisory, architecture reviews, or a conversation about AI and engineering
                  leadership.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="bg-brand-gradient text-white shadow-neon hover:opacity-95"
                  >
                    <Link to="/contact">
                      Start a conversation <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Link to="/about">
                      <Shield className="mr-1 h-4 w-4" /> About me
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
