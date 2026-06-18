import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalRailProps {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

/**
 * Netflix-style horizontal scrollable rail with arrow buttons + scroll-snap.
 * Children should be `flex` items with fixed/min widths.
 */
export function HorizontalRail({ children, className, ariaLabel }: HorizontalRailProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateBounds = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateBounds();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(updateBounds);
    ro.observe(el);
    el.addEventListener("scroll", updateBounds, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", updateBounds);
    };
  }, [updateBounds]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className={cn("group/rail relative", className)} aria-label={ariaLabel} role="region">
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        className={cn(
          "absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full glass-strong text-white shadow-neon transition-all md:flex",
          canPrev ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        className={cn(
          "absolute right-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full glass-strong text-white shadow-neon transition-all md:flex",
          canNext ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4"
        style={{ scrollPaddingInline: "1rem" }}
      >
        {children}
      </div>

      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
