import {createFileRoute} from '@tanstack/react-router';
export const Route=createFileRoute('/api/public/cron/interview-worker')({server:{handlers:{POST:async({request})=>{
 const secret=process.env['CRON_SECRET'];const token=request.headers.get('authorization')?.replace(/^Bearer /i,'');if(!secret||token!==secret)return new Response('Unauthorized',{status:401});
 const {runInterviewWorker}=await import('@/lib/interview/engine.server');return Response.json(await runInterviewWorker(request));
}}}});