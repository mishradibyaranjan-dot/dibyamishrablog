import {validatePrivateFile} from '@/lib/career/files';
export async function readPrivateDocument(file:File){
 await validatePrivateFile(file);
 const buffer=await file.arrayBuffer();let text='';
 if(file.name.toLowerCase().endsWith('.docx')){const mammoth=await import('mammoth/mammoth.browser');text=(await mammoth.extractRawText({arrayBuffer:buffer})).value;}
 else if(file.name.toLowerCase().endsWith('.pdf')){const pdf=await import('pdfjs-dist');const worker=await import('pdfjs-dist/build/pdf.worker.min.mjs?url');pdf.GlobalWorkerOptions.workerSrc=worker.default;const task=pdf.getDocument({data:buffer});const doc=await task.promise;if(doc.numPages>30){await task.destroy();throw new Error('Choose a PDF of 30 pages or fewer.');}for(let n=1;n<=doc.numPages;n++){const page=await doc.getPage(n);const content=await page.getTextContent();text+=content.items.map(item=>'str'in item?item.str:'').join(' ')+'\n';}await task.destroy();}
 else if(file.name.toLowerCase().endsWith('.txt'))text=new TextDecoder().decode(buffer);
 else throw new Error('Choose a PDF, DOCX or TXT document.');
 if(text.trim().length<40)throw new Error('No readable text found. Paste the text from a scanned document.');
 if(text.length>24000)throw new Error('Document is too long; paste the relevant sections (up to 24,000 characters).');return text.trim();
}
export async function downloadInterview(format:'pdf'|'docx',title:string,sections:{heading:string;text:string}[]){
 let blob:Blob;
 if(format==='docx'){const {Document,Packer,Paragraph,HeadingLevel}=await import('docx');const doc=new Document({sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1440,bottom:1440,left:1440,right:1440}}},children:[new Paragraph({text:title,heading:HeadingLevel.TITLE}),...sections.flatMap(s=>[new Paragraph({text:s.heading,heading:HeadingLevel.HEADING_1}),...s.text.split('\n').map(text=>new Paragraph({text}))])]}]});blob=await Packer.toBlob(doc);}
 else {const {jsPDF}=await import('jspdf');const doc=new jsPDF();let y=20;for(const section of [{heading:title,text:'Model answers are examples; personalize them with your own evidence.'},...sections]){doc.setFontSize(13);for(const line of doc.splitTextToSize(section.heading,170)){if(y>275){doc.addPage();y=20;}doc.text(line,20,y);y+=7;}doc.setFontSize(10);for(const line of doc.splitTextToSize(section.text,170)){if(y>275){doc.addPage();y=20;}doc.text(line,20,y);y+=5;}y+=6;}blob=doc.output('blob');}
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`interview-preparation.${format}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}