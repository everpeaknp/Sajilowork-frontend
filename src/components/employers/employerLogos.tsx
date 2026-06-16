'use client';

import { resolveEmployerLogoLabel } from '@/lib/employerAvatarUtils';

export function renderCompanyLogo(logoKey: string, name: string) {
  const baseClass = 'h-12 w-12 shrink-0 select-none overflow-hidden rounded-full shadow-sm';

  switch (logoKey) {
    case 'monkey-face':
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <rect width="100%" height="100%" fill="#4F46E5" />
          <circle cx="50" cy="50" r="30" fill="white" fillOpacity="0.15" />
          <path
            d="M 35 45 A 6 6 0 1 1 47 45 M 53 45 A 6 6 0 1 1 65 45"
            stroke="white"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 38 62 C 42 70, 58 70, 62 62"
            stroke="white"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case 'wave-s':
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <rect width="100%" height="100%" fill="#1E293B" />
          <path d="M30,50 Q40,30 50,50 T70,50" fill="none" stroke="#22D3EE" strokeWidth="6" strokeLinecap="round" />
          <path
            d="M30,60 Q40,40 50,60 T70,60"
            fill="none"
            stroke="#06B6D4"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      );
    case 'cursive-in':
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <rect width="100%" height="100%" fill="#EC4899" />
          <text x="50" y="62" fill="white" fontSize="36" fontWeight="bold" fontFamily="serif" textAnchor="middle">
            in
          </text>
        </svg>
      );
    case 'linked-loops':
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <rect width="100%" height="100%" fill="#9D174D" />
          <circle cx="50" cy="50" r="18" stroke="white" strokeWidth="4" fill="none" />
          <circle cx="38" cy="50" r="12" stroke="white" strokeWidth="3" strokeOpacity="0.8" fill="none" />
          <circle cx="62" cy="50" r="12" stroke="white" strokeWidth="3" strokeOpacity="0.8" fill="none" />
        </svg>
      );
    case 'retro-grid':
      return (
        <svg viewBox="0 0 100 100" className={`${baseClass} border border-neutral-200 bg-white`}>
          <rect width="100%" height="100%" fill="white" />
          <circle cx="50" cy="50" r="24" fill="#FEE2E2" />
          <circle cx="50" cy="38" r="8" fill="#EF4444" />
          <circle cx="50" cy="62" r="8" fill="#EF4444" />
          <circle cx="38" cy="50" r="8" fill="#EF4444" />
          <circle cx="62" cy="50" r="8" fill="#EF4444" />
          <circle cx="50" cy="50" r="6" fill="#FFFFFF" />
        </svg>
      );
    case 'serif-m':
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <rect width="100%" height="100%" fill="#111111" />
          <text x="50" y="65" fill="white" fontSize="42" fontWeight="900" fontFamily="serif" textAnchor="middle">
            M
          </text>
        </svg>
      );
    case 'cursive-u':
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <rect width="100%" height="100%" fill="#F3E8FF" />
          <path
            d="M35 35 V55 C35 65, 50 68, 50 55 V35 H58 V55 C58 68, 65 72, 72 62"
            stroke="#A855F7"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case 'figma-icon':
      return (
        <svg viewBox="0 0 100 100" className={`${baseClass} border border-neutral-200 bg-white`}>
          <g transform="translate(35, 20)">
            <path d="M-10 10a10 10 0 0 1 10-10h10v20h-10a10 10 0 0 1-10-10z" fill="#F24E1E" />
            <path
              d="M10 10a10 10 0 0 1 10 10v10h-10A10 10 0 0 1 10 10z"
              fill="#18A0FB"
              transform="rotate(180 15 20)"
            />
            <path d="M-10 30a10 10 0 0 1 10-10h10v20h-10a10 10 0 0 1-10-10z" fill="#A259FF" />
            <circle cx="10" cy="30" r="10" fill="#18A0FB" />
            <path d="M-10 50a10 10 0 0 1 10-10h10v10a10 10 0 0 1-10 10 10 10 0 0 1-10-10z" fill="#0ACF83" />
          </g>
        </svg>
      );
    case 'slack-icon':
      return (
        <svg viewBox="0 0 100 100" className={`${baseClass} border border-neutral-200 bg-white`}>
          <rect width="100%" height="100%" fill="white" />
          <g transform="translate(20, 20) scale(0.6)">
            <circle cx="20" cy="20" r="10" fill="#36C5F0" />
            <rect x="20" y="10" width="30" height="20" rx="10" fill="#36C5F0" />
            <circle cx="80" cy="20" r="10" fill="#2EB67D" />
            <rect x="70" y="20" width="20" height="30" rx="10" fill="#2EB67D" />
            <circle cx="80" cy="80" r="10" fill="#ECB22E" />
            <rect x="50" y="70" width="30" height="20" rx="10" fill="#ECB22E" />
            <circle cx="20" cy="80" r="10" fill="#E01E5A" />
            <rect x="10" y="50" width="20" height="30" rx="10" fill="#E01E5A" />
          </g>
        </svg>
      );
    case 'airbnb-icon':
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <rect width="100%" height="100%" fill="#FF5A5F" />
          <path
            d="M50 25 C45 25 35 48 35 55 C35 65 42 70 50 70 C58 70 65 65 65 55 C65 48 55 25 50 25 Z"
            fill="none"
            stroke="white"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="52" r="5" fill="white" />
        </svg>
      );
    case 'stripe-icon':
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <rect width="100%" height="100%" fill="#635BFF" />
          <text
            x="50"
            y="66"
            fill="white"
            fontSize="48"
            fontWeight="900"
            fontStyle="italic"
            fontFamily="sans-serif"
            textAnchor="middle"
          >
            S
          </text>
        </svg>
      );
    case 'shopify-icon':
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <rect width="100%" height="100%" fill="#96BF48" />
          <path
            d="M35 35 L40 23 H60 L65 35 H75 V75 H25 V35 Z"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="50" y="58" fill="white" fontSize="24" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
            s
          </text>
        </svg>
      );
    case 'zoom-icon':
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <rect width="100%" height="100%" fill="#2D8CFF" />
          <rect x="25" y="35" width="30" height="28" rx="6" fill="white" />
          <polygon points="58,40 75,30 75,68 58,58" fill="white" />
        </svg>
      );
    case 'spotify-icon':
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <rect width="100%" height="100%" fill="#191414" />
          <path d="M30 40 Q50 30 70 40" stroke="#1DB954" strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <path d="M34 52 Q50 43 66 52" stroke="#1DB954" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <path d="M38 64 Q50 56 62 64" stroke="#1DB954" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'brand-google':
      return (
        <svg viewBox="0 0 100 100" className={`${baseClass} border border-neutral-200 bg-white`}>
          <text x="50" y="66" fill="#4285F4" fontSize="48" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            G
          </text>
        </svg>
      );
    case 'notion-icon':
      return (
        <svg viewBox="0 0 100 100" className={`${baseClass} border border-neutral-200 bg-white`}>
          <rect width="100%" height="100%" fill="white" />
          <text x="50" y="66" fill="#111111" fontSize="46" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            N
          </text>
        </svg>
      );
    default:
      return (
        <div className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-full bg-slate-700 text-base font-bold uppercase text-white shadow-sm">
          {name.substring(0, 2)}
        </div>
      );
  }
}

