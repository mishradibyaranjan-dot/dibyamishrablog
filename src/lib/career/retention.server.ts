/** Invoked by existing jobs refreshes; no additional polling schedule. */
export async function purgeExpiredCareerReviews(userId?:string){
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 let query=db.from('career_resumes').select('id,original_path').lte('expires_at',new Date().toISOString()).limit(100);
 if(userId)query=query.eq('user_id',userId);
 const {data:expired,error}=await query;if(error)throw new Error('Could not check resume retention.');
 for(const r of expired??[]){if(r.original_path){const {error:storageError}=await db.storage.from('career-resume-quarantine').remove([r.original_path]);if(storageError)continue;}await db.from('career_resumes').delete().eq('id',r.id).lte('expires_at',new Date().toISOString());}
}