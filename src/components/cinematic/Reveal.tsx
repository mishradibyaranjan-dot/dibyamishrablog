import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  once?: boolean;
  amount?: number;
}

const offsetFor = (d: Direction) => {
  switch (d) {
    case "up": return { y: 40, x: 0 };
    case "down": return { y: -40, x: 0 };
    case "left": return { y: 0, x: 40 };
    case "right": return { y: 0, x: -40 };
    default: return { x: 0, y: 0 };
  }
};

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.7,
  direction = "up",
  once = true,
  amount = 0.2,
}: RevealProps) {
  const reduce = useReducedMotion();
  const off = offsetFor(direction);

  const variants: Variants = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, ...off, filter: "blur(8px)" },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
