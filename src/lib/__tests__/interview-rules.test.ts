import {describe,it,expect} from 'vitest';
import {settingsSchema,sanitizeDocument,validatePack} from '../interview/schema';
describe('interview requirements',()=>{
 it.each([10,25,50,100])('supports %i questions',count=>expect(settingsSchema.parse({count,difficulty:'Expert',style:'Executive',days:14,retention:30}).count).toBe(count));
 it.each([1,3,7,14])('supports a %i-day plan',days=>expect(settingsSchema.parse({count:10,difficulty:'Beginner',style:'Balanced',days,retention:7}).days).toBe(days));
 it('rejects unsupported counts',()=>expect(()=>settingsSchema.parse({count:75,difficulty:'Expert',style:'Executive',days:14,retention:30})).toThrow());
 it('removes markup and control characters from private documents',()=>expect(sanitizeDocument('<p>Engineer\u0000</p>')).toBe('Engineer'));
 it('rejects fabricated JD evidence',()=>expect(()=>validatePack({analysis:{title:'Engineer',seniority:'Junior',industry:'Software',responsibilities:[],skills:[],tools:[],experience:'Unknown',certifications:[],competencies:[],themes:[],evidence:['invented requirement'],assumptions:[],missing_information:[]},questions:[],plan:[],resume:{matched:[],unproven:[],preparation:[],achievements:[],evidence:[]}},'Actual JD','',0,[])).toThrow('JD evidence'));
});