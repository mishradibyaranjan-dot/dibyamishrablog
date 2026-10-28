import { useRef, useState } from 'react';
import { Upload, FileCheck2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ResumeDocumentInput({ label, filename, busy, onFile }: {
  label: string; filename?: string; busy: boolean; onFile: (file: File | undefined) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return <div role="group" aria-label={`${label} drop area`}
    onDragOver={event => { event.preventDefault(); setDragging(true); }}
    onDragLeave={() => setDragging(false)}
    onDrop={event => { event.preventDefault(); setDragging(false); if (!busy) onFile(event.dataTransfer.files[0]); }}
    className={`flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-5 text-center transition-colors ${dragging ? 'border-primary bg-accent' : 'border-input bg-muted/30'}`}>
    {busy ? <Loader2 className="h-7 w-7 animate-spin text-primary motion-reduce:animate-none" /> : filename ? <FileCheck2 className="h-7 w-7 text-success" /> : <Upload className="h-7 w-7 text-primary" />}
    <p className="max-w-full break-words text-sm font-medium">{filename || `Upload ${label.toLowerCase()}`}</p>
    <input ref={input} aria-label={`Upload ${label.toLowerCase()}`} type="file" accept=".pdf,.docx,.txt" disabled={busy} className="sr-only"
      onChange={event => { onFile(event.target.files?.[0]); event.target.value = ''; }} />
    <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => input.current?.click()}>
      <Upload className="mr-2 h-4 w-4" />{filename ? 'Replace file' : 'Choose file'}
    </Button>
    <p className="text-xs text-muted-foreground">PDF, DOCX or TXT · up to 5 MB</p>
  </div>;
}