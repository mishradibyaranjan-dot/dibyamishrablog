import {describe,it,expect} from 'vitest';
import JSZip from 'jszip';
import {PDFDocument,PDFName,PDFString} from 'pdf-lib';
import {validatePrivateFile} from './files';
describe('Private resume file validation',()=>{
 it('accepts UTF-8 TXT and rejects binary impostors',async()=>{expect(await validatePrivateFile(new File(['Alex Chen — engineer'], 'resume.txt'))).toBe('txt');await expect(validatePrivateFile(new File([new Uint8Array([0,1,2])],'resume.txt'))).rejects.toThrow();});
 it('rejects corrupt PDF and active content',async()=>{await expect(validatePrivateFile(new File(['not a pdf'],'resume.pdf'))).rejects.toThrow();await expect(validatePrivateFile(new File(['%PDF-1.7 /JavaScript'],'resume.pdf'))).rejects.toThrow();});
 it('rejects invalid Word documents and embedded macros',async()=>{await expect(validatePrivateFile(new File(['not a zip'],'resume.docx'))).rejects.toThrow();const zip=new JSZip();zip.file('[Content_Types].xml','xml');zip.file('word/document.xml','xml');zip.file('word/vbaProject.bin','macro');const bytes=await zip.generateAsync({type:'arraybuffer'});await expect(validatePrivateFile(new File([bytes],'resume.docx'))).rejects.toThrow();});
 it('enforces the 5 MB maximum',async()=>{await expect(validatePrivateFile(new File([new Uint8Array(5*1024*1024+1)],'resume.txt'))).rejects.toThrow();});
 it.each(['destination','GoTo'])('accepts a normal PDF initial view: %s',async(kind)=>{
  const doc=await PDFDocument.create();const page=doc.addPage();page.drawText('Alex Chen, engineer. Built reliable enterprise software.');
  const destination=doc.context.obj([page.ref,PDFName.of('Fit')]);
  doc.catalog.set(PDFName.of('OpenAction'),kind==='destination'?destination:doc.context.obj({S:'GoTo',D:destination}));
  expect(await validatePrivateFile(new File([await doc.save() as Uint8Array<ArrayBuffer>],'resume.pdf'))).toBe('pdf');
 });
 it('ignores unsafe-looking bytes in compressed streams and text strings',async()=>{
  const doc=await PDFDocument.create();doc.addPage();doc.setSubject('/JS /AA /JavaScript /EmbeddedFile');
  doc.context.register(doc.context.flateStream('/JS /AA /JavaScript /OpenAction'));
  expect(await validatePrivateFile(new File([await doc.save() as Uint8Array<ArrayBuffer>],'resume.pdf'))).toBe('pdf');
 });
 it.each(['JavaScript','Launch'])('rejects a parsed %s action in compressed objects',async(kind)=>{
  const doc=await PDFDocument.create();doc.addPage();const action=doc.context.register(doc.context.obj({S:kind,JS:PDFString.of('app.alert(1)')}));
  doc.catalog.set(PDFName.of('OpenAction'),action);
  await expect(validatePrivateFile(new File([await doc.save() as Uint8Array<ArrayBuffer>],'resume.pdf'))).rejects.toThrow('Active or embedded');
 });
 it('rejects a parsed embedded file',async()=>{
  const doc=await PDFDocument.create();doc.addPage();doc.context.register(doc.context.flateStream('payload',{Type:'EmbeddedFile'}));
  await expect(validatePrivateFile(new File([await doc.save() as Uint8Array<ArrayBuffer>],'resume.pdf'))).rejects.toThrow('Active or embedded');
 });
});