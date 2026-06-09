'use client';

import React, { useState } from 'react';
import { Lightbulb, Pencil, FlaskConical, Ruler, Search } from 'lucide-react';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';

interface NewsletterProps {
  className?: string;
}

export default function Newsletter({ className = '' }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
    setEmail('');
  };

  return (
    <section
      className={`relative select-none overflow-hidden border-t border-neutral-100 bg-[#faf6f0] px-6 py-20 sm:px-8 lg:px-12 ${className}`}
    >
      <div className="pointer-events-none absolute left-12 top-10 hidden -rotate-12 text-neutral-200/40 md:block">
        <Search className="h-12 w-12 stroke-[1]" aria-hidden />
      </div>

      <div className="pointer-events-none absolute left-1/4 top-24 hidden rotate-12 text-neutral-200/40 md:block">
        <FlaskConical className="h-12 w-12 stroke-[1]" aria-hidden />
      </div>

      <div className="pointer-events-none absolute bottom-8 left-20 hidden -rotate-6 text-neutral-200/40 md:block">
        <Lightbulb className="h-12 w-12 stroke-[1]" aria-hidden />
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/3 hidden rotate-45 text-neutral-200/40 md:block">
        <Pencil className="h-10 w-10 stroke-[1]" aria-hidden />
      </div>

      <div className="pointer-events-none absolute right-1/3 top-6 hidden -rotate-12 text-neutral-200/40 md:block">
        <Ruler className="h-12 w-12 stroke-[1]" aria-hidden />
      </div>

      <div className="pointer-events-none absolute right-1/4 top-20 hidden h-3.5 w-3.5 rounded-full border border-neutral-200/60 md:block" />
      <div className="pointer-events-none absolute bottom-16 right-1/3 hidden h-3 w-3 rounded-full border border-neutral-200/60 md:block" />
      <div className="pointer-events-none absolute right-20 top-1/2 hidden h-6 w-6 rounded-full border border-neutral-200/60 md:block" />
      <div className="pointer-events-none absolute bottom-24 right-1/4 hidden h-4 w-4 rounded-full border border-neutral-200/60 md:block" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center justify-center text-center">
        <h2
          className={`${discoverHeadline} mb-2.5 text-2xl tracking-tight text-[#131118] sm:text-3xl md:text-4xl`}
        >
          Subscribe our Newsletter &
        </h2>

        <p
          className={`${discoverBody} mb-8 max-w-xl text-[13px] leading-relaxed text-neutral-500 sm:text-sm md:text-base`}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing
        </p>

        <div className="w-full max-w-2xl">
          <form
            onSubmit={handleSubmit}
            className="relative flex flex-col items-center gap-2 rounded-xl border border-neutral-100/80 bg-white p-2 shadow-[0_15px_30px_rgba(0,0,0,0.03)] sm:flex-row sm:rounded-2xl"
          >
            <input
              type="email"
              required
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${discoverBody} w-full flex-1 bg-transparent px-4 py-3 text-sm text-[#131118] outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0 sm:py-4`}
            />

            <button
              type="submit"
              className={`${discoverMedium} w-full flex-shrink-0 cursor-pointer rounded-lg bg-[#1a3c34] px-8 py-3.5 text-sm tracking-wide text-white transition-all duration-200 hover:bg-[#15302a] active:scale-[0.98] sm:w-auto sm:py-4`}
            >
              {subscribed ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
