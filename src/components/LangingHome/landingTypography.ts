/**
 * Typography tokens for marketing pages (home, discover).
 * — PP Formula / Outfit: display headlines (Outfit via next/font when PP Formula files are absent)
 * — Manrope: body, labels, UI (via root layout --font-manrope)
 */

/** Large section titles, hero headline, card titles */
export const landingHeadline =
  "font-formula font-black tracking-tight";

/** Smaller display lines (stats, badges, uppercase labels on dark bands) */
export const landingHeadlineSm =
  "font-formula font-extrabold tracking-tight";

/** Body copy, descriptions, buttons (Manrope from root layout) */
export const landingBody = "font-body";

/** Muted body / captions */
export const landingBodyMuted =
  "font-body text-[#6a719a] font-medium dark:text-neutral-400";

/** Root wrapper for marketing pages (home, discover) */
export const landingPageRoot =
  "landing-page font-body antialiased";

/** Inherited Manrope body + Formula/Outfit on semantic headings */
export const landingPageTypo =
  `${landingBody} [&_h1]:font-formula [&_h1]:font-black [&_h1]:tracking-tight [&_h2]:font-formula [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h3]:font-formula [&_h3]:font-bold [&_h3]:tracking-tight [&_h4]:font-formula [&_h4]:font-semibold [&_h4]:tracking-tight`;

/** Discover page — DM Sans (matches mockup __DM_Sans_88fdc4), moderate weights */
export const discoverDmSans = "__DM_Sans_88fdc4";

export const discoverHeadline = `${discoverDmSans} font-semibold tracking-tight`;

export const discoverBody = `${discoverDmSans} font-normal`;

export const discoverMedium = `${discoverDmSans} font-medium`;

export const discoverPageRoot = `${discoverDmSans} discover-page antialiased`;

export const discoverPageTypo =
  `${discoverBody} [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-medium [&_h4]:font-medium`;
