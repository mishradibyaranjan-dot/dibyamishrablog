import { beforeEach, describe, it, expect, vi } from 'vitest';

const state=vi.hoisted(()=>({ batches:[] as number[], closed:[] as string[], failedFeed:false, liveLease:false, recovered:0 }));
vi.mock('@/integrations/supabase/client.server',()=>{
 const db={rpc:vi.fn(async(name:string)=>{
  if(name==='recover_job_source_runs'){state.recovered++;return {data:null,error:null};}
  return {data:name==='claim_job_source'?!state.liveLease:null,error:null};
 }),from:(table:string)=>{
  let operation='',payload:any=null,selection='',status='',offset=0;
  const q:any={select:(s:string)=>{selection=s;return q;},eq:(key:string,v:any)=>{if(key==='application_status')status=v;return q;},gt:()=>q,order:()=>q,range:(start:number)=>{offset=start;return q;},limit:()=>q,in:(_key:string,ids:string[])=>{state.closed.push(...ids);return q;},insert:(p:any)=>{operation='insert';payload=p;return q;},upsert:(p:any)=>{operation='upsert';payload=p;return q;},update:(p:any)=>{operation='update';payload=p;return q;},single:()=>q,
   then:(resolve:any,reject:any)=>Promise.resolve((()=>{
    if(table==='job_sources')return {data:operation==='update'?[{id:'source'}]:[{id:'source',slug:'ab-test',name:'Test',provider:'ashby',board_token:'test',failure_count:0}],error:null};
    if(table==='source_sync_runs')return {data:operation==='insert'?{id:'run'}:null,error:null};
    if(table==='jobs' && operation==='upsert'){state.batches.push(payload.length);return {data:payload.map((r:any)=>({id:r.source_job_id,source_job_id:r.source_job_id})),error:null};}
    if(table==='jobs' && !operation && status==='OPEN')return {data:offset===0?[]:[],error:null};
    return {data:[],error:null};
   })()).then(resolve,reject)};return q;
 }};return {supabaseAdmin:db};
});
vi.mock('./verify.server',()=>({verifyApplication:vi.fn(async()=>({ok:true,status:200,finalUrl:'https://jobs.ashbyhq.com/test/1',evidence:'Accessible'}))}));
import { runJobSync } from './sync.server';
beforeEach(()=>{
 state.batches=[];state.closed=[];state.failedFeed=false;state.liveLease=false;state.recovered=0;
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(state.failedFeed?'{"jobs":[{"id":"1"},':JSON.stringify({jobs:Array.from({length:121},(_,id)=>({id:String(id),title:'Engineer',location:'Bengaluru, India',publishedAt:new Date(Date.now()-3600000).toISOString(),jobUrl:`https://jobs.ashbyhq.com/test/${id}`,applyUrl:`https://jobs.ashbyhq.com/test/${id}`}))}))));
});
describe('Isolated source refresh',()=>{
 it('writes at most fifty jobs per batch and finishes a complete source',async()=>{
  const result=await runJobSync({sourceSlug:'ab-test'});
  expect(result[0].status).toBe('completed');expect(state.batches).toEqual([50,50,21]);expect(state.recovered).toBe(1);
 });
 it('does not write or close jobs from a partial feed',async()=>{
  state.failedFeed=true;const result=await runJobSync({sourceSlug:'ab-test'});
  expect(result[0].status).toBe('failed');expect(state.batches).toEqual([]);expect(state.closed).toEqual([]);
 });
 it('skips a source with a live lease without fetching its feed',async()=>{
  state.liveLease=true;expect((await runJobSync({sourceSlug:'ab-test'}))[0].status).toBe('skipped');expect(fetch).not.toHaveBeenCalled();
 });
 it('rejects whole-registry work inside one invocation',async()=>{
  await expect(runJobSync()).rejects.toThrow('Single-source');
 });
});