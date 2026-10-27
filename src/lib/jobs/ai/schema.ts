import { z } from "zod";
import { CAREER_LEVELS, CATEGORY_RULES } from "../rules";

export const classificationSchema = z.object({
  career_level: z.enum([...CAREER_LEVELS, "unclassified"]),
  categories: z.array(z.string()),
  skills: z.array(z.string()),
  evidence: z.string(),
}).strict();

export function validateClassification(result: z.infer<typeof classificationSchema>, sourceText: string) {
  const categories = new Set(CATEGORY_RULES.map(([name]) => name));
  if (result.categories.some((c) => !categories.has(c) && c !== "General")) throw new Error("AI returned an unsupported category");
  if (!result.evidence || !sourceText.toLowerCase().includes(result.evidence.toLowerCase())) throw new Error("AI evidence was not present in the employer text");
  return { ...result, skills: result.skills.filter((s) => sourceText.toLowerCase().includes(s.toLowerCase())).slice(0, 20) };
}