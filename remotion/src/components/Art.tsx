import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS } from "../theme";

export type ArtKind = "graph" | "stack" | "bars" | "docs" | "chat" | "rings";

const S = 460;

const useIn = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 200 } });
};

export const Art: React.FC<{ kind: ArtKind }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const enter = useIn(6);

  const body = () => {
    switch (kind) {
      case "graph": {
        const nodes = [
          [230, 90],
          [110, 210],
          [350, 200],
          [170, 350],
          [320, 340],
        ] as const;
        const edges = [
          [0, 1],
          [0, 2],
          [1, 3],
          [2, 4],
          [3, 4],
          [1, 2],
        ] as const;
        return (
          <>
            {edges.map(([a, b], i) => {
              const p = interpolate(frame - 10 - i * 5, [0, 24], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const [x1, y1] = nodes[a]!;
              const [x2, y2] = nodes[b]!;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x1 + (x2 - x1) * p}
                  y2={y1 + (y2 - y1) * p}
                  stroke={COLORS.brand}
                  strokeOpacity={0.45}
                  strokeWidth={2}
                />
              );
            })}
            {nodes.map(([x, y], i) => {
              const s = interpolate(
                Math.sin((frame + i * 18) / 22),
                [-1, 1],
                [0.85, 1.2],
              );
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={(i === 0 ? 20 : 13) * s}
                  fill={i === 0 ? COLORS.brand : COLORS.accent}
                  opacity={0.9}
                />
              );
            })}
          </>
        );
      }
      case "stack": {
        return (
          <>
            {[0, 1, 2, 3].map((i) => {
              const p = interpolate(frame - 8 - i * 8, [0, 26], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const y = 60 + i * 92;
              return (
                <g key={i} opacity={p}>
                  <rect
                    x={40 + (1 - p) * 40}
                    y={y}
                    rx={16}
                    width={380}
                    height={68}
                    fill={COLORS.white}
                    stroke={COLORS.line}
                  />
                  <rect x={62} y={y + 22} rx={5} width={i === 0 ? 210 : 150} height={10} fill={COLORS.brand} opacity={0.75} />
                  <rect x={62} y={y + 40} rx={5} width={260} height={8} fill={COLORS.line} />
                  <circle cx={392} cy={y + 34} r={9} fill={COLORS.accent} opacity={0.8} />
                </g>
              );
            })}
          </>
        );
      }
      case "bars": {
        const vals = [0.42, 0.68, 0.55, 0.86, 0.74, 0.95];
        return (
          <>
            <line x1={54} y1={400} x2={420} y2={400} stroke={COLORS.line} strokeWidth={2} />
            {vals.map((v, i) => {
              const p = interpolate(frame - 10 - i * 7, [0, 28], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const h = 300 * v * p;
              return (
                <rect
                  key={i}
                  x={66 + i * 58}
                  y={400 - h}
                  width={38}
                  rx={8}
                  height={h}
                  fill={i === vals.length - 1 ? COLORS.brand : COLORS.accent}
                  opacity={i === vals.length - 1 ? 0.95 : 0.55}
                />
              );
            })}
          </>
        );
      }
      case "docs": {
        return (
          <>
            {[2, 1, 0].map((i) => {
              const p = interpolate(frame - 8 - (2 - i) * 9, [0, 28], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const lift = Math.sin((frame + i * 30) / 40) * 5;
              return (
                <g key={i} opacity={p} transform={`translate(${70 + i * 34}, ${70 + i * 26 + lift})`}>
                  <rect rx={14} width={250} height={310} fill={COLORS.white} stroke={COLORS.line} />
                  {[0, 1, 2, 3, 4, 5].map((l) => (
                    <rect
                      key={l}
                      x={28}
                      y={44 + l * 34}
                      rx={5}
                      width={l % 3 === 2 ? 120 : 190}
                      height={9}
                      fill={l === 0 ? COLORS.brand : COLORS.line}
                      opacity={l === 0 ? 0.8 : 1}
                    />
                  ))}
                  <rect x={28} y={252} rx={8} width={96} height={26} fill={COLORS.accent} opacity={0.75} />
                </g>
              );
            })}
          </>
        );
      }
      case "chat": {
        const msgs = [
          { w: 250, x: 50, me: false },
          { w: 200, x: 200, me: true },
          { w: 290, x: 50, me: false },
          { w: 160, x: 240, me: true },
        ];
        return (
          <>
            {msgs.map((m, i) => {
              const p = interpolate(frame - 10 - i * 14, [0, 22], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <g key={i} opacity={p}>
                  <rect
                    x={m.x}
                    y={70 + i * 86 + (1 - p) * 14}
                    rx={18}
                    width={m.w}
                    height={62}
                    fill={m.me ? COLORS.brand : COLORS.white}
                    stroke={m.me ? COLORS.brand : COLORS.line}
                  />
                  {[0, 1].map((l) => (
                    <rect
                      key={l}
                      x={m.x + 20}
                      y={70 + i * 86 + 20 + l * 16 + (1 - p) * 14}
                      rx={4}
                      width={(m.w - 60) * (l ? 0.6 : 1)}
                      height={8}
                      fill={m.me ? "#dbeafe" : COLORS.line}
                    />
                  ))}
                </g>
              );
            })}
          </>
        );
      }
      case "rings":
      default: {
        return (
          <>
            {[190, 145, 100, 55].map((r, i) => {
              const p = interpolate(frame - 6 - i * 6, [0, 30], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const rot = (frame * (i % 2 ? -0.7 : 0.9)) % 360;
              return (
                <circle
                  key={r}
                  cx={230}
                  cy={230}
                  r={r * p}
                  fill="none"
                  stroke={i % 2 ? COLORS.accent : COLORS.brand}
                  strokeOpacity={0.5}
                  strokeWidth={2}
                  strokeDasharray={`${20 + i * 12} ${14 + i * 6}`}
                  transform={`rotate(${rot} 230 230)`}
                />
              );
            })}
            <circle cx={230} cy={230} r={26} fill={COLORS.brand} />
          </>
        );
      }
    }
  };

  return (
    <svg
      width={S}
      height={S}
      viewBox="0 0 460 460"
      style={{
        transform: `translateY(${interpolate(enter, [0, 1], [26, 0])}px)`,
        opacity: enter,
      }}
    >
      {body()}
    </svg>
  );
};
