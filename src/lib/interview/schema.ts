import { z } from 'zod';
export const settingsSchema = z.object({ count: z.union([z.literal(10),z.literal(25),z.literal(50),z.literal(100)]), difficulty: z.enum(['Beginner','Intermediate','Advanced','Expert']), style: z.enum(['Balanced','Technical','Behavioral','Executive']), days: z.union([z.literal(1),z.literal(3),z.literal(7),z.literal(14)]), retention: z.union([z.literal(7),z.literal(30),z.literal(90)]) });
export const questionSchema = z.object({ category:z.string(), question:z.string(), why:z.string(), answer:z.string(), explanation:z.string(), example:z.string(), key_points:z.array(z.string()), mistakes:z.array(z.string()), follow_ups:z.array(z.string()) });
export const analysisSchema = z.object({ title:z.string(), seniority:z.string(), industry:z.string(), responsibilities:z.array(z.string()), skills:z.array(z.string()), tools:z.array(z.string()), experience:z.string(), certifications:z.array(z.string()), competencies:z.array(z.string()), themes:z.array(z.string()), evidence:z.array(z.string()), assumptions:z.array(z.string()), missing_information:z.array(z.string()) });
export const packSchema = z.object({ analysis:analysisSchema, questions:z.array(questionSchema), plan:z.array(z.object({ day:z.number(), topics:z.array(z.string()), tasks:z.array(z.string()) })), resume:z.object({ matched:z.array(z.string()), unproven:z.array(z.string()), preparation:z.array(z.string()), achievements:z.array(z.string()), evidence:z.array(z.string()) }) });
export const coachSchema = z.object({ response:z.string(), criteria:z.array(z.object({ name:z.string(), assessment:z.string(), evidence:z.string() })), recommendation:z.string(), follow_up:z.string() });
export type InterviewQuestion = z.infer<typeof questionSchema> & {id:string;position:number};
export type InterviewPack = z.infer<typeof packSchema>;
export function sanitizeDocument(text:string) { return text.replace(/<[^>]*>/g,' ').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim().slice(0,24000); }
export function validatePack(value:unknown,jd:string,resume:string,count:number,previous:string[]) {
  const p=packSchema.parse(value);
  if(p.questions.length!==count) throw new Error('The generated batch had an incorrect question count. Start a fresh generation.');
  const seen=new Set(previous.map(q=>q.toLowerCase().replace(/\W/g,'')));
  for(const q of p.questions){ const key=q.question.toLowerCase().replace(/\W/g,''); if(seen.has(key)) throw new Error('Duplicate question detected. Start a fresh generation.'); seen.add(key); }
  if(p.analysis.evidence.some(e=>!jd.includes(e))) throw new Error('JD evidence could not be verified.');
  if(p.resume.evidence.some(e=>!resume.includes(e))) throw new Error('Resume evidence could not be verified.');
  return p;
}