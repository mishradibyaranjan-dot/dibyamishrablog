import { cn } from "@/lib/utils";

/**
 * Site-wide cinematic background: animated aurora blobs + subtle grid overlay.
 * Position: fixed inset-0 behind all content (z-[-1]).
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background",
        className,
      )}
    >
      {/* Aurora orbs */}
      <div className="absolute -left-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-aurora animate-aurora" />
      <div
        className="absolute -right-32 top-1/3 h-[40rem] w-[40rem] rounded-full bg-aurora animate-aurora"
        style={{ animationDelay: "-7s", animationDuration: "26s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[32rem] w-[32rem] rounded-full bg-aurora animate-aurora"
        style={{ animationDelay: "-14s", animationDuration: "30s" }}
      />
      {/* Grid */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, transparent 30%, oklch(0.09 0.02 265 / 0.6) 80%)",
        }}
      />
    </div>
  );
}
