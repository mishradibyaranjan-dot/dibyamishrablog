import { Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink, Menu } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NAVIGATION_ITEMS } from '@/lib/navigation-items';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeferredAssistant } from "@/components/chat/DeferredAssistant";
import { ContextNavigation } from './ContextNavigation';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useTheme } from '@/components/theme/ThemeProvider';
import { isFutureTheme } from '@/components/theme/experience';
import { FloatingConnectCta } from "@/components/marketing/FloatingConnectCta";
import { SiteBanner } from "@/components/layout/SiteBanner";
import { SideRail } from "@/components/layout/SideRail";
import { AuroraBackground } from "@/components/cinematic/AuroraBackground";
import { PageTransition } from "@/components/cinematic/PageTransition";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { ReadAloudButton } from "@/components/voice/ReadAloudButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityMenu, SelectionReader } from "@/components/a11y/AccessibilityMenu";
import { LanguageToggle } from "@/components/a11y/LanguageToggle";
import { FullPageTranslation } from "@/components/a11y/FullPageTranslation";
import { SkipToContent, LiveAnnouncer } from "@/components/a11y/SkipToContent";
import { ColorVisionFilters } from "@/components/a11y/ColorVisionFilters";
import { MediaPauseGuard } from "@/components/a11y/MediaPauseGuard";


import { AuthProvider } from "@/lib/auth";
import { SpamDomainGuard } from "@/components/auth/SpamDomainGuard";
import { SessionTimeout } from "@/components/auth/SessionTimeout";

import { useActivityTracker } from "@/lib/tracking";
import { useVisitorTracker } from "@/lib/visitor-tracking";

import drmLogo from "@/assets/drm-logo.png.asset.json";
import { MathCaptcha, useCaptchaGate } from "@/components/security/CaptchaChallenge";
import { copyrightLine, RESTRICTED_USE_LINE } from "@/lib/legal-config";
import { FormPrivacyNotice } from "@/components/legal/FormPrivacyNotice";
import { CookieConsent, CookiePreferencesLink } from "@/components/legal/CookieConsent";
import { ConsentGatedScripts } from "@/components/legal/ConsentGatedScripts";
import { useCookieConsent } from "@/lib/cookie-consent";


function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const captcha = useCaptchaGate("newsletter-form", 2);
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
        const email = input?.value?.trim();
        if (!email) return;
        if (!captcha.canSubmit) {
          setStatus("error");
          setError("Please complete the security check.");
          return;
        }
        setStatus("sending");
        setError(null);
        try {
          const res = await fetch("/api/public/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (!res.ok) {
            const b = await res.json().catch(() => ({}));
            throw new Error(b?.error ?? `Failed (${res.status})`);
          }
          setStatus("ok");
          captcha.reset();
          input.value = "";
        } catch (err) {
          setStatus("error");
          captcha.recordFailure();
          setError(err instanceof Error ? err.message : "Subscription failed");
        }
      }}
    >
      <div className="flex w-full flex-col gap-2">
        <div className="flex gap-2">
          <input
            name="email"
            type="email"
            required
            disabled={status === "sending"}
            placeholder="you@company.com"
            aria-label="Email address for newsletter"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
          />

          <Button
            size="sm"
            type="submit"
            disabled={status === "sending" || !captcha.canSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {status === "sending" ? "…" : "Join"}
          </Button>
        </div>
        {captcha.required && (
          <MathCaptcha verified={captcha.verified} onSolved={captcha.markVerified} />
        )}
        {status === "ok" && (
          <p className="text-xs text-success">Thanks — you're subscribed!</p>
        )}
        {status === "error" && (
          <p className="text-xs text-danger">{error ?? "Something went wrong."}</p>

        )}
        <FormPrivacyNotice />
      </div>

    </form>
  );
}

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/expertise", label: "Expertise" },
  { to: "/advisory", label: "Advisory" },
  { to: "/case-studies", label: "Case Studies" },
  { to: "/projects", label: "Projects" },
  { to: "/learn", label: "Learn" },
  { to: "/research", label: "Research" },
  { to: "/jobs", label: "Jobs" },
  { to: "/contact", label: "Contact" },
] as const;

