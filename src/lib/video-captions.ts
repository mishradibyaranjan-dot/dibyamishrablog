/**
 * Caption cue data for the self-hosted narrated videos.
 *
 * The narration is generated from the same scripted lines used to render each
 * Remotion chapter, so cues are derived by splitting a chapter's spoken lines
 * evenly across that chapter's on-screen duration.
 */
export type Cue = {
  start: number;
  end: number;
  text: string;
};

type CueGroup = {
  /** chapter start time in seconds */
  start: number;
  /** chapter duration in seconds */
  duration: number;
  lines: string[];
};

export function buildCues(groups: CueGroup[]): Cue[] {
  const cues: Cue[] = [];
  for (const g of groups) {
    const slice = g.duration / g.lines.length;
    g.lines.forEach((text, i) => {
      cues.push({
        start: +(g.start + i * slice).toFixed(3),
        end: +(g.start + (i + 1) * slice).toFixed(3),
        text,
      });
    });
  }
  return cues;
}

export function cueAt(cues: Cue[], time: number): Cue | null {
  return cues.find((c) => time >= c.start && time < c.end) ?? null;
}

/** 6 chapters × 5s — matches CHAPTER_FRAMES in the Remotion tour composition. */
export const TOUR_CUES = buildCues([
  {
    start: 0,
    duration: 5,
    lines: [
      "Applied AI, cloud-native platforms and engineering leadership.",
      "Start on the home page, then follow the thread that fits your goal.",
    ],
  },
  {
    start: 5,
    duration: 5,
    lines: [
      "Agentic AI, RAG, cloud foundations and multi-agent systems.",
      "Architecture diagrams, comparison charts and embedded PDFs.",
      "Progress checkmarks remember where you stopped.",
    ],
  },
  {
    start: 10,
    duration: 5,
    lines: [
      "Long-form writing on enterprise AI and delivery predictability.",
      "Searchable, categorised, and cross-linked to the modules.",
    ],
  },
  {
    start: 15,
    duration: 5,
    lines: [
      "The constraints, the architecture, and the measured outcome.",
      "Written so an engineer can evaluate the decisions.",
    ],
  },
  {
    start: 20,
    duration: 5,
    lines: [
      "White papers and reference PDFs with an inline viewer.",
      "Zoom, thumbnails, or download for later.",
    ],
  },
  {
    start: 25,
    duration: 5,
    lines: [
      "It knows this site's content end to end.",
      "Summarise a module, compare approaches, find the right page.",
    ],
  },
]);

/** 6 chapters × 4s — matches LEARN_FRAMES in the Remotion lesson compositions. */
export const MULTI_AGENT_CUES = buildCues([
  {
    start: 0,
    duration: 4,
    lines: [
      "An agent perceives, decides and acts on its own goals.",
      "A multi-agent system coordinates several of them over shared state.",
    ],
  },
  {
    start: 4,
    duration: 4,
    lines: [
      "Centralised: one planner assigns work — simple, single point of failure.",
      "Decentralised: peers negotiate — resilient, harder to reason about.",
    ],
  },
  {
    start: 8,
    duration: 4,
    lines: [
      "Call for proposals, bid, award, then execute and report.",
      "Bids price capability, load and distance, not just availability.",
    ],
  },
  {
    start: 12,
    duration: 4,
    lines: [
      "Throughput climbs as agents specialise instead of duplicating work.",
      "Measure task completion, retries, and cost per resolved task.",
    ],
  },
  {
    start: 16,
    duration: 4,
    lines: [
      "The full multi-agent reference design sits in the repository.",
      "Diagrams, failure modes, and a warehouse case study.",
    ],
  },
  {
    start: 20,
    duration: 4,
    lines: [
      "Use the Learning Assistant to test your understanding.",
      "Then map the pattern onto a system you already run.",
    ],
  },
]);

export const VECTOR_SEARCH_CUES = buildCues([
  {
    start: 0,
    duration: 4,
    lines: [
      "An embedding model turns text into a fixed-length vector.",
      "Close vectors mean related meaning — even with no shared words.",
    ],
  },
  {
    start: 4,
    duration: 4,
    lines: [
      "Normalise the vectors and inner product ranks like cosine.",
      "Query and index must share one model, revision and dimension.",
    ],
  },
  {
    start: 8,
    duration: 4,
    lines: [
      "Flat is exact but scans everything — keep it as ground truth.",
      "IVF probes clusters, HNSW walks a graph, PQ compresses codes.",
    ],
  },
  {
    start: 12,
    duration: 4,
    lines: [
      "Every approximation buys speed by giving up some recall.",
      "Measure recall at k against the exact index, plus p95 latency.",
    ],
  },
  {
    start: 16,
    duration: 4,
    lines: [
      "Fuse dense retrieval with BM25 for codes, names and identifiers.",
      "Filter with authorisation before ranking, then rerank the pool.",
    ],
  },
  {
    start: 20,
    duration: 4,
    lines: [
      "Embed twelve documents, search exactly, then swap in HNSW.",
      "The full report sits in the repository — ask the assistant too.",
    ],
  },
]);