/** Business logo for employer profile listing rows (projects/jobs). Prefers uploaded logo URL. */
export function renderEmployerBrandLogo(
  logoColor: string,
  name: string,
  logoUrl?: string,
  logoText?: string,
) {
  const baseClass = 'h-12 w-12 shrink-0 select-none overflow-hidden rounded-full shadow-sm';
  const resolvedUrl = logoUrl?.trim();

  if (resolvedUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={resolvedUrl} alt="" className={`${baseClass} object-cover`} />
    );
  }

  const demoLogoKeys = new Set([
    'monkey-face',
    'wave-s',
    'cursive-in',
    'linked-loops',
    'retro-grid',
    'cursive-u',
    'figma-icon',
    'slack-icon',
    'airbnb-icon',
    'stripe-icon',
    'shopify-icon',
    'zoom-icon',
    'spotify-icon',
    'brand-google',
    'notion-icon',
  ]);

  if (logoColor === 'serif-m' || !demoLogoKeys.has(logoColor)) {
    const label = resolveEmployerLogoLabel(name, logoText);
    return (
      <div
        className={`${baseClass} flex items-center justify-center bg-neutral-950 font-serif text-lg font-black text-white`}
      >
        {label.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return renderCompanyLogo(logoColor, name);
}

export function GreenSparkSparkle() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className="flex-shrink-0 cursor-pointer text-emerald-500 transition-transform hover:scale-110"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
      <path
        d="M12 4V20M4 12H20M6.34 6.34L17.66 17.66M6.34 17.66L17.66 6.34"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
