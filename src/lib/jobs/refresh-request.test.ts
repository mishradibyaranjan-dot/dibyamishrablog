import { it, expect } from 'vitest';
import { refreshRequest, refreshDispatchUrl } from './refresh-request';
it('requires a source for isolated work and rejects extra/invalid fields',()=>{
 expect(refreshRequest.parse({})).toEqual({mode:'dispatch',force:false});
 expect(()=>refreshRequest.parse({mode:'source'})).toThrow();
 expect(()=>refreshRequest.parse({mode:'source',sourceSlug:'../../admin'})).toThrow();
 expect(()=>refreshRequest.parse({mode:'source',sourceSlug:'ab-openai',url:'https://evil.example'})).toThrow();
});
it('never forwards a cron credential to an arbitrary caller host',()=>{
 expect(refreshDispatchUrl('https://www.dibyamishra.co.in/anything')).toBe('https://www.dibyamishra.co.in/api/public/cron/jobs-sync');
 expect(()=>refreshDispatchUrl('https://evil.example/api/public/cron/jobs-sync')).toThrow();
 expect(refreshDispatchUrl('http://localhost:8080/api/public/cron/jobs-sync')).toBe('https://project--afb27601-9db8-4f5f-bd9a-50ae5eee7ddc-dev.lovable.app/api/public/cron/jobs-sync');
});