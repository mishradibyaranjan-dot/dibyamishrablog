#!/usr/bin/env node
/**
 * Theme token lint.
 *
 * Fails the build when guarded UI files use hardcoded Tailwind palette colors
 * (text-white, bg-slate-50, border-blue-200, …) instead of the semantic theme
 * tokens documented in docs/theme-tokens.md. Hardcoded colors ignore the active
 * theme and are the usual cause of invisible text on light palettes.
 *
 * Usage: node scripts/theme-token-lint.mjs [--all]
 *   (default) lint GUARDED paths only — used by CI and pre-publish
 *   --all     report legacy colors across src/ (informational, never fails)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

/** Paths that must stay 100% token-based. Grow this list as files are migrated. */
export const GUARDED = [
  "src/routes/learn.tsx",
  "src/components/learn",
  "src/components/chat",
  "src/components/theme",
];

const PALETTE =
  "white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const PROPS =
  "text|bg|border|placeholder|caret|ring|divide|from|to|via|fill|stroke|decoration|accent|outline|shadow";

/** e.g. text-white/70, bg-slate-50, border-blue-200/40 */
const LEGACY_CLASS = new RegExp(
  `\\b(?:${PROPS})-(?:${PALETTE})(?:-(?:50|[1-9]00|950))?(?:\\/(?:\\[[^\\]]+\\]|\\d{1,3}))?\\b`,
  "g",
);
/** e.g. bg-[#0f172a], text-[rgb(0,0,0)] */
const RAW_COLOR = /(?:text|bg|border|fill|stroke|ring|from|to|via)-\[(?:#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/g;
/** inline style color literals */
const INLINE_STYLE_COLOR = /(?:color|background|backgroundColor|borderColor)\s*:\s*["'`]?#[0-9a-fA-F]{3,8}/g;

const ALLOW_COMMENT = "theme-lint-allow";

function walk(target: string): string[] {
  const abs = path.join(ROOT, target);
  const st = statSync(abs);
  if (st.isFile()) return [target];
  return readdirSync(abs).flatMap((entry) => walk(path.join(target, entry)));
}

function collect(paths: string[]): string[] {
  return paths
    .flatMap((p) => walk(p))
    .filter((p) => /\.(tsx|ts|jsx|js)$/.test(p) && !p.endsWith(".test.tsx") && !p.endsWith(".test.ts"));
}

export type Finding = { file: string; line: number; text: string; match: string };
export function findLegacyColors(paths: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of collect(paths)) {
    const lines = readFileSync(path.join(ROOT, file), "utf8").split("\n");
    lines.forEach((text, i) => {
      if (text.includes(ALLOW_COMMENT)) return;
      for (const re of [LEGACY_CLASS, RAW_COLOR, INLINE_STYLE_COLOR]) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(text))) {
          findings.push({ file, line: i + 1, text: text.trim().slice(0, 140), match: m[0] });
        }
      }
    });
  }
  return findings;
}

function main() {
  const all = process.argv.includes("--all");
  const targets = all ? ["src"] : GUARDED;
  const findings = findLegacyColors(targets);

  if (all) {
    const byFile = findings.reduce<Record<string, number>>((acc, f) => ((acc[f.file] = (acc[f.file] ?? 0) + 1), acc), {});
    Object.entries(byFile)
      .sort((a, b) => b[1] - a[1])
      .forEach(([f, n]) => console.log(`${String(n).padStart(4)}  ${f}`));
    console.log(`\n${findings.length} legacy color usages across src/ (informational)`);
    return;
  }

  if (findings.length === 0) {
    console.log(`✅ theme-token-lint: no hardcoded colors in ${GUARDED.length} guarded paths`);
    return;
  }

  console.error("❌ theme-token-lint: hardcoded colors found in guarded UI files.\n");
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  ${f.match}\n      ${f.text}`);
  }
  console.error(
    `\n${findings.length} issue(s). Use semantic tokens instead (docs/theme-tokens.md):\n` +
      "  text-foreground / text-muted-foreground / text-primary\n" +
      "  bg-background / bg-card / bg-muted / bg-chip / bg-primary\n" +
      "  border-border / border-chip-border / border-info-border\n" +
      "  bg-info-soft | bg-success-soft | bg-warning-soft | bg-danger-soft | bg-special-soft\n" +
      `Intentional exception? add a \`${ALLOW_COMMENT}\` comment on the line.`,
  );
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
