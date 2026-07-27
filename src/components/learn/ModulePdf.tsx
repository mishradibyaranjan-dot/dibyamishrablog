import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

const PdfViewer = lazy(() =>
  import("./PdfViewer").then((m) => ({ default: m.PdfViewer })),
);

const Fallback = (
  <div className="flex items-center justify-center gap-2 rounded-3xl border border-blue-200/70 bg-white p-10 text-sm text-slate-600">
    <Loader2 className="h-4 w-4 animate-spin" /> Preparing reader…
  </div>
);

/** SSR-safe wrapper: pdf.js is browser-only, so it loads after hydration. */
export function ModulePdf({ docKey, title }: { docKey: string; title: string }) {
  return (
    <ClientOnly fallback={Fallback}>
      <Suspense fallback={Fallback}>
        <PdfViewer docKey={docKey} title={title} />
      </Suspense>
    </ClientOnly>
  );
}

export default ModulePdf;
