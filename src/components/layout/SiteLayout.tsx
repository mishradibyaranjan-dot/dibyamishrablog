import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { AuroraBackground } from "@/components/cinematic/AuroraBackground";
import { PageTransition } from "@/components/cinematic/PageTransition";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ReadAloudButton } from "@/components/voice/ReadAloudButton";
import { AuthProvider } from "@/lib/auth";
import { UserMenu } from "@/components/auth/UserMenu";
import { useActivityTracker } from "@/lib/tracking";

import drmLogo from "@/assets/drm-logo.png.asset.json";

function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
        const email = input?.value?.trim();
        if (!email) return;
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
          input.value = "";
        } catch (err) {
          setStatus("error");
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
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/40 disabled:opacity-60"
          />
          <Button
            size="sm"
            type="submit"
            disabled={status === "sending"}
            className="bg-brand-gradient text-white shadow-neon"
          >
            {status === "sending" ? "…" : "Join"}
          </Button>
        </div>
        {status === "ok" && (
          <p className="text-xs text-emerald-400">Thanks — you're subscribed!</p>
        )}
        {status === "error" && (
          <p className="text-xs text-red-400">{error ?? "Something went wrong."}</p>
        )}
      </div>
    </form>
  );
}

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/learn", label: "Learn" },
  { to: "/research", label: "Research" },
  { to: "/projects", label: "Projects" },
  { to: "/case-studies", label: "Case Studies" },
  { to: "/contact", label: "Contact" },
] as const;

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      data-site-header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-background/60 backdrop-blur-xl shadow-[0_8px_30px_-15px_oklch(0_0_0/0.6)]"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2 font-display text-lg font-bold">
          <motion.img
            whileHover={{ rotate: 8, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            src={drmLogo.url}
            alt="DRM logo"
            className="h-9 w-9 shrink-0 rounded-lg object-contain shadow-neon"
          />
          <span className="truncate text-white">Dibya R. Mishra</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" data-site-nav>
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-white" : "text-white/65 hover:text-white",
                )}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-brand-gradient shadow-neon"
                    transition={{ type: "spring", stiffness: 360, damping: 28 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ReadAloudButton />
          <ThemeToggle />
          <UserMenu />
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/10 bg-background/85 backdrop-blur-xl lg:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white"
                  activeProps={{ className: "text-white bg-white/10" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer data-site-footer className="relative border-t border-white/10 bg-background/60 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <img src={drmLogo.url} alt="DRM logo" className="h-9 w-9 rounded-lg object-contain shadow-neon" />
            Dibya Ranjan Mishra
          </div>
          <p className="mt-3 max-w-md text-sm text-white/65">
            Research, insights, and real-world technology work on GenAI, Agentic AI,
            Cloud-Native Platforms, SaaS Architecture, and Engineering Leadership.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              <a
                href="https://github.com/mishradibyaranjan-dot/"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              <a
                href="https://bold.pro/my/dibya-mishra-260203120923"
                target="_blank"
                rel="noreferrer"
                aria-label="Portfolio"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              <a
                href="https://www.linkedin.com/in/dibya-mishra-55b94654"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/65">
            {NAV.slice(1).map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="transition-colors hover:text-white">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/trust" className="transition-colors hover:text-white">
                Trust & Privacy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Newsletter</h4>
          <p className="mt-3 text-sm text-white/65">
            Monthly research notes on AI, Cloud, and Engineering Leadership.
          </p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Dibya Ranjan Mishra. All rights reserved.</p>
          <p>Built with research, rigor, and a bias for clarity.</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout() {
  return (
    <ThemeProvider>
      <div className="relative flex min-h-screen flex-col">
        <AuroraBackground />
        <Header />
        <main className="relative flex-1">
          <PageTransition />
        </main>
        <Footer />
        <FloatingChat />
      </div>
    </ThemeProvider>
  );
}
