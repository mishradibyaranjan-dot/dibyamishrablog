import React from "react";
import { AbsoluteFill, Series, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Backdrop } from "./components/Backdrop";
import { Chapter, ChapterData, fonts } from "./components/Chapter";
import { COLORS, CHAPTER_FRAMES } from "./theme";

export const TOUR_CHAPTERS: ChapterData[] = [
  {
    label: "01 · Start here",
    title: "A working portfolio, not a brochure",
    lines: [
      "Applied AI, cloud-native platforms and engineering leadership.",
      "Start on the home page, then follow the thread that fits your goal.",
    ],
    path: "dibyamishra.co.in",
    art: "rings",
  },
  {
    label: "02 · Learn",
    title: "Structured learning modules",
    lines: [
      "Agentic AI, RAG, cloud foundations and multi-agent systems.",
      "Architecture diagrams, comparison charts and embedded PDFs.",
      "Progress checkmarks remember where you stopped.",
    ],
    path: "/learn",
    art: "graph",
  },
  {
    label: "03 · Research",
    title: "Essays and white papers",
    lines: [
      "Long-form writing on enterprise AI and delivery predictability.",
      "Searchable, categorised, and cross-linked to the modules.",
    ],
    path: "/research",
    art: "stack",
  },
  {
    label: "04 · Work",
    title: "Projects and case studies",
    lines: [
      "The constraints, the architecture, and the measured outcome.",
      "Written so an engineer can evaluate the decisions.",
    ],
    path: "/case-studies",
    art: "bars",
  },
  {
    label: "05 · Repository",
    title: "Documents and downloads",
    lines: [
      "White papers and reference PDFs with an inline viewer.",
      "Zoom, thumbnails, or download for later.",
    ],
    path: "/repository",
    art: "docs",
  },
  {
    label: "06 · Assistant",
    title: "Ask the Learning Assistant",
    lines: [
      "It knows this site's content end to end.",
      "Summarise a module, compare approaches, find the right page.",
    ],
    path: "Floating chat · bottom right",
    art: "chat",
  },
];

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: fonts.body.fontFamily,
          fontSize: 16,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: COLORS.brand,
          opacity: s,
        }}
      >
        Guided tour · complete
      </div>
      <div
        style={{
          fontFamily: fonts.display.fontFamily,
          fontWeight: 700,
          fontSize: 66,
          letterSpacing: -2,
          color: COLORS.ink,
          marginTop: 16,
          transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px)`,
          opacity: s,
        }}
      >
        Dibya Ranjan Mishra
      </div>
      <div
        style={{
          fontFamily: fonts.body.fontFamily,
          fontSize: 24,
          color: COLORS.inkSoft,
          marginTop: 12,
          opacity: spring({ frame: frame - 14, fps, config: { damping: 200 } }),
        }}
      >
        Agentic AI · Cloud platforms · Engineering leadership
      </div>
      <div
        style={{
          marginTop: 30,
          height: 4,
          width: interpolate(spring({ frame: frame - 22, fps, config: { damping: 200 } }), [0, 1], [0, 260]),
          background: `linear-gradient(90deg, ${COLORS.brand}, ${COLORS.accent})`,
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

export const OUTRO_FRAMES = 90;
export const TOUR_TOTAL = TOUR_CHAPTERS.length * CHAPTER_FRAMES + OUTRO_FRAMES;

export const TourVideo: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Series>
      {TOUR_CHAPTERS.map((c) => (
        <Series.Sequence key={c.label} durationInFrames={CHAPTER_FRAMES}>
          <Chapter {...c} />
        </Series.Sequence>
      ))}
      <Series.Sequence durationInFrames={OUTRO_FRAMES}>
        <Outro />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
