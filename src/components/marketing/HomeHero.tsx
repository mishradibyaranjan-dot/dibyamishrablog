import { Link } from '@tanstack/react-router';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, FileSearch, GraduationCap, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/cinematic/Reveal';
import { trackEvent } from '@/lib/analytics';

const PROOF = [
  { value: '20+', label: 'Years leading technology' },
  { value: '500+', label: 'Engineers aligned on OKRs' },
  { value: '$28M+', label: 'Annual budget authority' },
  { value: '5', label: 'Time zones, one delivery rhythm' },
] as const;

const CAPABILITIES = [
  'Agentic AI', 'Retrieval-augmented generation', 'Cloud modernization', 'Multi-tenant SaaS',
  'GCC strategy', 'Engineering transformation', 'FinOps guardrails', 'Platform reliability',
] as const;

const ORBIT_LABELS = [
  { label: 'Agentic AI', className: 'studio-chip-a' },
  { label: 'RAG systems', className: 'studio-chip-b' },
  { label: 'Cloud platforms', className: 'studio-chip-c' },
  { label: 'SaaS at scale', className: 'studio-chip-d' },
  { label: 'GCC leadership', className: 'studio-chip-e' },
] as const;

/** Animated orbital system: rotating rings, travelling data pulses and floating capability chips. */
function OrbitGraphic() {
  return (
    <div className="studio-orbit" aria-hidden="true">
      <svg viewBox="0 0 520 520" className="studio-orbit-svg">
        <defs>
          <radialGradient id="studio-core-glow">
            <stop offset="0%" className="studio-stop-signal" />
            <stop offset="100%" className="studio-stop-clear" />
          </radialGradient>
        </defs>
        <circle cx="260" cy="260" r="250" className="studio-ring studio-ring-faint" />
        <g className="studio-spin studio-spin-slow">
          <circle cx="260" cy="260" r="210" className="studio-ring studio-ring-dashed" />
          <circle cx="470" cy="260" r="7" className="studio-node studio-node-signal" />
          <circle cx="50" cy="260" r="5" className="studio-node studio-node-ember" />
          <circle cx="260" cy="50" r="4" className="studio-node" />
        </g>
        <g className="studio-spin studio-spin-reverse">
          <circle cx="260" cy="260" r="150" className="studio-ring" />
          <circle cx="366" cy="154" r="6" className="studio-node studio-node-ember" />
          <circle cx="154" cy="366" r="6" className="studio-node studio-node-signal" />
        </g>
        <g className="studio-spin studio-spin-fast">
          <circle cx="260" cy="260" r="92" className="studio-ring studio-ring-dashed" />
          <circle cx="352" cy="260" r="4.5" className="studio-node" />
        </g>
        {[
          'M260 260 L470 140', 'M260 260 L70 150', 'M260 260 L440 400', 'M260 260 L90 410', 'M260 260 L260 40',
        ].map((d, i) => (
          <path key={d} d={d} className="studio-pulse" style={{ animationDelay: `${i * 0.7}s` }} />
        ))}
        <circle cx="260" cy="260" r="120" fill="url(#studio-core-glow)" className="studio-core-glow" />
        <circle cx="260" cy="260" r="54" className="studio-core" />
        <text x="260" y="268" textAnchor="middle" className="studio-core-text">AI</text>
      </svg>
      {ORBIT_LABELS.map((chip, i) => (
        <span key={chip.label} className={`studio-chip ${chip.className}`} style={{ animationDelay: `${i * 0.6}s` }}>
          <span className="studio-chip-dot" />{chip.label}
        </span>
      ))}
    </div>
  );
}

export function HomeHero() {
  return (
    <section className="studio-hero studio-ink" aria-labelledby="home-title">
      <div className="studio-hero-mesh" aria-hidden="true"><span /><span /><span /></div>
      <div className="studio-hero-grid" aria-hidden="true" />
      <div className="studio-hero-inner">
        <div className="studio-hero-copy">
          <p className="studio-kicker"><span className="studio-live-dot" />Vice President &amp; Country Head · Crystal Tech Ventures</p>
          <h1 id="home-title">
            <span className="studio-hero-name">Dibya Ranjan Mishra</span>
            <span className="studio-hero-line">Enterprise AI,</span>
            <span className="studio-hero-line">engineered to <em>ship.</em></span>
          </h1>
          <p className="studio-hero-lede">
            AI strategy, cloud-native platforms and engineering leadership — taking enterprise ambition from the boardroom to production.
          </p>
          <div className="studio-hero-actions">
            <Button size="lg" asChild className="studio-cta">
              <Link to="/contact" onClick={() => trackEvent('hero_cta_click', { cta: 'discuss_transformation' })}>
                Let’s build what’s next<ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="studio-cta-ghost">
              <Link to="/projects">Explore the work<ArrowUpRight /></Link>
            </Button>
            <Link to="/guide" className="studio-tour-link"><PlayCircle className="h-4 w-4" />30-second guided tour</Link>
          </div>
          <dl className="studio-proof">
            {PROOF.map((item) => (
              <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>
            ))}
          </dl>
        </div>
        <OrbitGraphic />
      </div>
      <nav aria-label="Executive portfolio" className="studio-profile-links">
        {([
          { to: '/about', label: 'Executive profile' }, { to: '/experience', label: 'Experience' },
          { to: '/leadership', label: 'Leadership' }, { to: '/achievements', label: 'Achievements' },
          { to: '/certifications', label: 'Certifications' }, { to: '/research', label: 'Insights' },
        ] as const).map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}
        <a href="/api/download/pdf?doc=executive-summary">Download resume<ArrowUpRight className="h-3 w-3" /></a>
      </nav>
      <div className="studio-marquee" aria-hidden="true">
        <div className="studio-marquee-track">
          {[...CAPABILITIES, ...CAPABILITIES].map((item, i) => <span key={`${item}-${i}`}>{item}<i>✦</i></span>)}
        </div>
      </div>
    </section>
  );
}

export function WorkspaceShowcase() {
  return (
    <section className="studio-showcase" aria-labelledby="workspace-showcase-title">
      <Reveal>
        <div className="studio-showcase-heading">
          <p className="studio-eyebrow">The career workspace</p>
          <h2 id="workspace-showcase-title">Your next chapter. <em>One connected workspace.</em></h2>
          <p>Verified opportunities, evidence-based resume observations and focused interview preparation.</p>
        </div>
      </Reveal>
      <div className="studio-workflow">
        {([
          { to: '/jobs', icon: BriefcaseBusiness, title: 'Discover', body: 'Explore verified jobs from official employer feeds.' },
          { to: '/resume-analyzer', icon: FileSearch, title: 'Refine', body: 'Review your resume with evidence-based observations.' },
          { to: '/interview-prep', icon: GraduationCap, title: 'Prepare', body: 'Build a focused interview preparation session.' },
        ] as const).map((item, i) => (
          <Reveal key={item.to} delay={i * 0.08}>
            <Link to={item.to} className="studio-workflow-step">
              <span className="studio-step-number">0{i + 1}</span>
              <item.icon className="h-7 w-7" />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <ArrowRight className="studio-step-arrow h-5 w-5" />
            </Link>
          </Reveal>
        ))}
      </div>
      <Button variant="outline" asChild><Link to="/my-career">Open My Career<ArrowRight /></Link></Button>
    </section>
  );
}
