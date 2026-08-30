import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  ScriptOnce,

} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteLayout } from "../components/layout/SiteLayout";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "8EO0An2G722tBY4Ux1AdMj7joxlF1vZkZcCy9qCwXs4" },
      { name: "google-site-verification", content: "zSv7Z_xrt_XkQYkl7c2EuLjbzO5inNSKvdq-3-ftVvY" },
      { name: "google-adsense-account", content: "ca-pub-8723914555454401" },
      { name: "sentinel-qa-verification", content: "sentinel-verify-50780e02e739435aaec6a464" },



      { name: "author", content: "Dibya Ranjan Mishra" },
      { property: "og:site_name", content: "Dibya Ranjan Mishra" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },

    ],

    links: [
      { rel: "stylesheet", href: appCss },
      // Dyslexia-friendly face, only fetched when a visitor picks that option's
      // family (the stylesheet is tiny and cached; the font itself is lazy).
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap",
      },
      // Fonts are self-hosted (see src/styles.css @font-face). Preload only the
      // two faces used above the fold so the hero heading paints immediately.
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/space-grotesk.woff2",
        crossOrigin: "anonymous",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/dm-sans.woff2",
        crossOrigin: "anonymous",
        fetchPriority: "high",
      },

      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "Dibya Ranjan Mishra — Blog & Research (RSS)",
        href: "https://www.dibyamishra.co.in/rss.xml",
      },
      {
        rel: "alternate",
        type: "application/atom+xml",
        title: "Dibya Ranjan Mishra — Blog & Research (Atom)",
        href: "https://www.dibyamishra.co.in/atom.xml",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.dibyamishra.co.in/#organization",
              name: "Dibya Ranjan Mishra",
              url: "https://www.dibyamishra.co.in",
              description:
                "Advisory and engineering leadership on AI, Agentic AI, cloud-native platforms, SaaS architecture and delivery transformation.",
              founder: { "@type": "Person", name: "Dibya Ranjan Mishra" },
              sameAs: [
                "https://www.linkedin.com/in/dibya-mishra-55b94654",
                "https://github.com/mishradibyaranjan-dot/",
              ],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  contactType: "business enquiries",
                  email: "contactme@dibyamishra.co.in",
                  availableLanguage: ["English", "Hindi"],
                },
              ],
            },
            {
              "@type": "WebSite",
              "@id": "https://www.dibyamishra.co.in/#website",
              url: "https://www.dibyamishra.co.in",
              name: "Dibya Ranjan Mishra",
              publisher: { "@id": "https://www.dibyamishra.co.in/#organization" },
              inLanguage: "en",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://www.dibyamishra.co.in/research?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/**
 * Applies the visitor's saved theme before first paint so switching to a
 * light palette (Daylight, Paper, Sand, Arctic) doesn't flash the dark default.
 */
const THEME_BOOTSTRAP = `(function(){try{
var t=localStorage.getItem('drm-theme');
var all=['glacier','cinematic','midnight','aurora','sunset','noir','emerald','light','paper','sand','arctic'];
if(all.indexOf(t)<0)return;
var light=['glacier','light','paper','sand','arctic'];
var m=light.indexOf(t)>=0?'light':'dark';
var r=document.documentElement;
r.dataset.theme=t;r.classList.toggle('dark',m==='dark');r.style.colorScheme=m;
}catch(e){}})();`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="glacier"
      className="light"
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >

      <head>
        <HeadContent />
        <ScriptOnce>{THEME_BOOTSTRAP}</ScriptOnce>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}


function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SiteLayout />
    </QueryClientProvider>
  );
}
