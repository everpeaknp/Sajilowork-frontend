import { DM_Sans, Manrope, Outfit } from 'next/font/google';

/** Primary body font — preloaded for LCP text. */
export const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

/** Marketing / display headlines. */
export const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
});

/** Discover page accent font. */
export const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
});

export const fontClassNames = `${manrope.variable} ${outfit.variable} ${dmSans.variable}`;
