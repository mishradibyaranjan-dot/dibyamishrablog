import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
export const getCareerWorkspace = createServerFn({ method:'GET' }).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const {purgeExpiredCareerReviews}=await import('./retention.server');await purgeExpiredCareerReviews(context.userId);
  const db=context.supabase;
  const [resumes,versions,documents,interviews,feedback,saves,alerts]=await Promise.all([
    db.from('career_resumes').select('id,title,status,created_at,expires_at,original_filename,revision').order('created_at',{ascending:false}).limit(20),
    db.from('career_resume_versions').select('id,resume_id,version,template,approved_at').order('created_at',{ascending:false}).limit(100),
    db.from('career_generated_documents').select('id,resume_id,version_id,format,created_at').order('created_at',{ascending:false}).limit(100),
    db.from('interview_sessions').select('id,title,status,created_at').order('created_at',{ascending:false}).limit(30),
    db.from('interview_feedback').select('id,session_id,status,created_at').order('created_at',{ascending:false}).limit(50),
    db.from('saved_jobs').select('job_id,jobs(slug,title,company,apply_url)').eq('user_id',context.userId),
    db.from('job_alerts').select('id,name,enabled').eq('user_id',context.userId),
  ]);
  if([resumes,versions,documents,interviews,feedback,saves,alerts].some(result=>result.error))throw new Error('Could not load your private career workspace.');
  return {resumes:resumes.data??[],versions:versions.data??[],documents:documents.data??[],interviews:interviews.data??[],feedback:feedback.data??[],saves:saves.data??[],alerts:alerts.data??[]};
});