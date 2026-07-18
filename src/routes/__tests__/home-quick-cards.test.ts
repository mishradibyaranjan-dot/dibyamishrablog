import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Guards that every QuickCards tile on the home page (src/routes/index.tsx)
 * links to a route that actually exists on disk under src/routes/.
 * A missing route file would 404 in production, so this test acts as
 * an automated smoke check for the tile navigation.
 */

const ROUTES_DIR = resolve(__dirname, "..");
const HOME = resolve(ROUTES_DIR, "index.tsx");

// Expected mapping — kept in sync with QuickCards() in src/routes/index.tsx.
const EXPECTED_LINKS: Record<string, string> = {
  "/learn": "learn.tsx",
  "/research": "research.tsx",
  "/projects": "projects.tsx",
  "/case-studies": "case-studies.tsx",
  "/newsletter": "newsletter.index.tsx",
};

function extractQuickCardHrefs(source: string): string[] {
  // Grab the QuickCards items array block.
  const match = source.match(/function QuickCards\([^]*?const items = \[([^]*?)\] as const;/);
  if (!match) throw new Error("Could not locate QuickCards items array in index.tsx");
  const block = match[1];
  const hrefs = Array.from(block.matchAll(/to:\s*"([^"]+)"/g)).map((m) => m[1]);
  return hrefs;
}

describe("Home QuickCards routing", () => {
  const source = readFileSync(HOME, "utf8");
  const hrefs = extractQuickCardHrefs(source);

  it("exposes exactly the expected set of quick-card links", () => {
    expect(new Set(hrefs)).toEqual(new Set(Object.keys(EXPECTED_LINKS)));
  });

  it.each(hrefs)("route file exists for %s", (href) => {
    const file = EXPECTED_LINKS[href];
    expect(file, `Unexpected QuickCard href: ${href}`).toBeDefined();
    expect(existsSync(resolve(ROUTES_DIR, file))).toBe(true);
  });

  it.each(hrefs)("route file for %s declares matching createFileRoute path", (href) => {
    const file = EXPECTED_LINKS[href];
    const routeSrc = readFileSync(resolve(ROUTES_DIR, file), "utf8");
    // Newsletter index route registers as "/newsletter/" in TanStack.
    const expected = href === "/newsletter" ? '"/newsletter/"' : `"${href}"`;
    expect(routeSrc.includes(`createFileRoute(${expected})`)).toBe(true);
  });

  it("every quick-card image tag has non-empty alt text", () => {
    const match = source.match(/function QuickCards\([^]*?const items = \[([^]*?)\] as const;/);
    const block = match![1];
    const alts = Array.from(block.matchAll(/alt:\s*"([^"]+)"/g)).map((m) => m[1]);
    expect(alts.length).toBe(hrefs.length);
    for (const alt of alts) {
      expect(alt.trim().length).toBeGreaterThan(5);
    }
  });
});
