import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Glass design-system primitives for the "Light Blue Glassmorphic Future"
 * theme. All styling comes from semantic theme tokens (see docs/theme-tokens.md
 * and the `glass-panel` / `glass-soft` / `glass-hover` utilities), so these
 * components stay correct on every other theme too.
 */

export function GlassCard({
  className,
  children,
  interactive = false,
  as: Tag = "div",
}: {
  className?: string;
  children: ReactNode;
  interactive?: boolean;
  as?: "div" | "article" | "section" | "li";
}) {
  return (
    <Tag className={cn("glass-panel p-6", interactive && "glass-hover", className)}>{children}</Tag>
  );
}

export function GlassFeatureCard({
  icon,
  title,
  description,
  footer,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <GlassCard interactive className={cn("flex flex-col gap-3", className)}>
      {icon ? (
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-chip text-primary ring-1 ring-chip-border">
          {icon}
        </span>
      ) : null}
      <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      {footer ? <div className="mt-auto pt-2 text-sm font-medium text-primary">{footer}</div> : null}
    </GlassCard>
  );
}

export function GlassMetricCard({
  value,
  label,
  hint,
  className,
}: {
  value: ReactNode;
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <GlassCard className={cn("text-center", className)}>
      <div className="text-3xl font-bold tracking-tight text-gradient sm:text-4xl">{value}</div>
      <div className="mt-1 text-sm font-medium text-card-foreground">{label}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </GlassCard>
  );
}

export function GlassMetricStrip({
  items,
  className,
}: {
  items: { value: ReactNode; label: string; hint?: string }[];
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 lg:grid-cols-4", className)}>
      {items.map((it) => (
        <GlassMetricCard key={it.label} {...it} />
      ))}
    </div>
  );
}

export function GlassDashboardPanel({
  title,
  actions,
  children,
  className,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass-panel p-5 sm:p-6", className)}>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <h2 className="truncate text-base font-semibold text-card-foreground sm:text-lg">{title}</h2>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function GlassCTA({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-panel relative overflow-hidden p-8 text-center sm:p-12",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-hero opacity-70" />
      <h2 className="text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl">{title}</h2>
      {description ? (
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </div>
  );
}

/** Soft translucent wave divider used between sections. */
export function GlassWaveDivider({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div aria-hidden className={cn("pointer-events-none w-full overflow-hidden", className)}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={cn("h-16 w-full sm:h-24", flip && "rotate-180")}
      >
        <defs>
          <linearGradient id="glass-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.06" />
            <stop offset="50%" stopColor="var(--color-brand-2)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <path d="M0,64 C240,110 480,10 720,48 C960,86 1200,110 1440,60 L1440,120 L0,120 Z" fill="url(#glass-wave)" />
        <path
          d="M0,80 C300,30 620,120 940,70 C1140,40 1300,60 1440,90"
          fill="none"
          stroke="url(#glass-wave)"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
