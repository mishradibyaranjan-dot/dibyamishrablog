import { SITE_ORIGIN } from "@/lib/og-images";

export type Crumb = { name: string; path: string };

/** Build a schema.org BreadcrumbList JSON-LD object. Include Home as the first crumb. */
export function breadcrumbJsonLd(crumbs: Crumb[]) {
  const items = [{ name: "Home", path: "/" }, ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_ORIGIN}${c.path === "/" ? "" : c.path}`,
    })),
  };
}

/** Convenience: returns a `scripts` entry ready to spread into head(). */
export function breadcrumbScript(crumbs: Crumb[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(breadcrumbJsonLd(crumbs)),
  };
}
