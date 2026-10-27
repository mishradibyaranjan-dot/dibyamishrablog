import {createFileRoute} from '@tanstack/react-router';
import {z} from 'zod';
export const Route=createFileRoute('/api/public/interview-coach')({server:{handlers:{POST:async({request})=>{
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const token=request.headers.get('authorization')?.replace(/^Bearer /i,'');if(!token)return new Response('Sign in to practice.',{status:401});
 const {data:auth}=await db.auth.getUser(token);if(!auth.user)return new Response('Sign in to practice.',{status:401});
 const raw=await request.text();if(raw.length>12000)return new Response('Answer too long',{status:413});let input;try{input=z.object({sessionId:z.string().uuid(),questionId:z.string().uuid(),answer:z.string().min(1).max(8000),followUp:z.boolean()}).parse(JSON.parse(raw));}catch{return new Response('Invalid request',{status:400});}
 const {data:s}=await db.from('interview_sessions').select('*').eq('id',input.sessionId).eq('user_id',auth.user.id).gt('expires_at',new Date().toISOString()).maybeSingle();if(!s)return new Response('Session unavailable',{status:404});
 const {data:q}=await db.from('interview_questions').select('*').eq('id',input.questionId).eq('session_id',s.id).maybeSingle();if(!q)return new Response('Question unavailable',{status:404});
 const {data:state}=await db.from('interview_engine_state').select('paused,reason').eq('id','interview').maybeSingle();if(state?.paused)return new Response(state.reason??'AI service paused',{status:403});
 const r=await db.rpc('reserve_interview_usage',{p_user:auth.user.id,p_session:s.id,p_operation:'coach'});if(r.error)return new Response('Daily AI request limit reached; try tomorrow.',{status:429});
 const {data:f}=await db.from('interview_feedback').insert({session_id:s.id,question_id:q.id,candidate_answer:input.answer,status:'processing'}).select('id').single();
 const encoder=new TextEncoder();return new Response(new ReadableStream({async start(controller){
  controller.enqueue(encoder.encode(JSON.stringify({status:'coaching'})+'\n'));
  try{const {coachInterview,asJson}=await import('@/lib/interview/engine.server');const {output,usage}=await coachInterview(request,{jd:s.jd,question:q.question,answer:input.answer,mode:input.followUp?'follow-up question':'evaluate candidate answer'});
   if(f)await db.from('interview_feedback').update({content:asJson(output),status:'completed'}).eq('id',f.id);
   await db.from('ai_usage_metrics').update({status:'completed',input_tokens:usage.inputTokens??0,output_tokens:usage.outputTokens??0}).eq('id',r.data);
   controller.enqueue(encoder.encode(JSON.stringify({output})+'\n'));
  }catch(e){const status=e&&typeof e==='object'&&'statusCode'in e?Number(e.statusCode):0;const message=e instanceof Error?e.message.slice(0,600):'Coaching unavailable.';
   if(f)await db.from('interview_feedback').update({status:'failed',error:message}).eq('id',f.id);
   if([401,402,403,404].includes(status))await db.from('interview_engine_state').upsert({id:'interview',paused:true,reason:message});
   controller.enqueue(encoder.encode(JSON.stringify({error:message})+'\n'));
  }finally{controller.close();}
 }}),{headers:{'content-type':'application/x-ndjson','cache-control':'no-store'}});
}}}});