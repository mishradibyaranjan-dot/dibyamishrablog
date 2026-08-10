import { SITE_ORIGIN } from "@/lib/og-images";
import { legalConfig } from "@/lib/legal-config";

/**
 * Organization + WebSite + LegalPage JSON-LD graph for footer legal pages
 * (Privacy Notice, Copyright & Content Use, Terms of Use).
 */
export function legalPageJsonLd(opts: {
  name: string;
  path: string;
  description: string;
  datePublished?: string;
}) {
  const url = `${SITE_ORIGIN}${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_ORIGIN}/#organization`,
        name: legalConfig.ownerName,
        alternateName: "Dibya Ranjan Mishra",
        url: SITE_ORIGIN,
        email: legalConfig.privacyContactEmail,
        address: { "@type": "PostalAddress", addressCountry: legalConfig.country },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "legal",
            email: legalConfig.copyrightContactEmail,
            availableLanguage: ["English", "Hindi"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        url: SITE_ORIGIN,
        name: legalConfig.websiteName,
        publisher: { "@id": `${SITE_ORIGIN}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "LegalPage",
        "@id": `${url}#legalpage`,
        url,
        name: opts.name,
        headline: opts.name,
        description: opts.description,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
        publisher: { "@id": `${SITE_ORIGIN}/#organization` },
        copyrightHolder: { "@id": `${SITE_ORIGIN}/#organization` },
        copyrightYear: legalConfig.copyrightStartYear,
        ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
      },
    ],
  };
}

/** Convenience: a `scripts` entry ready to spread into a route head(). */
export function legalPageScript(opts: Parameters<typeof legalPageJsonLd>[0]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(legalPageJsonLd(opts)),
  };
}
