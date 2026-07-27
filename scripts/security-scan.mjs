#!/usr/bin/env node
/**
 * CI security gate.
 *
 * Runs `bun audit --json` against the committed lockfile and fails the build
 * when any HIGH or CRITICAL advisory is present. Intended to be run in CI so
 * that merges are blocked when new high/critical findings appear.
 */
import { spawnSync } from "node:child_process";

const BLOCKING = new Set(["high", "critical"]);

function runAudit() {
  const res = spawnSync("bun", ["audit", "--json"], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });

  if (res.error) {
    console.error("Failed to run `bun audit`:", res.error.message);
    process.exit(2);
  }

  const raw = (res.stdout || "").trim();
  if (!raw) {
    // No output means no advisories reported.
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    console.error("Could not parse `bun audit --json` output:\n", raw.slice(0, 2000));
    process.exit(2);
  }
}

const report = runAudit();
// bun audit --json mirrors the npm audit v2 shape: { advisories: { id: {...} } }
const advisories = Object.values(report.advisories ?? report ?? {}).filter(
  (a) => a && typeof a === "object" && typeof a.severity === "string",
);

const blocking = advisories.filter((a) => BLOCKING.has(String(a.severity).toLowerCase()));

if (blocking.length === 0) {
  console.log("✅ Security scan passed — no high or critical advisories.");
  process.exit(0);
}

console.error(`❌ Security scan failed — ${blocking.length} high/critical advisory(ies):\n`);
for (const a of blocking) {
  const name = a.module_name ?? a.name ?? "unknown package";
  const versions = a.vulnerable_versions ?? a.range ?? "";
  const fix = a.patched_versions ?? a.fixAvailable ?? "see advisory";
  console.error(`  • [${String(a.severity).toUpperCase()}] ${name} ${versions}`);
  if (a.title) console.error(`    ${a.title}`);
  if (a.url) console.error(`    ${a.url}`);
  console.error(`    fix: ${fix}\n`);
}
console.error("Update the affected packages (or pin safe versions via package.json overrides) and re-run.");
process.exit(1);
