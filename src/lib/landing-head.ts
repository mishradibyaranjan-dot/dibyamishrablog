import { pageOgImages, SITE_ORIGIN } from "@/lib/og-images";
import { breadcrumbScript } from "@/lib/breadcrumbs";
import type { LandingPageContent } from "@/lib/landing-pages";

/** Shared head() config for the SEO landing pages. */
export function landingHead(page: LandingPageContent) {
  const url = `${SITE_ORIGIN}/${page.slug}`;
  const image = pageOgImages.research;
  return {
    meta: [
      { title: page.metaTitle },
      { name: "description", content: page.metaDescription },
      { property: "og:title", content: page.metaTitle },
      { property: "og:description", content: page.metaDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: page.metaTitle },
      { name: "twitter:description", content: page.metaDescription },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.title,
          description: page.metaDescription,
          url,
          author: { "@type": "Person", name: "Dibya Ranjan Mishra", url: `${SITE_ORIGIN}/about` },
          about: page.eyebrow,
        }),
      },
      breadcrumbScript([
        { name: "Advisory", path: "/advisory" },
        { name: page.eyebrow, path: `/${page.slug}` },
      ]),
    ],
  };
}
