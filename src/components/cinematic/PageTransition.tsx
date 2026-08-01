import { Outlet, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";

/**
 * Cinematic, movie-style route transitions.
 * - Outgoing page fades + scales down with a subtle blur (film cut-out).
 * - Incoming page rises with a slight scale + blur clear (projector focus).
 * - A neon sweep bar wipes across the screen between routes.
 *
 * The very first paint is intentionally NOT animated: an initial opacity-0 +
 * blur + delay on the first render pushes Largest Contentful Paint several
 * seconds out and hides the hero heading from crawlers/audits.
 */
export function PageTransition() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const firstPathRef = useRef(pathname);
  const isFirstPaint = firstPathRef.current === pathname;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={
          isFirstPaint
            ? false
            : { opacity: 0, y: 24, scale: 0.985, filter: "blur(12px)" }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: isFirstPaint
            ? { duration: 0 }
            : {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.15,
              },
        }}
        exit={{
          opacity: 0,
          y: -16,
          scale: 0.99,
          filter: "blur(10px)",
          transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
        }}
        className={isFirstPaint ? undefined : "will-change-[transform,opacity,filter]"}
      >
        <Outlet />
      </motion.div>


      {/* Cinematic sweep overlay — fires on every route change */}
      <motion.div
        key={`sweep-${pathname}`}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0, transition: { duration: 0.1, delay: 0.85 } }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ x: "-110%" }}
          animate={{
            x: "110%",
            transition: { duration: 0.9, ease: [0.77, 0, 0.175, 1] },
          }}
          className="absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-transparent via-white/10 to-transparent backdrop-blur-md"
          style={{
            boxShadow:
              "0 0 80px 20px oklch(0.7 0.18 250 / 0.35), 0 0 160px 40px oklch(0.65 0.22 300 / 0.25)",
          }}
        />
        <motion.div
          initial={{ scaleX: 0, transformOrigin: "left" }}
          animate={{
            scaleX: [0, 1, 1, 0],
            transformOrigin: ["left", "left", "right", "right"],
            transition: { duration: 0.95, ease: [0.77, 0, 0.175, 1], times: [0, 0.45, 0.55, 1] },
          }}
          className="absolute left-0 right-0 top-1/2 h-px bg-brand-gradient shadow-neon"
        />
      </motion.div>
    </AnimatePresence>
  );
}
