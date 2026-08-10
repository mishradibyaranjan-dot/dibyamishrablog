import { SITE_ORIGIN } from "@/lib/og-images";
import { legalConfig } from "@/lib/legal-config";

/**
 * Organization + WebSite + LegalPage JSON-LD graph for the footer legal pages
 * (Privacy Notice, Copyright & Content Use, Terms of Use, Trust & Privacy).
 *
 * Every legal page is registered below so the emitted `@type`, canonical `url`
 * and cross-links between the pages stay consistent site-wide.
 */
export type LegalPageId = "privacy" | "copyright" | "terms" | "trust";

type LegalPageDef = {
  path: string;
  name: string;
  /** Specific schema.org type layered on top of the generic LegalPage/WebPage. */
  additionalType: string;
};

export const LEGAL_PAGES: Record<LegalPageId, LegalPageDef> = {
  privacy: {
    path: "/privacy",
    name: "Privacy Notice",
    additionalType: "https://schema.org/PrivacyPolicy",
  },
  copyright: {
    path: "/copyright",
    name: "Copyright & Content Use",
    additionalType: "https://schema.org/CreativeWork",
  },
  terms: {
    path: "/terms",
    name: "Terms of Use",
    additionalType: "https://schema.org/TermsOfService",
  },
  trust: {
    path: "/trust",
    name: "Trust & Privacy",
    additionalType: "https://schema.org/AboutPage",
  },
};

export function legalPageUrl(id: LegalPageId) {
  return `${SITE_ORIGIN}${LEGAL_PAGES[id].path}`;
}

function organizationNode() {
  return {
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
      {
        "@type": "ContactPoint",
        contactType: "privacy",
        email: legalConfig.privacyContactEmail,
        availableLanguage: ["English"],
      },
    ],
  };
}

function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    url: SITE_ORIGIN,
    name: legalConfig.websiteName,
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    inLanguage: "en",
  };
}

export function legalPageJsonLd(opts: {
  /** Registered legal page id — drives type, canonical URL and cross-links. */
  id?: LegalPageId;
  name?: string;
  path?: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
}) {
  const def = opts.id ? LEGAL_PAGES[opts.id] : undefined;
  const path = def?.path ?? opts.path ?? "/";
  const name = def?.name ?? opts.name ?? legalConfig.websiteName;
  const url = `${SITE_ORIGIN}${path}`;
  const siblings = (Object.keys(LEGAL_PAGES) as LegalPageId[])
    .filter((k) => LEGAL_PAGES[k].path !== path)
    .map((k) => `${SITE_ORIGIN}${LEGAL_PAGES[k].path}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      websiteNode(),
      {
        "@type": "LegalPage",
        "@id": `${url}#legalpage`,
        ...(def ? { additionalType: def.additionalType } : {}),
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        name,
        headline: name,
        description: opts.description,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
        publisher: { "@id": `${SITE_ORIGIN}/#organization` },
        copyrightHolder: { "@id": `${SITE_ORIGIN}/#organization` },
        copyrightYear: legalConfig.copyrightStartYear,
        ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
        ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
        ...(siblings.length ? { relatedLink: siblings } : {}),
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
