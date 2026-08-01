import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GUARDED, findLegacyColors } from "../../../scripts/theme-token-lint.mjs";

const css = readFileSync("src/styles.css", "utf8");

describe("theme tokens", () => {
  it("keeps guarded Learn/chat/theme UI free of hardcoded colors", () => {
    const findings = findLegacyColors(GUARDED).map((f) => `${f.file}:${f.line} ${f.match}`);
    expect(findings).toEqual([]);
  });

  it("declares the centralised token palette", () => {
    for (const token of [
      "--color-chip",
      "--color-chip-foreground",
      "--color-chip-border",
      "--color-info-soft",
      "--color-success-soft",
      "--color-warning-soft",
      "--color-danger-soft",
      "--color-special-soft",
      "--color-input",
      "--color-foreground",
      "--color-background",
    ]) {
      expect(css, `${token} missing from src/styles.css`).toContain(token);
    }
  });

  it("defines every theme with both a background and a foreground", () => {
    const themes = [...css.matchAll(/:root\[data-theme="([a-z]+)"\]\s*\{([^}]*)\}/g)];
    expect(themes.length).toBeGreaterThanOrEqual(9);
    for (const [, name, body] of themes) {
      expect(body, `${name} missing --background`).toMatch(/--background:/);
      expect(body, `${name} missing --foreground`).toMatch(/--foreground:/);
    }
  });

  it("guards at least the Learn and chat surfaces", () => {
    expect(GUARDED).toContain("src/routes/learn.tsx");
    expect(GUARDED).toContain("src/components/chat");
  });
});
