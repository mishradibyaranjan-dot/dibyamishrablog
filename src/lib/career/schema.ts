import { z } from 'zod';

export const requirementSchema = z.object({ requirement: z.string(), jd_evidence: z.string(), assessment: z.enum(['Clearly demonstrated', 'Partially demonstrated', 'Not demonstrated in the resume', 'Unable to assess']), resume_evidence: z.string(), action: z.string() });
export const recommendationSchema = z.object({ id: z.string(), category: z.string(), severity: z.enum(['high', 'medium', 'low']), current: z.string(), replacement: z.string(), reason: z.string(), jd_evidence: z.string(), resume_evidence: z.string(), benefit: z.string(), confidence: z.enum(['verified', 'needs evidence']), requested_evidence: z.string() });
export const resumeReviewSchema = z.object({ summary: z.string(), sections: z.array(z.object({ heading: z.string(), evidence: z.string() })), requirements: z.array(requirementSchema), formatting: z.array(z.object({ finding: z.string(), evidence: z.string(), recommendation: z.string(), confidence: z.string() })), limitations: z.array(z.string()), recommendations: z.array(recommendationSchema) });
export type ResumeReview = z.infer<typeof resumeReviewSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
export const decisionSchema = z.object({ id: z.string().max(100), status: z.enum(['pending', 'accepted', 'rejected']), replacement: z.string().max(4000) });
export type Decision = z.infer<typeof decisionSchema>;
export const templateSchema = z.enum(['Professional ATS', 'Modern Professional', 'Executive Leadership']);
export type ResumeTemplate = z.infer<typeof templateSchema>;
const words = (s: string): string[] => s.toLocaleLowerCase().match(/[\p{L}\p{N}+#@./%-]+/gu) ?? [];

// Conservative wording-only guard: retain numbers/names and add no factual vocabulary.
export function supportedReplacement(original: string, current: string, replacement: string) {
  if (!current.trim() || !replacement.trim() || !original.includes(current)) return false;
  const vocabulary = new Set(words(current));
  if (words(replacement).some(w => !vocabulary.has(w))) return false;
  // Never drop unique facts/negations. Only remove redundant tokens in original order.
  const before=words(current),after=words(replacement);
  if ([...vocabulary].some(w=>!after.includes(w))) return false;
  let position=0;
  for(const token of after){while(position<before.length&&before[position]!==token)position++;if(position===before.length)return false;position++;}
  const immutable = current.match(/\b\d[\d.,%+/-]*\b|\b[A-Z][\p{L}\p{N}+#.-]*\b/gu) ?? [];
  return immutable.every(value => replacement.includes(value));
}
export function validateReview(value: unknown, jd: string, original: string): ResumeReview {
  const review = resumeReviewSchema.parse(value);
  if (review.requirements.length > 30 || review.recommendations.length > 12) throw new Error('Analysis exceeded safe review limits.');
  for (const section of review.sections) if (!section.evidence || !original.includes(section.evidence)) throw new Error('Resume section evidence could not be verified.');
  for (const requirement of review.requirements) {
    if (!requirement.jd_evidence || !jd.includes(requirement.jd_evidence) || (requirement.resume_evidence && !original.includes(requirement.resume_evidence))) throw new Error('Requirement evidence could not be verified.');
    if (['Clearly demonstrated', 'Partially demonstrated'].includes(requirement.assessment) && !requirement.resume_evidence) throw new Error('Demonstrated requirements need resume evidence.');
  }
  const seen = new Set<string>();
  review.recommendations = review.recommendations.map((r, i) => {
    const id = `change-${i + 1}`;
    if ((r.current && !original.includes(r.current)) || (r.resume_evidence && !original.includes(r.resume_evidence)) || (r.jd_evidence && !jd.includes(r.jd_evidence))) throw new Error('Recommendation evidence could not be verified.');
    const eligible = r.confidence === 'verified' && !!r.resume_evidence && !!r.jd_evidence && supportedReplacement(original, r.current, r.replacement) && !seen.has(r.current);
    seen.add(r.current);
    return { ...r, id, confidence: eligible ? 'verified' : 'needs evidence', requested_evidence: eligible ? '' : r.requested_evidence || 'Review factual support; this suggestion cannot be applied automatically.' };
  });
  return review;
}
export function applyDecisions(original: string, recommendations: Recommendation[], decisions: Decision[]) {
  if (new Set(decisions.map(d => d.id)).size !== decisions.length) throw new Error('Duplicate approval decisions.');
  const replacements: { start: number; end: number; value: string }[] = [];
  for (const d of decisions) {
    const r = recommendations.find(r => r.id === d.id);
    if (!r) throw new Error('Unknown recommendation.');
    if (d.status !== 'accepted') continue;
    if (r.confidence !== 'verified' || !r.resume_evidence || !original.includes(r.resume_evidence) || !r.jd_evidence || !supportedReplacement(original, r.current, d.replacement)) throw new Error('Only evidence-supported wording changes can be accepted.');
    const start = original.indexOf(r.current);
    if (original.indexOf(r.current, start + 1) !== -1) throw new Error('Repeated text is ambiguous; reject this change.');
    replacements.push({ start, end: start + r.current.length, value: d.replacement });
  }
  replacements.sort((a, b) => a.start - b.start);
  for (let i = 1; i < replacements.length; i++) if (replacements[i].start < replacements[i - 1].end) throw new Error('Overlapping changes cannot be applied together.');
  let result = original;
  for (const r of replacements.reverse()) result = result.slice(0, r.start) + r.value + result.slice(r.end);
  return result;
}