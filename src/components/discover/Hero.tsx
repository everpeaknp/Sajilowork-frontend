'use client';

import React, { useState } from 'react';
import { ArrowRight, Search, ChevronDown } from 'lucide-react';
import { landingHeadline, landingHeadlineSm } from '@/components/LangingHome/landingTypography';

interface HeroProps {
  onPostWithTitle: (title: string) => void;
}

export default function Hero({ onPostWithTitle }: HeroProps) {
  const [inputValue, setInputValue] = useState('');
  const [showInspirationMenu, setShowInspirationMenu] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onPostWithTitle(inputValue.trim());
    } else {
      onPostWithTitle('General task help requested');
    }
  };

  const quickPills = [
    { title: 'Help me move home', query: 'Help me move home and pack furniture' },
    { title: 'End of lease cleaning', query: 'End of lease deep cleaning' },
    { title: 'Fix my washing machine', query: 'Fix my washing machine motor issue' },
    { title: 'Mow my backyard', query: 'Mow my backyard and trim edges' },
  ];

  const inspirationPills = [
    'Mount TV to brick wall',
    'Assemble IKEA Pax wardrobe',
    'Resume copywriting assistance',
    'Database cleaning help',
    'Pet sitting & walking',
    'Local grocery delivery',
  ];

  return (
    <div className="w-full">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#005fff] via-[#0047ff] to-[#03113c] py-10 text-left text-white shadow-md transition-all duration-300 sm:py-16 md:py-24">
        {/* Decorative background visual ambient circles and polygons */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-400 via-indigo-500 to-transparent opacity-20" />
        <div className="pointer-events-none absolute top-1/4 right-0 hidden h-48 w-48 rounded-full bg-cyan-400 opacity-10 mix-blend-screen blur-3xl filter animate-pulse sm:block sm:h-64 sm:w-64" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-blue-500 opacity-15 mix-blend-screen blur-3xl filter sm:h-72 sm:w-72" />

        {/* Main Wrapper content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Core Headline */}
          <div className="max-w-3xl space-y-4">
            <h1
              className={`${landingHeadline} text-[1.75rem] leading-[1.1] text-white drop-shadow-sm text-balance sm:text-4xl md:text-5xl lg:text-6xl`}
            >
              Post a task. Get it done.
            </h1>
            <p className="max-w-lg text-sm leading-relaxed font-medium text-blue-100 sm:text-base">
              Connect with certified, friendly local taskers ready to help you with furniture,
              moving, repairs, deep cleaning, and more.
            </p>
          </div>

          {/* Input Form Box container */}
          <form
            onSubmit={handleFormSubmit}
            className="mt-6 flex max-w-5xl flex-col items-stretch gap-2.5 rounded-2xl border border-white/10 bg-white p-2 shadow-xl sm:mt-10 sm:flex-row sm:items-center sm:gap-3 sm:p-3.5"
          >
            {/* Main prompt text input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 sm:left-4" />
              <input
                type="text"
                placeholder="In a few words, what do you need done?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="min-h-12 w-full rounded-xl border-none py-3 pl-11 pr-3 text-base font-medium text-[#03113c] placeholder-gray-400 focus:outline-none focus:ring-0 sm:pl-12 sm:text-base"
              />
            </div>

            <button
              type="submit"
              className="inline-flex min-h-12 w-full shrink-0 cursor-pointer select-none items-center justify-center space-x-2 rounded-xl bg-[#03113c] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition duration-200 active:scale-95 hover:bg-black sm:w-auto sm:text-base"
            >
              <span>Get Offers</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </form>

          {/* Quick assistance suggestion triggers */}
          <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-2.5">
            {quickPills.map((pill) => (
              <button
                key={pill.title}
                type="button"
                onClick={() => onPostWithTitle(pill.query)}
                className="flex min-h-9 max-w-full cursor-pointer items-center space-x-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-left text-xs font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-95 sm:px-3.5 sm:py-1.5"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-300" />
                <span>{pill.title}</span>
              </button>
            ))}

            {/* More inspiration popover activator */}
            <div
              className={`relative w-full sm:w-auto ${showInspirationMenu ? 'z-50' : ''}`}
            >
              <button
                type="button"
                onClick={() => setShowInspirationMenu(!showInspirationMenu)}
                aria-expanded={showInspirationMenu}
                className="flex min-h-9 w-full cursor-pointer items-center justify-center space-x-1 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-95 sm:w-auto sm:py-1.5"
              >
                <span>More inspiration</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${showInspirationMenu ? 'rotate-180' : ''}`}
                />
              </button>

              {showInspirationMenu && (
                <div className="absolute left-0 top-full z-50 mt-2 w-[min(100vw-2rem,16rem)] rounded-xl border border-white/10 bg-[#03113c] p-2 text-left shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 sm:w-64">
                  <span
                    className={`${landingHeadlineSm} text-[10px] text-blue-400 tracking-wider block p-2 uppercase`}
                  >
                    Popular Ideas:
                  </span>
                  <div className="space-y-0.5 max-h-48 overflow-y-auto">
                    {inspirationPills.map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => {
                          setShowInspirationMenu(false);
                          onPostWithTitle(idea);
                        }}
                        className="w-full text-left rounded-lg p-2 text-xs font-medium text-gray-200 hover:bg-white/10 hover:text-white transition cursor-pointer"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

