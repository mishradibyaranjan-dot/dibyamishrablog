import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  User,
  Sparkles,
  Compass,
  BriefcaseBusiness,
  FolderKanban,
  GraduationCap,
  FlaskConical,
  Mail,
  BookOpen,
  Newspaper,
  PlayCircle,
  Library,
  ShieldCheck,
  ChevronRight,
  PanelLeftClose,
  BarChart3,
  Ban,
  Inbox,
  FileText,
  ShieldAlert,
  Bug,
  Radar,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

type RailItem = { to: string; label: string; icon: LucideIcon };

const PRIMARY: RailItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/about", label: "About", icon: User },
  { to: "/expertise", label: "Expertise", icon: Sparkles },
  { to: "/advisory", label: "Advisory", icon: Compass },
  { to: "/case-studies", label: "Case Studies", icon: BriefcaseBusiness },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/research", label: "Research", icon: FlaskConical },
  { to: "/contact", label: "Contact", icon: Mail },
];

const SECONDARY: RailItem[] = [
  { to: "/playbook", label: "AI Playbook", icon: BookOpen },
  { to: "/newsletter", label: "Newsletter", icon: Newspaper },
  { to: "/guide", label: "Guided Tour", icon: PlayCircle },
  { to: "/repository", label: "Repository", icon: Library },
  { to: "/trust", label: "Trust & Privacy", icon: ShieldCheck },
];

const ADMIN: RailItem[] = [
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/contact-enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/blocked-domains", label: "Blocked Domains", icon: Ban },
  { to: "/admin/spam-audit", label: "Spam Audit", icon: ShieldAlert },
  { to: "/admin/security-events", label: "Security Events", icon: Bug },
  { to: "/admin/visitor-audit", label: "Visitor Audit", icon: Radar },
  { to: "/admin/docs", label: "Engineering Docs", icon: FileText },
];

const STORAGE_KEY = "drm-side-rail";


export function SideRail() {
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(STORAGE_KEY) === "hidden");
    } catch {
      /* ignore */
    }
  }, []);

  const setHiddenPersisted = (next: boolean) => {
    setHidden(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "hidden" : "visible");
    } catch {
      /* ignore */
    }
  };

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const expanded = hovered;

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHiddenPersisted(false)}
        aria-label="Show side navigation"
        className="fixed left-0 top-1/2 z-40 hidden h-14 w-6 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-border bg-card/80 text-muted-foreground shadow-lg backdrop-blur-xl transition-colors hover:text-foreground lg:flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    );
  }

  const renderItem = (item: RailItem) => {
    const active = isActive(item.to);
    return (
      <Link
        key={item.to}
        to={item.to}
        title={item.label}
        className={cn(
          "group relative flex h-11 items-center gap-3 rounded-xl px-3 transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="whitespace-nowrap text-sm font-medium"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {active && (
          <span className="absolute -left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary" />
        )}
      </Link>
    );
  };

  return (
    <motion.aside
      aria-label="Site sections"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      initial={false}
      animate={{ width: expanded ? 224 : 68 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="fixed left-3 top-1/2 z-40 hidden max-h-[86vh] -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card/80 p-2 shadow-xl backdrop-blur-xl lg:flex"
    >
      <nav className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
        {PRIMARY.map(renderItem)}
        <div className="my-1 h-px shrink-0 bg-border" />
        {SECONDARY.map(renderItem)}
      </nav>
      <button
        type="button"
        onClick={() => setHiddenPersisted(true)}
        aria-label="Hide side navigation"
        className="mt-2 flex h-9 items-center gap-3 rounded-xl px-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <PanelLeftClose className="h-4 w-4 shrink-0" />
        {expanded && <span className="whitespace-nowrap text-xs">Collapse</span>}
      </button>
    </motion.aside>
  );
}
