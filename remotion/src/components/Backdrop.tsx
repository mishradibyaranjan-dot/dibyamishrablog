import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS } from "../theme";

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [0, -60]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(140deg, ${COLORS.white} 0%, ${COLORS.bg} 45%, ${COLORS.bgDeep} 100%)`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.55 }}
      >
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke={COLORS.line} strokeWidth="1" />
          </pattern>
        </defs>
        <rect
          x={drift}
          y={drift / 2}
          width="140%"
          height="140%"
          fill="url(#grid)"
        />
      </svg>

      {[
        { x: "8%", y: "12%", s: 420, c: COLORS.brand, o: 0.1, p: 0 },
        { x: "72%", y: "58%", s: 500, c: COLORS.accent, o: 0.1, p: 40 },
      ].map((b, i) => {
        const f = frame + b.p;
        const dy = Math.sin(f / 55) * 26;
        const dx = Math.cos(f / 70) * 22;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x,
              top: b.y,
              width: b.s,
              height: b.s,
              transform: `translate(${dx}px, ${dy}px)`,
              borderRadius: "50%",
              background: b.c,
              opacity: b.o,
              filter: "blur(70px)",
            }}
          />
        );
      })}

      {/* thin accent rule at bottom, progress-like */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 5,
          width: `${interpolate(frame, [0, durationInFrames], [0, 100], {
            extrapolateRight: "clamp",
          })}%`,
          background: `linear-gradient(90deg, ${COLORS.brand}, ${COLORS.accent})`,
        }}
      />
    </AbsoluteFill>
  );
};
