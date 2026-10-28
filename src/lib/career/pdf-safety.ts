import { PDFArray, PDFDict, PDFDocument, PDFName, PDFObject, PDFStream } from 'pdf-lib';

/** Inspect parsed objects, never compressed stream bytes; this is not malware scanning. */
export async function validatePdfStructure(bytes: Uint8Array) {
  let document: PDFDocument;
  try {
    document = await PDFDocument.load(bytes, { updateMetadata: false, throwOnInvalidObject: true });
    if (document.getPageCount() === 0) throw new Error('Missing PDF pages');
  } catch {
    throw new Error('The PDF is corrupt, encrypted or unreadable.');
  }
  const visited = new Set<PDFObject>();
  const unsafe = () => { throw new Error('Active or embedded PDF content is not accepted.'); };
  const inspect = (object: PDFObject) => {
    const value = document.context.lookup(object);
    if (!value || visited.has(value)) return;
    visited.add(value);
    if (value instanceof PDFStream) { inspect(value.dict); return; }
    if (value instanceof PDFArray) { for (const item of value.asArray()) inspect(item); return; }
    if (!(value instanceof PDFDict)) return;
    const type = value.lookup(PDFName.of('Type'));
    const action = value.lookup(PDFName.of('S'));
    if (type instanceof PDFName && type.decodeText() === 'EmbeddedFile') unsafe();
    if (action instanceof PDFName && ['JavaScript', 'Launch', 'GoToR', 'GoToE', 'SubmitForm', 'ImportData', 'Rendition', 'Movie', 'Sound'].includes(action.decodeText())) unsafe();
    for (const [key, child] of value.entries()) {
      const name = key.decodeText();
      if (['JavaScript', 'JS', 'EmbeddedFile', 'EmbeddedFiles', 'AA'].includes(name)) unsafe();
      // Local initial-view destinations (LaTeX/LibreOffice) are not executable actions.
      if (name === 'OpenAction') {
        const target = document.context.lookup(child);
        if (target instanceof PDFDict) {
          const kind = target.lookup(PDFName.of('S'));
          if (!(kind instanceof PDFName) || kind.decodeText() !== 'GoTo') unsafe();
        }
      }
      inspect(child);
    }
  };
  for (const [, object] of document.context.enumerateIndirectObjects()) inspect(object);
}