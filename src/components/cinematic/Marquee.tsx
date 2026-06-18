import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  pauseOnHover?: boolean;
}

/** Infinite horizontal marquee. Duplicates children twice for seamless loop. */
export function Marquee({ children, className, pauseOnHover = true }: MarqueeProps) {
  return (
    <div className={cn("group relative w-full overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max animate-marquee gap-8",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        <div className="flex shrink-0 gap-8">{children}</div>
        <div className="flex shrink-0 gap-8" aria-hidden>{children}</div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
