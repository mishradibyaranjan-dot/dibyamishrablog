import { animate, useInView, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  /** Numeric value to animate to. */
  to: number;
  /** Optional prefix (e.g. "$"). */
  prefix?: string;
  /** Optional suffix (e.g. "+", "%", "x"). */
  suffix?: string;
  /** Duration in seconds. */
  duration?: number;
  /** Locale-formatted (e.g. 28,000). */
  format?: boolean;
  className?: string;
}

export function AnimatedCounter({
  to,
  prefix = "",
  suffix = "",
  duration = 1.8,
  format = false,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => {
    const n = Math.round(v);
    return `${prefix}${format ? n.toLocaleString() : n}${suffix}`;
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, to, duration, mv]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
