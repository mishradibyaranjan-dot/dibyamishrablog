import { AnimatedCounter } from "@/components/cinematic/AnimatedCounter";

export interface MetricStatProps {
  /** Numeric target for the animated counter. Omit for text-only metrics. */
  to?: number;
  /** Literal value shown when the metric isn't a single number (e.g. "$1M → $20M"). */
  value?: string;
  prefix?: string;
  suffix?: string;
  format?: boolean;
  label: string;
}

/**
 * Executive credibility metric. Animates into view when numeric, falls back to a
 * literal string for range-style figures.
 */
export function MetricStat({ to, value, prefix, suffix, format, label }: MetricStatProps) {
  return (
    <div className="flex flex-col gap-1 px-2 py-4 text-center sm:px-4">
      <div className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {typeof to === "number" ? (
          <AnimatedCounter to={to} prefix={prefix} suffix={suffix} format={format} />
        ) : (
          value
        )}
      </div>
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
