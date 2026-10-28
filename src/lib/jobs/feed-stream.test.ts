import { describe, it, expect } from 'vitest';
import { readFeed, FEED_LIMITS } from './feed-stream';

function response(text: string, chunk = 1024) {
  const bytes = new TextEncoder().encode(text); let offset=0;
  return new Response(new ReadableStream({pull(controller){
    if(offset===bytes.length){controller.close();return;}
    controller.enqueue(bytes.slice(offset,offset+chunk));offset=Math.min(bytes.length,offset+chunk);
  }}));
}
describe('Bounded employer feed parsing',()=>{
 it('streams full board objects and trims raw descriptions',async()=>{
  const jobs=Array.from({length:1500},(_,id)=>({id,description:'x'.repeat(5000)}));
  const rows=await readFeed(response(JSON.stringify({jobs}),8192),'$.jobs.*',j=>({id:j.id}));
  expect(rows).toHaveLength(1500);expect(rows[1499]).toEqual({id:1499});
 });
 it('handles split Unicode and top-level arrays',async()=>{
  expect(await readFeed(response('[{"title":"Engineer — Bengaluru"}]',1),'$.*',j=>j.title)).toEqual(['Engineer — Bengaluru']);
 });
 it('rejects truncated JSON instead of returning a partial closure snapshot',async()=>{
  await expect(readFeed(response('{"jobs":[{"id":1},'), '$.jobs.*',j=>j)).rejects.toThrow();
 });
 it('rejects an unexpected empty response before closure',async()=>{
  await expect(readFeed(response('{"error":"unavailable"}'),'$.jobs.*',j=>j)).rejects.toThrow('unrecognized');
 });
 it('rejects a giant record even when the HTTP body is below its overall limit',async()=>{
  await expect(readFeed(response(JSON.stringify([{text:'x'.repeat(FEED_LIMITS.recordBytes+4096)}])),'$.*',j=>j)).rejects.toThrow('item limit');
 });
 it('rejects too many records without returning a truncated snapshot',async()=>{
  await expect(readFeed(response(JSON.stringify(Array.from({length:FEED_LIMITS.records+1},()=>({id:1})))),'$.*',j=>j)).rejects.toThrow('record limit');
 });
});