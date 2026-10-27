import JSZip from 'jszip';

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export async function validatePrivateFile(file: File) {
  if (!file.size || file.size > MAX_RESUME_BYTES) throw new Error('Choose a nonempty document of 5 MB or smaller.');
  const extension = file.name.split('.').pop()?.toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const prefix = new TextDecoder().decode(bytes.slice(0, 8));
  if (extension === 'pdf') {
    if (!prefix.startsWith('%PDF-')) throw new Error('The file is not a valid PDF.');
    const raw = new TextDecoder('latin1').decode(bytes);
    if (/\/(JavaScript|JS|Launch|EmbeddedFile|OpenAction|AA)\b/.test(raw)) throw new Error('Active or embedded PDF content is not accepted.');
  } else if (extension === 'docx') {
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) throw new Error('The file is not a valid Word document.');
    let zip: JSZip;
    try { zip = await JSZip.loadAsync(bytes, { checkCRC32: true }); } catch { throw new Error('The Word document is corrupt or unreadable.'); }
    const entries = Object.values(zip.files);
    if (entries.length > 400 || !zip.file('word/document.xml') || !zip.file('[Content_Types].xml')) throw new Error('Unsupported Word document structure.');
    let total = 0;
    for (const entry of entries) {
      if (/vbaProject|embeddings\/|activeX\/|\.exe$|\.bin$/i.test(entry.name)) throw new Error('Macros and embedded objects are not accepted.');
      if (entry.dir) continue;
      const content = await entry.async('uint8array');
      total += content.length;
      if (total > 20 * 1024 * 1024) throw new Error('Expanded Word document exceeds safe limits.');
      if (entry.name.endsWith('.rels') && /TargetMode=["']External["']/i.test(new TextDecoder().decode(content))) {
        const rel = new TextDecoder().decode(content);
        if (/Type=["'][^"']*(?:attachedTemplate|oleObject|image)["']/i.test(rel)) throw new Error('Externally loaded objects are not accepted.');
      }
    }
  } else if (extension === 'txt') {
    if (bytes.includes(0)) throw new Error('Binary content is not accepted as text.');
    try { new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { throw new Error('Choose UTF-8 plain text.'); }
  } else throw new Error('Choose PDF, DOCX or TXT.');
  return extension as 'pdf' | 'docx' | 'txt';
}