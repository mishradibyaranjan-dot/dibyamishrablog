import type { ResumeReview } from './schema';

export const COMPATIBILITY_WEIGHTS = { skills: 30, experience: 25, achievements: 15, formatting: 15, keywords: 10, completeness: 5 } as const;
type Factor = { key: keyof typeof COMPATIBILITY_WEIGHTS; label: string; weight: number; value: number | null; rationale: string; evidence: string[] };
const tokens = (value: string) => value.toLowerCase().match(/[\p{L}\p{N}+#]+/gu) ?? [];
const stop = new Set('the and with for from this that your our are will have has you a an to of in on as or be by is at we'.split(' '));
/** Deterministic arithmetic over verified excerpts; no inference of candidate abilities. */
export function calculateCompatibility(review: ResumeReview, jd: string, original: string) {
  const valid = review.requirements.filter(r => r.jd_evidence && jd.includes(r.jd_evidence) && (!r.resume_evidence || original.includes(r.resume_evidence)));
  const factor = (key: Factor['key'], label: string, pattern: RegExp): Factor => {
    const rows = valid.filter(r => pattern.test(`${r.requirement} ${r.jd_evidence}`));
    const assessed = rows.filter(r => r.assessment !== 'Unable to assess');
    const points: number[] = assessed.map(r => !r.resume_evidence ? 0 : r.assessment === 'Clearly demonstrated' ? 1 : r.assessment === 'Partially demonstrated' ? 0.5 : 0);
    return { key, label, weight: COMPATIBILITY_WEIGHTS[key], value: points.length ? points.reduce((a,b) => a+b,0)/points.length : null,
      rationale: points.length ? `${points.length} assessed requirements; clearly demonstrated = 1, partial = 0.5, missing evidence = 0. Requirements may contribute to more than one factor.` : 'No assessable requirements for this factor in the supplied job description.',
      evidence: assessed.map(r => `${r.jd_evidence} → ${r.resume_evidence || 'No resume evidence'}`) };
  };
  const keywords = [...new Set(tokens(valid.map(r => r.jd_evidence).join(' ')).filter(word => word.length > 2 && !stop.has(word)))];
  const resumeTokens = new Set(tokens(original));
  const matches = keywords.filter(word => resumeTokens.has(word));
  const sections = [/(summary|profile|objective)/i, /(experience|employment|career)/i, /skills|competenc/i, /education|qualification/i, /contact/i];
  const verifiedSections = review.sections.filter(s => s.evidence && original.includes(s.evidence));
  const completedSections = sections.filter(pattern => verifiedSections.some(s => pattern.test(s.heading))).length;
  const factors: Factor[] = [
    factor('skills','Relevant skills',/skill|knowledge|proficien|competenc|python|java|sql|cloud|docker|excel|communication|leadership|manage|develop|build|design|test/i),
    factor('experience','Experience alignment',/experience|years?|worked|employment|senior|lead|manage|deliver/i),
    factor('achievements','Relevant achievements',/achievement|result|impact|improv|reduc|increas|deliver|success|outcome/i),
    { key:'formatting',label:'Parsing and formatting',weight:15,value:null,rationale:'Readable text was extracted, but employer ATS parsing and original visual layout cannot be verified from text. This factor is excluded, not awarded points.',evidence:[] },
    { key:'keywords',label:'JD keyword coverage',weight:10,value:keywords.length ? matches.length/keywords.length : null,rationale:`${matches.length} of ${keywords.length} distinct nontrivial words in verified JD excerpts occur in the resume. Lexical overlap is not proof of skill.`,evidence:matches },
    { key:'completeness',label:'Resume completeness',weight:5,value:completedSections/sections.length,rationale:`${completedSections} of 5 section categories evidenced: summary, experience, skills, education, contact. Missing headings can lower this heuristic despite valid content.`,evidence:verifiedSections.map(s => s.heading) },
  ];
  const assessedWeight = factors.reduce((sum,f) => sum+(f.value === null ? 0 : f.weight),0);
  const score = assessedWeight ? Math.round(factors.reduce((sum,f) => sum+(f.value === null ? 0 : f.value*f.weight),0)/assessedWeight*100) : null;
  return { score, assessedWeight, factors, version:'evidence-compatibility-v1' };
}