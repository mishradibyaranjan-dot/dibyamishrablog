import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Minus, Plus, FileText, Lock, RotateCcw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type PdfDoc = {
  numPages: number;
  getPage: (n: number) => Promise<{
    getViewport: (o: { scale: number }) => { width: number; height: number };
    render: (o: { canvasContext: CanvasRenderingContext2D; viewport: unknown; canvas: HTMLCanvasElement }) => { promise: Promise<void>; cancel: () => void };
  }>;
};

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

/**
 * Inline PDF reader for a Learn module. Streams the members-only PDF through
 * the authenticated /api/download/pdf endpoint, then renders pages to canvas
 * with a thumbnail rail and zoom controls.
 */
export function PdfViewer({ docKey, title }: { docKey: string; title: string }) {
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "auth" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setStatus("auth");
        return;
      }
      const res = await fetch(`/api/download/pdf?key=${encodeURIComponent(docKey)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setStatus("auth");
        return;
      }
      if (!res.ok) {
        setError(`Could not load the PDF (${res.status}).`);
        setStatus("error");
        return;
      }
      const buffer = await res.arrayBuffer();
      const pdfjs = await loadPdfjs();
      const loaded = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
      setDoc(loaded as unknown as PdfDoc);
      setPage(1);
      setStatus("ready");
    } catch (e) {
      setError((e as Error).message || "Could not load the PDF.");
      setStatus("error");
    }
  }, [docKey]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // Render the active page whenever page or zoom changes.
  useEffect(() => {
    if (!doc || !canvasRef.current) return;
    let cancelled = false;
    let task: { cancel: () => void } | null = null;
    (async () => {
      const p = await doc.getPage(page);
      const viewport = p.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const render = p.render({ canvasContext: ctx, viewport, canvas });
      task = render;
      await render.promise.catch(() => undefined);
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, page, scale]);

  if (status === "idle") {
    return (
      <div className="rounded-3xl border border-blue-200/70 bg-white p-6 text-center shadow-[0_20px_60px_-40px_rgba(37,99,235,0.4)]">
        <FileText className="mx-auto h-8 w-8 text-blue-600" />
        <h4 className="mt-3 font-display text-base font-bold text-slate-900">Read the full PDF: {title}</h4>
        <p className="mx-auto mt-1 max-w-xl text-sm text-slate-600">
          Open the source white paper inline — page thumbnails, page navigation and zoom controls included.
        </p>
        <Button className="mt-4" onClick={load}>
          Open PDF reader
        </Button>
      </div>
    );
  }

  if (status === "auth") {
    return (
      <div className="rounded-3xl border border-blue-200/70 bg-blue-50/60 p-6 text-center">
        <Lock className="mx-auto h-7 w-7 text-blue-600" />
        <h4 className="mt-3 font-display text-base font-bold text-slate-900">Members-only document</h4>
        <p className="mt-1 text-sm text-slate-600">Sign in to read “{title}” inline or download it from the Repository.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button asChild size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/repository">Repository</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-3xl border border-blue-200/70 bg-white p-10 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading PDF…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        {error}
        <div className="mt-3">
          <Button size="sm" variant="outline" onClick={load}>
            <RotateCcw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const total = doc?.numPages ?? 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-blue-200/70 bg-white shadow-[0_20px_60px_-40px_rgba(37,99,235,0.4)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-blue-50/60 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <FileText className="h-4 w-4 text-blue-600" />
          {title}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Prev
          </Button>
          <span className="text-xs text-slate-600">
            Page {page} / {total}
          </span>
          <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(total, p + 1))} disabled={page >= total}>
            Next
          </Button>
          <span className="mx-1 h-5 w-px bg-blue-200" />
          <Button size="icon" variant="outline" aria-label="Zoom out" onClick={() => setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(2)))}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs text-slate-600">{Math.round(scale * 100)}%</span>
          <Button size="icon" variant="outline" aria-label="Zoom in" onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-[168px_1fr]">
        <div className="max-h-[70vh] overflow-y-auto border-b border-blue-100 bg-slate-50 p-3 md:border-b-0 md:border-r">
          <div className="flex gap-3 md:flex-col">
            {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
              <Thumbnail key={n} doc={doc!} pageNumber={n} active={n === page} onSelect={() => setPage(n)} />
            ))}
          </div>
        </div>
        <div className="max-h-[70vh] overflow-auto bg-slate-100 p-4">
          <canvas ref={canvasRef} className="mx-auto max-w-none rounded-lg bg-white shadow" />
        </div>
      </div>
    </div>
  );
}

function Thumbnail({
  doc,
  pageNumber,
  active,
  onSelect,
}: {
  doc: PdfDoc;
  pageNumber: number;
  active: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await doc.getPage(pageNumber);
      const viewport = p.getViewport({ scale: 0.22 });
      const canvas = ref.current;
      if (!canvas || cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      await p.render({ canvasContext: ctx, viewport, canvas }).promise.catch(() => undefined);
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber]);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Go to page ${pageNumber}`}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-lg border p-1 transition ${
        active ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200 hover:border-blue-300"
      }`}
    >
      <canvas ref={ref} className="block rounded bg-white" />
      <span className="mt-1 block text-center text-[10px] text-slate-500">{pageNumber}</span>
    </button>
  );
}

export default PdfViewer;
