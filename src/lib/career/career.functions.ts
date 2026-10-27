import {createServerFn} from '@tanstack/react-start';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {z} from 'zod';
import {sanitizeDocument} from '@/lib/interview/schema';
import {applyDecisions,decisionSchema,templateSchema,resumeReviewSchema} from './schema';
const uuid=z.string().uuid();
export const createResumeReview=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({jd:z.string().max(24000),original:z.string().max(24000),jobId:uuid.nullable(),title:z.string().max(200),filename:z.string().max(200).nullable(),extension:z.enum(['pdf','docx','txt']).nullable(),consent:z.literal(true),retention:z.union([z.literal(7),z.literal(30),z.literal(90)])})).handler(async({data,context})=>{
 let jd=sanitizeDocument(data.jd),title=data.title;
 if(data.jobId){const {data:job,error}=await context.supabase.from('jobs').select('id,title,summary,company').eq('id',data.jobId).maybeSingle();if(error||!job)throw new Error('This job is no longer publicly verified. Start a standalone review with your own JD.');jd=sanitizeDocument(job.summary??'');title=`${job.title} · ${job.company}`;}
 const original=sanitizeDocument(data.original);if(jd.length<80||original.length<40)throw new Error('Provide a readable resume and at least 80 characters of job description.');
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {count}=await db.from('career_resumes').select('id',{count:'exact',head:true}).eq('user_id',context.userId).gt('expires_at',new Date().toISOString());if((count??0)>=20)throw new Error('Delete an old review before starting another.');
 const id=crypto.randomUUID(),path=data.extension?`${context.userId}/${id}/original.${data.extension}`:null;
 const {error}=await db.from('career_resumes').insert({id,user_id:context.userId,job_id:data.jobId,title:title||'Standalone resume review',jd,original_text:original,original_filename:data.filename,original_type:data.extension,original_path:path,expires_at:new Date(Date.now()+data.retention*86400000).toISOString()});if(error)throw new Error('Could not save private resume review.');return {id,path};
});
export const getResumeReviews=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:uuid.nullable()})).handler(async({data,context})=>{
 const {purgeExpiredCareerReviews}=await import('./retention.server');await purgeExpiredCareerReviews(context.userId);
 const {data:list,error}=await context.supabase.from('career_resumes').select('id,title,status,created_at,expires_at').order('created_at',{ascending:false}).limit(20);if(error)throw new Error('Could not load private reviews.');
 if(!data.id)return {list:list??[],review:null,versions:[]};
 const {data:review,error:readError}=await context.supabase.from('career_resumes').select('*').eq('id',data.id).maybeSingle();if(readError||!review)throw new Error('Review unavailable or retention ended.');
 const {data:versions,error:versionError}=await context.supabase.from('career_resume_versions').select('*').eq('resume_id',review.id).order('version',{ascending:false});if(versionError)throw new Error('Could not load version history.');
 return {list:list??[],review,versions:versions??[]};
});
export const saveResumeVersion=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:uuid,revision:z.number().int().min(0),decisions:z.array(decisionSchema).max(12),template:templateSchema,approve:z.boolean()})).handler(async({data,context})=>{
 const {data:r}=await context.supabase.from('career_resumes').select('*').eq('id',data.id).maybeSingle();if(!r)throw new Error('Resume unavailable.');
 const recommendations=r.analysis?resumeReviewSchema.parse(r.analysis).recommendations:[];
 if(data.approve&&(!r.analysis||data.decisions.length!==recommendations.length))throw new Error('Review the analysis before approving the final resume.');
 const content=applyDecisions(r.original_text,recommendations,data.decisions);
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {data:id,error}=await db.rpc('save_career_version',{p_id:r.id,p_user:context.userId,p_revision:data.revision,p_content:content,p_decisions:JSON.parse(JSON.stringify(data.decisions)),p_template:data.template,p_approve:data.approve});if(error)throw new Error('Resume changed or save failed; reload your review before saving.');return {id};
});
export const getApprovedResume=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:uuid,versionId:uuid})).handler(async({data,context})=>{
 const {data:r}=await context.supabase.from('career_resumes').select('id,title,revision').eq('id',data.id).maybeSingle();if(!r)throw new Error('Resume unavailable.');
 const {data:v}=await context.supabase.from('career_resume_versions').select('*').eq('id',data.versionId).eq('resume_id',r.id).eq('version',r.revision).not('approved_at','is',null).maybeSingle();if(!v)throw new Error('Approve the latest resume preview before export.');return {content:v.content,template:templateSchema.parse(v.template),title:r.title,versionId:v.id};
});
export const recordResumeDownload=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:uuid,versionId:uuid,format:z.enum(['docx','pptx']),bytes:z.number().int().min(1).max(20000000)})).handler(async({data,context})=>{
 const {data:r}=await context.supabase.from('career_resumes').select('id,revision').eq('id',data.id).maybeSingle();if(!r)throw new Error('Resume unavailable.');
 const {data:v}=await context.supabase.from('career_resume_versions').select('id').eq('id',data.versionId).eq('resume_id',r.id).eq('version',r.revision).not('approved_at','is',null).maybeSingle();if(!v)throw new Error('Final approval required.');
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const {error}=await db.from('career_generated_documents').insert({resume_id:r.id,version_id:v.id,format:data.format,bytes:data.bytes});if(error)throw new Error('Could not record generated document.');return {ok:true};
});
export const deleteResumeReview=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:uuid})).handler(async({data,context})=>{
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const {data:r}=await db.from('career_resumes').select('id,original_path').eq('id',data.id).eq('user_id',context.userId).maybeSingle();if(!r)throw new Error('Review unavailable.');
 if(r.original_path){const {error}=await db.storage.from('career-resume-quarantine').remove([r.original_path]);if(error)throw new Error('Could not remove the original file; review retained so you can retry deletion.');}
 const {error}=await context.supabase.from('career_resumes').delete().eq('id',r.id);if(error)throw new Error('Could not delete private review.');return {ok:true};
});