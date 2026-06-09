'use client';

import React from 'react';
import { discoverBody } from '@/components/LangingHome/landingTypography';

const PARTNER_LOGOS = [
  {
    name: 'Amazon',
    src: 'https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fpartners%2F1.png&w=128&q=75',
  },
  {
    name: 'AMD',
    src: 'https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fpartners%2F2.png&w=128&q=75',
  },
  {
    name: 'Cisco',
    src: 'https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fpartners%2F3.png&w=128&q=75',
  },
  {
    name: 'Dropcam',
    src: 'https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fpartners%2F4.png&w=128&q=75',
  },
  {
    name: 'Logitech',
    src: 'https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fpartners%2F5.png&w=128&q=75',
  },
  {
    name: 'Spotify',
    src: 'https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fpartners%2F6.png&w=128&q=75',
  },
] as const;

interface PartnersProps {
  className?: string;
}

export default function Partners({ className = '' }: PartnersProps) {
  return (
    <section
      className={`w-full select-none bg-white py-10 sm:py-14 ${className}`}
    >
      <div className="flex w-full flex-col items-center px-6 sm:px-8 lg:px-12 xl:px-16">
        <h3
          className={`${discoverBody} mb-8 text-center text-sm tracking-normal text-neutral-500 sm:mb-10 sm:text-base`}
        >
          Trusted by the world&apos;s best
        </h3>
      </div>

      <div className="grid w-full grid-cols-3 items-center gap-x-4 gap-y-6 px-4 opacity-80 transition-opacity duration-300 hover:opacity-100 sm:grid-cols-6 sm:gap-x-6 sm:px-8 md:px-12 lg:px-16">
        {PARTNER_LOGOS.map((partner) => (
          <div
            key={partner.name}
            className="flex h-5 items-center justify-center grayscale transition-all duration-300 hover:grayscale-0 sm:h-6"
          >
            <img
              src={partner.src}
              alt={`${partner.name} logo`}
              className="h-3.5 w-auto max-w-[64px] object-contain sm:h-4 sm:max-w-[72px]"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
