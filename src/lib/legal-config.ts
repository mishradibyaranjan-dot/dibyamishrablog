/**
 * Single source of truth for copyright / privacy wording across the site.
 * Reuse this file on other projects by editing only the values below.
 */
export const legalConfig = {
  ownerName: "DIAA IT Solutions Pvt Ltd",
  websiteName: "dibyamishra.co.in",
  copyrightStartYear: 2026,
  copyrightContactEmail: "dibya.mishra@diaaitsolutions.com",
  privacyContactEmail: "dibya.mishra@diaaitsolutions.com",
  country: "India",
  privacyUrl: "/privacy",
  copyrightUrl: "/copyright",
  contactUrl: "/contact",
} as const;

/** "© 2024–2026 Owner. All Rights Reserved." — year is always current. */
export function copyrightLine(): string {
  const currentYear = new Date().getFullYear();
  const start = legalConfig.copyrightStartYear;
  const years = start && start !== currentYear ? `${start}–${currentYear}` : `${currentYear}`;
  return `© ${years} ${legalConfig.ownerName}. All Rights Reserved.`;
}

export const RESTRICTED_USE_LINE =
  "Unauthorized reproduction, republication or commercial redistribution of original website content without permission is prohibited.";
