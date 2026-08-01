declare module "*/scripts/theme-token-lint.mjs" {
  export const GUARDED: string[];
  export function findLegacyColors(
    paths: string[],
  ): { file: string; line: number; text: string; match: string }[];
}
