import JSZip from 'jszip';
import type { ResumeTemplate } from './schema';

export async function createCareerDocument(format:'docx'|'pptx',text:string,template:ResumeTemplate):Promise<Blob>{
 if(!text.trim())throw new Error('The approved resume is empty.');
 let blob:Blob;
 const font=template==='Executive Leadership'?'Georgia':'Arial';
 if(format==='docx'){
  const {Document,Packer,Paragraph,HeadingLevel}=await import('docx');
  const lines=text.split('\n');
  const doc=new Document({creator:'Career Assistant',title:'Approved resume',styles:{default:{document:{run:{font,size:22},paragraph:{spacing:{after:100}}}}},sections:[{properties:{page:{margin:{top:1080,bottom:1080,left:1080,right:1080}}},children:lines.map((line,i)=>new Paragraph({text:line,...(i===0?{heading:HeadingLevel.TITLE}:{}),spacing:{after:template==='Modern Professional'?140:100}}))}]});
  blob=await Packer.toBlob(doc);
  const zip=await JSZip.loadAsync(await blob.arrayBuffer(),{checkCRC32:true});const xml=await zip.file('word/document.xml')?.async('string');if(!xml||!xml.includes('<w:t'))throw new Error('Word document validation failed.');
 }else{
  const {default:PptxGenJS}=await import('pptxgenjs');const pptx=new PptxGenJS();pptx.layout='LAYOUT_WIDE';pptx.author='Career Assistant';pptx.subject='Approved career profile';pptx.title='Approved career profile';
  // Presentation colors belong to the approved document template, not app theme styling.
  pptx.theme={headFontFace:font,bodyFontFace:'Arial'};
  const lines=text.split('\n');const chunks:string[][]=[];let current:string[]=[];let chars=0;
  for(const line of lines){for(let start=0;start<Math.max(1,line.length);start+=100){const segment=line.slice(start,start+100);if(current.length>=14||chars+segment.length>1100){chunks.push(current);current=[];chars=0;}current.push(segment);chars+=segment.length;}}
  if(current.length)chunks.push(current);
  for(const [i,chunk] of chunks.entries()){
   const slide=pptx.addSlide();slide.addText(i===0?'Candidate profile':`Career profile · ${i+1}`,{x:0.6,y:0.4,w:12.1,h:0.65,fontSize:26,fontFace:font,bold:true,margin:0});
   slide.addText(chunk.join('\n'),{x:0.6,y:1.35,w:12.1,h:5.2,fontSize:18,fontFace:'Arial',margin:0,breakLine:false,fit:'resize',paraSpaceAfter:7});
   slide.addText(`${template} · approved factual version · ${i+1}/${chunks.length}`,{x:0.6,y:7,w:12.1,h:0.2,fontSize:9,margin:0});
  }
  const output=await pptx.write({outputType:'blob'});if(!(output instanceof Blob))throw new Error('PowerPoint creation failed.');blob=output;
  const zip=await JSZip.loadAsync(await blob.arrayBuffer(),{checkCRC32:true});if(!zip.file('ppt/presentation.xml')||!zip.file('ppt/slides/slide1.xml'))throw new Error('PowerPoint validation failed.');
 }
 if(blob.size===0)throw new Error('Document creation failed.');return blob;
}
export function downloadCareerBlob(blob:Blob,filename:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}