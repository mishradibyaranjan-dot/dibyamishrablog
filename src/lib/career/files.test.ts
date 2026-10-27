import {describe,it,expect} from 'vitest';
import JSZip from 'jszip';
import {validatePrivateFile} from './files';
describe('Private resume file validation',()=>{
 it('accepts UTF-8 TXT and rejects binary impostors',async()=>{expect(await validatePrivateFile(new File(['Alex Chen — engineer'], 'resume.txt'))).toBe('txt');await expect(validatePrivateFile(new File([new Uint8Array([0,1,2])],'resume.txt'))).rejects.toThrow();});
 it('rejects corrupt PDF and active content',async()=>{await expect(validatePrivateFile(new File(['not a pdf'],'resume.pdf'))).rejects.toThrow();await expect(validatePrivateFile(new File(['%PDF-1.7 /JavaScript'],'resume.pdf'))).rejects.toThrow();});
 it('rejects invalid Word documents and embedded macros',async()=>{await expect(validatePrivateFile(new File(['not a zip'],'resume.docx'))).rejects.toThrow();const zip=new JSZip();zip.file('[Content_Types].xml','xml');zip.file('word/document.xml','xml');zip.file('word/vbaProject.bin','macro');const bytes=await zip.generateAsync({type:'uint8array'});await expect(validatePrivateFile(new File([bytes],'resume.docx'))).rejects.toThrow();});
 it('enforces the 5 MB maximum',async()=>{await expect(validatePrivateFile(new File([new Uint8Array(5*1024*1024+1)],'resume.txt'))).rejects.toThrow();});
});