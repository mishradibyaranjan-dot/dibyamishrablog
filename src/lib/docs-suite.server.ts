// Server-only registry for the engineering documentation suite.
// NEVER import this from a component or a client-reachable module: the document
// text must never be shipped in a browser bundle.
import brd from "@/content/docs-suite/brd.md?raw";
import srs from "@/content/docs-suite/srs.md?raw";
import hld from "@/content/docs-suite/hld.md?raw";
import lld from "@/content/docs-suite/lld.md?raw";
import diagrams from "@/content/docs-suite/diagrams.md?raw";
import testPlan from "@/content/docs-suite/test-plan.md?raw";
import userGuide from "@/content/docs-suite/user-guide.md?raw";
import releaseNotes from "@/content/docs-suite/release-notes.md?raw";
import jobsSuite from "../../docs/jobs-engineering-suite.md?raw";
import jobsOperations from "../../docs/jobs-operations.md?raw";
import interviewGuide from "../../docs/interview-preparation.md?raw";
import careerGuide from "../../docs/career-assistant.md?raw";
import masterAudit from "../../docs/master-audit.md?raw";
import futureReport from "../../docs/future-experience-report.md?raw";

import type { DocCategory, DocMeta } from "@/lib/docs-suite.types";

export type { DocCategory, DocMeta };

type DocEntry = Omit<DocMeta, "bytes"> & { content: string };

const ENTRIES: readonly DocEntry[] = [
  { id: "future-experience", title: "Future Experience — Delivery & Acceptance", category: "Quality", summary: "Optional theme rollout, preservation checks, measured development performance, accessibility results and release limitations.", filename: "Future-Experience-Report.md", content: futureReport },
  { id: "master-audit", title: "Master Audit — Evidence & Release Gates", category: "Quality", summary: "Verified fixes, live jobs policy and schedules, career workflow checks, source limitations and external acceptance gates.", filename: "Master-Audit.md", content: masterAudit },
  { id: "career-assistant", title: "Career Assistant — Engineering & Acceptance", category: "Quality", summary: "Private resume review, evidence-based decisions, immutable approvals, editable exports and release limitations.", filename: "Career-Assistant.md", content: careerGuide },
  { id: "interview-preparation", title: "AI Interview Preparation — Engineering & Testing", category: "Quality", summary: "Private interview flow, architecture, safeguards, real test results and remaining release checks.", filename: "AI-Interview-Preparation.md", content: interviewGuide },
  { id: "jobs-engineering", title: "Verified Jobs — Engineering & Validation Suite", category: "Design", summary: "Jobs BRD/SRS, architecture, database, agents, source matrix, APIs, test evidence and release blockers.", filename: "Verified-Jobs-Engineering.md", content: jobsSuite },
  { id: "jobs-operations", title: "Verified Jobs — Operations & Release Guide", category: "Operations", summary: "Verification evidence, refresh schedules, privacy, administrator access and integration limitations.", filename: "Verified-Jobs-Operations.md", content: jobsOperations },
  {
    id: "brd",
    title: "Business Requirements Document",
    category: "Requirements",
    summary:
      "Business rationale, stakeholders, objectives, scope, business requirements, risks and acceptance criteria.",
    filename: "BRD-dibyamishra-platform.md",
    content: brd,
  },
  {
    id: "srs",
    title: "Software Requirements Specification",
    category: "Requirements",
    summary:
      "Actors, functional requirements by domain, non-functional requirements, external interfaces and BRD traceability.",
    filename: "SRS-dibyamishra-platform.md",
    content: srs,
  },
  {
    id: "hld",
    title: "High-Level Design",
    category: "Design",
    summary:
      "Layered architecture, component decomposition, request flow, authorization model, data architecture and deployment view.",
    filename: "HLD-dibyamishra-platform.md",
    content: hld,
  },
  {
    id: "lld",
    title: "Low-Level Design",
    category: "Design",
    summary:
      "Module-level file map, registry shapes, authorization sequences, client contracts, UI states and error taxonomy.",
    filename: "LLD-dibyamishra-platform.md",
    content: lld,
  },
  {
    id: "diagrams",
    title: "Architecture & Flow Diagrams",
    category: "Design",
    summary:
      "Mermaid sources: system context, containers, documentation access flow, contact flow, IP blocking states, data model, pipeline.",
    filename: "Diagrams-dibyamishra-platform.md",
    content: diagrams,
  },
  {
    id: "test-plan",
    title: "Test Strategy, Plan & Cases",
    category: "Quality",
    summary:
      "Test levels, entry/exit criteria and ~50 numbered cases across authorization, SEO, forms, security, privacy, media and accessibility.",
    filename: "Test-Plan-dibyamishra-platform.md",
    content: testPlan,
  },
  {
    id: "user-guide",
    title: "User & Administrator Guide",
    category: "Operations",
    summary:
      "Visitor walkthrough, administrator instructions for every admin surface, and a troubleshooting matrix.",
    filename: "User-Guide-dibyamishra-platform.md",
    content: userGuide,
  },
  {
    id: "release-notes",
    title: "Release Notes & Runbook",
    category: "Operations",
    summary:
      "Current release contents, release history, deployment and rollback procedure, operational runbook and known limitations.",
    filename: "Release-Notes-dibyamishra-platform.md",
    content: releaseNotes,
  },
] as const;

const BY_ID: Record<string, DocEntry> = Object.freeze(
  Object.fromEntries(ENTRIES.map((e) => [e.id, e])),
);

export function listDocMeta(): DocMeta[] {
  return ENTRIES.map(({ content, ...meta }) => ({
    ...meta,
    bytes: content.length,
  }));
}

export function getDocEntry(id: string): DocEntry | null {
  return BY_ID[id] ?? null;
}
