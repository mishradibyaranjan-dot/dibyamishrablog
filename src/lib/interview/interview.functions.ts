import {createServerFn} from '@tanstack/react-start';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {z} from 'zod';
import {sanitizeDocument,settingsSchema,analysisSchema,questionSchema,coachSchema} from './schema';
const uuid=z.string().uuid();
export const resumeInterviewService=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data:admin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(!admin)throw new Error('Administrator access required.');
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');await db.from('interview_engine_state').update({paused:false,reason:null,lease_until:null}).eq('id','interview');return {ok:true};
});
export const createInterview=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({jd:z.string().max(24000),resume:z.string().max(24000),title:z.string().max(200),employer:z.string().max(200),jobId:uuid.nullable(),settings:settingsSchema})).handler(async({data,context})=>{
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 let jd=sanitizeDocument(data.jd);let title=data.title,employer=data.employer;
 if(data.jobId){const {data:j}=await context.supabase.from('jobs').select('id,title,company,summary').eq('id',data.jobId).maybeSingle();if(!j)throw new Error('This job is no longer publicly verified. Paste your own JD to start a separate preparation session.');jd=sanitizeDocument(j.summary??'');title=j.title;employer=j.company;}
 if(jd.length<80)throw new Error('Provide at least 80 characters of job responsibilities and requirements.');
 const resume=sanitizeDocument(data.resume);const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({jd,resume,settings:data.settings}))))).map(b=>b.toString(16).padStart(2,'0')).join('');
 const {data:cached}=await db.from('interview_sessions').select('id').eq('user_id',context.userId).eq('cache_key',hash).in('status',['queued','processing','completed']).gt('expires_at',new Date().toISOString()).limit(1).maybeSingle();if(cached)return cached.id;
 const {data:active}=await db.from('interview_sessions').select('id',{count:'exact'}).eq('user_id',context.userId).in('status',['queued','processing']);if((active?.length??0)>=2)throw new Error('Finish or cancel an active pack before starting another.');
 const {data:s,error}=await db.from('interview_sessions').insert({user_id:context.userId,jd,resume_text:resume||null,title:title||'Interview preparation',employer:employer||null,job_id:data.jobId,settings:data.settings,cache_key:hash,expires_at:new Date(Date.now()+data.settings.retention*86400000).toISOString()}).select('id').single();if(error||!s)throw new Error('Could not create interview preparation.');return s.id;
});
export const getInterview=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:uuid.nullable()})).handler(async({data,context})=>{
 const db=context.supabase;
 const {data:list,error}=await db.from('interview_sessions').select('id,title,employer,status,error,created_at,expires_at').order('created_at',{ascending:false}).limit(30);if(error)throw new Error('Could not load private sessions.');
 if(!data.id)return {list:list??[],pack:null};
 const {data:s}=await db.from('interview_sessions').select('*').eq('id',data.id).maybeSingle();if(!s)throw new Error('Session unavailable or retention period ended.');
 const [qs,answers,plan,resume,feedback]=await Promise.all([db.from('interview_questions').select('*').eq('session_id',s.id).order('position'),db.from('interview_answers').select('*').eq('session_id',s.id),db.from('interview_preparation_plans').select('content').eq('session_id',s.id).maybeSingle(),db.from('resume_analysis').select('content').eq('session_id',s.id).maybeSingle(),db.from('interview_feedback').select('*').eq('session_id',s.id).order('created_at')]);
 return {list:list??[],pack:{session:s,analysis:s.analysis?analysisSchema.parse(s.analysis):null,questions:(qs.data??[]).map(q=>({...questionSchema.parse(answers.data?.find(a=>a.question_id===q.id)?.content),id:q.id,position:q.position})),plan:plan.data?.content??[],resume:resume.data?.content??null,feedback:(feedback.data??[]).map(f=>({...f,content:f.content?coachSchema.parse(f.content):null}))}};
});
export const updateInterview=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:uuid,action:z.enum(['delete','cancel','progress','resume']),position:z.number().int().min(0).max(99).default(0)})).handler(async({data,context})=>{
 const {data:s}=await context.supabase.from('interview_sessions').select('id').eq('id',data.id).maybeSingle();if(!s)throw new Error('Session unavailable.');
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 if(data.action==='delete'){const r=await context.supabase.from('interview_sessions').delete().eq('id',s.id);if(r.error)throw new Error('Could not delete session.');}
 else if(data.action==='resume'){const {data:state}=await db.from('interview_engine_state').select('paused,reason').eq('id','interview').maybeSingle();if(state?.paused)throw new Error(state.reason??'AI is paused; restore service access first.');await db.from('interview_sessions').update({status:'queued',error:null,retry_at:null}).eq('id',s.id).in('status',['failed','paused']);}
 else await db.from('interview_sessions').update(data.action==='cancel'?{status:'cancelled'}:{current_question:data.position}).eq('id',s.id);
 await db.rpc('drain_interview_queue');return {ok:true};
});