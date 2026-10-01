import { useEffect, useRef } from "react";
import aiBgNeural from "@/assets/ai-bg-neural.jpg";
import aiBgCircuit from "@/assets/ai-bg-circuit.jpg";
import aiBgParticles from "@/assets/ai-bg-particles.jpg";

const LAYERS = [
  { src: aiBgNeural, speed: 0.12, top: "-5%", opacity: 0.55 },
  { src: aiBgCircuit, speed: 0.22, top: "35%", opacity: 0.45 },
  { src: aiBgParticles, speed: 0.34, top: "70%", opacity: 0.5 },
];

/**
 * Fixed, decorative AI-themed background layers that drift at different
 * speeds as the visitor scrolls (parallax). Sits behind all page content
 * and respects prefers-reduced-motion.
 */
export function AiScrollBackground() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      LAYERS.forEach((layer, i) => {
        const el = refs.current[i];
        if (el) el.style.transform = `translate3d(0, ${y * layer.speed}px, 0)`;
      });
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {LAYERS.map((layer, i) => (
        <div
          key={layer.src}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="absolute left-1/2 w-[130vw] max-w-none -translate-x-1/2 will-change-transform"
          style={{ top: layer.top, opacity: layer.opacity }}
        >
          <img
            src={layer.src}
            alt=""
            loading="lazy"
            width={1920}
            height={1024}
            className="h-auto w-full select-none"
            draggable={false}
          />
        </div>
      ))}
      {/* readability veil so text stays legible over the imagery */}
      <div className="absolute inset-0 bg-background/45" />
    </div>
  );
}