const MORE_NAV = [
  { to: "/my-career", label: "My Career" },
  { to: "/resume-analyzer", label: "Resume Comparison" },
  { to: "/interview-prep", label: "AI Interview Prep" },
  { to: "/playbook", label: "AI Playbook" },
  { to: "/newsletter", label: "Newsletter" },
  { to: "/guide", label: "Guided Tour" },
  { to: "/repository", label: "Repository" },
  { to: "/trust", label: "Trust & Privacy" },
] as const;


const PRIMARY_NAV = [
  { to: "/about", label: "About" },
  { to: "/advisory", label: "Advisory" },
  { to: "/projects", label: "Projects" },
  { to: "/research", label: "Insights" },
  { to: "/jobs", label: "Jobs" },
] as const;

const EXPLORE_GROUPS = [
  { title: "Profile", items: [
    { to: "/about", label: "Executive profile" }, { to: "/experience", label: "Experience" },
    { to: "/leadership", label: "Leadership" }, { to: "/achievements", label: "Achievements" },
    { to: "/certifications", label: "Certifications" }, { to: "/expertise", label: "Expertise" },
  ] },
  { title: "Work & ideas", items: [
    { to: "/advisory", label: "Advisory" }, { to: "/projects", label: "Projects" },
    { to: "/research", label: "Research" }, { to: "/learn", label: "Learn" },
    { to: "/newsletter", label: "Newsletter" }, { to: "/playbook", label: "AI Playbook" },
  ] },
  { title: "Careers", items: [
    { to: "/jobs", label: "Jobs" }, { to: "/jobs/remote", label: "Remote jobs" },
    { to: "/my-career", label: "My Career" }, { to: "/resume-analyzer", label: "Resume comparison" },
    { to: "/interview-prep", label: "Interview preparation" },
  ] },
  { title: "Site", items: [
    { to: "/", label: "Home" }, { to: "/guide", label: "Guided tour" },
    { to: "/contact", label: "Contact" }, { to: "/trust", label: "Trust & privacy" },
  ] },
] as const;

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header data-site-header data-scrolled={scrolled ? "true" : "false"} className="studio-header sticky top-0 z-50 w-full">
      <div className="studio-bar studio-ink">
        <div className="studio-bar-row">
          <Link to="/" className="studio-brand" aria-label="Dibya Ranjan Mishra — home">
            <motion.img
              whileHover={{ rotate: -8, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              src={drmLogo.url}
              alt=""
              width={36}
              height={36}
              className="studio-brand-mark"
            />
            <span className="studio-brand-text">
              <span className="studio-brand-name">Dibya Ranjan Mishra</span>
              <span className="studio-brand-role">AI · Cloud · Engineering</span>
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="studio-nav">
            {PRIMARY_NAV.map((n) => (
              <Link key={n.to} to={n.to} className="studio-nav-link" activeProps={{ "aria-current": "page", className: "studio-nav-link is-active" }}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div role="group" aria-label="Site controls" className="studio-tools studio-tools-desktop">
            <GlobalSearch compact />
            <ReadAloudButton compact />
            <ThemeToggle compact />
            <LanguageToggle compact />
            <AccessibilityMenu compact />
          </div>

          <div className="studio-actions">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="studio-explore" aria-label="Open site navigation">
                  <Menu className="h-4 w-4" /><span className="hidden sm:inline">Explore</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="studio-mega studio-ink max-h-[100dvh] overflow-y-auto">
                <div className="studio-mega-inner">
                  <div className="studio-mega-intro">
                    <SheetTitle className="studio-mega-title">Explore the site</SheetTitle>
                    <SheetDescription className="studio-mega-description">Every page, grouped by what you came to do.</SheetDescription>
                    <div role="group" aria-label="Menu display options" className="studio-mega-tools">
                      <ThemeToggle />
                      <LanguageToggle />
                      <AccessibilityMenu />
                    </div>
                    <SheetClose asChild>
                      <Link to="/auth" search={{ mode: "login" }} className="studio-mega-admin">Admin login<ExternalLink className="h-3.5 w-3.5" /></Link>
                    </SheetClose>
                  </div>
                  <nav aria-label="All pages" className="studio-mega-groups">
                    {EXPLORE_GROUPS.map((group) => (
                      <div key={group.title}>
                        <p className="studio-mega-group-title">{group.title}</p>
                        <ul>
                          {group.items.map((item) => (
                            <li key={item.to}>
                              <SheetClose asChild>
                                <Link to={item.to} className="studio-mega-link" activeOptions={{ exact: true }} activeProps={{ "aria-current": "page", className: "studio-mega-link is-active" }}>
                                  {item.label}
                                </Link>
                              </SheetClose>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <UserMenu />
            <Button asChild className="studio-cta studio-header-cta">
              <Link to="/contact">Let’s talk</Link>
            </Button>
          </div>
        </div>
        <div role="group" aria-label="Site controls" className="studio-tools studio-tools-mobile">
          <GlobalSearch compact />
          <ReadAloudButton compact />
          <ThemeToggle compact />
          <LanguageToggle compact />
          <AccessibilityMenu compact />
          <Link to="/jobs" className="studio-mobile-jobs">Jobs</Link>
        </div>
      </div>
    </header>
  );
}



function Footer() {
  return (
    <footer data-site-footer className="premium-footer relative border-t border-border bg-background text-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <img src={drmLogo.url} alt="Dibya Ranjan Mishra site logo" width={36} height={36} decoding="async" className="h-9 w-9 rounded-lg object-contain" />
            Dibya Ranjan Mishra
          </div>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Research, insights, and real-world technology work on GenAI, Agentic AI,
            Cloud-Native Platforms, SaaS Architecture, and Engineering Leadership.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <a href="https://github.com/mishradibyaranjan-dot/" target="_blank" rel="noreferrer" aria-label="GitHub">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="https://bold.pro/my/dibya-mishra-260203120923" target="_blank" rel="noreferrer" aria-label="Portfolio">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="https://www.linkedin.com/in/dibya-mishra-55b94654" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {[...NAV.slice(1), ...MORE_NAV].map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="transition-colors hover:text-primary">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Newsletter</h4>
          <p className="mt-3 text-sm text-muted-foreground">
            Monthly research notes on AI, Cloud, and Engineering Leadership.
          </p>
          <NewsletterForm />
          <div className="mt-6 border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-foreground">Display options</h4>
            <div role="group" aria-label="Footer display options" className="mt-2 grid grid-cols-2 gap-1.5">
              <ThemeToggle />
              <LanguageToggle />
              <AccessibilityMenu />
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p>{copyrightLine()}</p>
            <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link to="/privacy" className="transition-colors hover:text-primary">Privacy Notice</Link>
              <span aria-hidden="true">|</span>
              <Link to="/terms" className="transition-colors hover:text-primary">Terms of Use</Link>
              <span aria-hidden="true">|</span>
              <Link to="/copyright" className="transition-colors hover:text-primary">Copyright &amp; Content Use</Link>
              <span aria-hidden="true">|</span>
              <CookiePreferencesLink className="transition-colors hover:text-primary" />
              <span aria-hidden="true">|</span>
              <Link to="/contact" className="transition-colors hover:text-primary">Contact</Link>
              <span aria-hidden="true">|</span>
              <Link to="/auth" search={{ mode: "login" }} className="transition-colors hover:text-primary">Admin Login</Link>

            </nav>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground/80">{RESTRICTED_USE_LINE}</p>
        </div>
      </div>
    </footer>
  );
}



function TrackerMount() {
  const { prefs } = useCookieConsent();
  useActivityTracker();
  // First-party visitor analytics only run once the analytics category is accepted.
  useVisitorTracker(prefs.analytics);
  return null;
}



export function SiteLayout() {
  return (
    <AccessibilityProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <SpamDomainGuard>
              <TrackerMount />
              <SessionTimeout />
              <MediaPauseGuard />
              <SelectionReader />
              <ColorVisionFilters />
              <FullPageTranslation />
              <div className="relative flex min-h-dvh flex-col">
                <SkipToContent />
                <Header />
                <SideRail />
                <div data-a11y-filter-surface className="relative flex flex-1 flex-col">
                  <AuroraBackground />
                  <SiteBanner />
                  <ContextNavigation />
                  <main id="main-content" className="experience-main relative flex-1 lg:pl-20">
                    <PageTransition />
                  </main>
                  <Footer />
                </div>
                <LiveAnnouncer />
                <DeferredAssistant />
                <FloatingConnectCta />
                <CookieConsent />
                <ConsentGatedScripts />
              </div>
            </SpamDomainGuard>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AccessibilityProvider>
  );
}
