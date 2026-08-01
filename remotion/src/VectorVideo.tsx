import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { Backdrop } from "./components/Backdrop";
import { Chapter, ChapterData } from "./components/Chapter";
import { LEARN_FRAMES } from "./theme";

export const VECTOR_CHAPTERS: ChapterData[] = [
  {
    label: "Module · Vector search",
    title: "Meaning, not matching",
    lines: [
      "An embedding model turns text into a fixed-length vector.",
      "Close vectors mean related meaning — even with no shared words.",
    ],
    path: "Lesson 1 · Foundations",
    art: "graph",
  },
  {
    label: "Similarity",
    title: "Cosine, dot product, L2",
    lines: [
      "Normalise the vectors and inner product ranks like cosine.",
      "Query and index must share one model, revision and dimension.",
    ],
    path: "Lesson 2 · Metrics",
    art: "rings",
  },
  {
    label: "Indexes",
    title: "Flat, IVF, HNSW, PQ",
    lines: [
      "Flat is exact but scans everything — keep it as ground truth.",
      "IVF probes clusters, HNSW walks a graph, PQ compresses codes.",
    ],
    path: "Lesson 3 · ANN",
    art: "stack",
  },
  {
    label: "Evidence",
    title: "Recall versus latency",
    lines: [
      "Every approximation buys speed by giving up some recall.",
      "Measure recall@k against the exact index, plus p95 latency.",
    ],
    path: "Lesson 4 · Evaluation",
    art: "bars",
  },
  {
    label: "Production",
    title: "Hybrid, filters, reranking",
    lines: [
      "Fuse dense retrieval with BM25 for codes, names and identifiers.",
      "Filter with authorisation before ranking, then rerank the pool.",
    ],
    path: "Lesson 5 · Pipeline",
    art: "docs",
  },
  {
    label: "Practice",
    title: "Build the smallest version",
    lines: [
      "Embed twelve documents, search exactly, then swap in HNSW.",
      "The full report sits in the repository — ask the assistant too.",
    ],
    path: "/repository",
    art: "chat",
  },
];

export const VECTOR_TOTAL = VECTOR_CHAPTERS.length * LEARN_FRAMES;

export const VectorVideo: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Series>
      {VECTOR_CHAPTERS.map((c) => (
        <Series.Sequence key={c.label} durationInFrames={LEARN_FRAMES}>
          <Chapter {...c} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
