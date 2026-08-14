// Client-safe types for the engineering documentation suite.
export type DocCategory = "Requirements" | "Design" | "Quality" | "Operations";

export type DocMeta = {
  id: string;
  title: string;
  category: DocCategory;
  summary: string;
  filename: string;
  bytes: number;
};
