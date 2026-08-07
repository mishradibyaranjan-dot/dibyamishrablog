import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";

/**
 * Persistent conversion CTA. Appears once the visitor has scrolled ~30% of the
 * page so it never competes with the hero.
 */
export function FloatingConnectCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setShow(max > 0 && window.scrollY / max > 0.3);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 left-4 z-40 sm:left-auto sm:right-24"
        >
          <Link
            to="/contact"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5"
          >
            <MessageSquare className="h-4 w-4" />
            Let&apos;s Connect
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
