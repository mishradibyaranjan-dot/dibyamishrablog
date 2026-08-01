import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Outfit";
import { loadFont as loadBody } from "@remotion/google-fonts/Manrope";
import { COLORS } from "../theme";
import { Art, ArtKind } from "./Art";

const display = loadDisplay("normal", { weights: ["600", "700"], subsets: ["latin"] });
const body = loadBody("normal", { weights: ["400", "600"], subsets: ["latin"] });

export type ChapterData = {
  label: string;
  title: string;
  lines: string[];
  path: string;
  art: ArtKind;
};

export const Chapter: React.FC<ChapterData> = ({ label, title, lines, path, art }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleIn = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 90 } });
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const float = Math.sin(frame / 46) * 4;

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          gap: 48,
          padding: "0 92px",
        }}
      >
        <div style={{ flex: 1.25, transform: `translateY(${float}px)` }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 999,
              border: `1px solid ${COLORS.line}`,
              background: COLORS.white,
              color: COLORS.brand,
              fontFamily: body.fontFamily,
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame, [0, 14], [12, 0], {
                extrapolateRight: "clamp",
              })}px)`,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: COLORS.accent,
                opacity: interpolate(Math.sin(frame / 9), [-1, 1], [0.35, 1]),
              }}
            />
            {label}
          </div>

          <h1
            style={{
              fontFamily: display.fontFamily,
              fontWeight: 700,
              fontSize: 62,
              lineHeight: 1.05,
              letterSpacing: -1.6,
              color: COLORS.ink,
              margin: "22px 0 0",
              opacity: titleIn,
              transform: `translateY(${interpolate(titleIn, [0, 1], [30, 0])}px)`,
            }}
          >
            {title}
          </h1>

          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
            {lines.map((l, i) => {
              const p = spring({
                frame: frame - 22 - i * 9,
                fps,
                config: { damping: 200 },
              });
              return (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    opacity: p,
                    transform: `translateX(${interpolate(p, [0, 1], [-22, 0])}px)`,
                  }}
                >
                  <span
                    style={{
                      marginTop: 11,
                      width: 22,
                      height: 3,
                      borderRadius: 2,
                      background: COLORS.brand,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: body.fontFamily,
                      fontSize: 23,
                      lineHeight: 1.45,
                      color: COLORS.inkSoft,
                      maxWidth: 620,
                    }}
                  >
                    {l}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 34,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              borderRadius: 12,
              background: COLORS.ink,
              color: COLORS.white,
              fontFamily: body.fontFamily,
              fontSize: 18,
              fontWeight: 600,
              opacity: spring({ frame: frame - 52, fps, config: { damping: 200 } }),
            }}
          >
            <span style={{ color: COLORS.accent }}>›</span>
            {path}
          </div>
        </div>

        <div style={{ flex: 1, display: "grid", placeItems: "center" }}>
          <Art kind={art} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const fonts = { display, body };
