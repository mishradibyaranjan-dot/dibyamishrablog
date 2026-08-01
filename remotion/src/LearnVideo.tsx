import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { Backdrop } from "./components/Backdrop";
import { Chapter, ChapterData } from "./components/Chapter";
import { LEARN_FRAMES } from "./theme";

export const LEARN_CHAPTERS: ChapterData[] = [
  {
    label: "Module · Multi-agent systems",
    title: "Many agents, one objective",
    lines: [
      "An agent perceives, decides and acts on its own goals.",
      "A multi-agent system coordinates several of them over shared state.",
    ],
    path: "Lesson 1 · Foundations",
    art: "graph",
  },
  {
    label: "Topology",
    title: "Orchestrator or peer network",
    lines: [
      "Centralised: one planner assigns work — simple, single point of failure.",
      "Decentralised: peers negotiate — resilient, harder to reason about.",
    ],
    path: "Lesson 2 · Architecture",
    art: "rings",
  },
  {
    label: "Protocol",
    title: "Contract Net in four moves",
    lines: [
      "Call for proposals → bid → award → execute and report.",
      "Bids price capability, load and distance, not just availability.",
    ],
    path: "Lesson 3 · Coordination",
    art: "stack",
  },
  {
    label: "Evidence",
    title: "Why coordination pays",
    lines: [
      "Throughput climbs as agents specialise instead of duplicating work.",
      "Measure task completion, retries, and cost per resolved task.",
    ],
    path: "Lesson 4 · Metrics",
    art: "bars",
  },
  {
    label: "Reference",
    title: "Read the white paper",
    lines: [
      "The full multi-agent reference design sits in the repository.",
      "Diagrams, failure modes, and a warehouse case study.",
    ],
    path: "/repository",
    art: "docs",
  },
  {
    label: "Practice",
    title: "Ask, then apply",
    lines: [
      "Use the Learning Assistant to test your understanding.",
      "Then map the pattern onto a system you already run.",
    ],
    path: "/learn",
    art: "chat",
  },
];

export const LEARN_TOTAL = LEARN_CHAPTERS.length * LEARN_FRAMES;

export const LearnVideo: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Series>
      {LEARN_CHAPTERS.map((c) => (
        <Series.Sequence key={c.label} durationInFrames={LEARN_FRAMES}>
          <Chapter {...c} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
