'use client';

import React, { useState } from 'react';
import { ArrowRight, Search, ChevronDown, Ban } from 'lucide-react';
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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#005fff] via-[#0047ff] to-[#03113c] text-white py-16 sm:py-24 text-left shadow-md transition-all duration-300">
        {/* Decorative background visual ambient circles and polygons */}
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-400 via-indigo-500 to-transparent pointer-events-none" />
        <div className="absolute top-1/4 right-1/12 h-64 w-64 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 -left-10 h-72 w-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 pointer-events-none" />

        {/* Main Wrapper content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Core Headline */}
          <div className="max-w-3xl space-y-4">
            <h1
              className={`${landingHeadline} text-3xl sm:text-5xl md:text-6xl leading-none text-white drop-shadow-sm whitespace-nowrap`}
            >
              Post a task. Get it done.
            </h1>
            <p className="text-sm sm:text-base text-blue-100 max-w-lg leading-relaxed font-medium">
              Connect with certified, friendly local taskers ready to help you with furniture,
              moving, repairs, deep cleaning, and more.
            </p>
          </div>

          {/* Input Form Box container */}
          <form
            onSubmit={handleFormSubmit}
            className="mt-10 max-w-5xl bg-white p-2.5 sm:p-3.5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-3 border border-white/10"
          >
            {/* Main prompt text input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="In a few words, what do you need done?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full rounded-xl border-none pl-12 pr-4 py-3 text-sm sm:text-base font-medium text-[#03113c] placeholder-gray-400 focus:outline-none focus:ring-0"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-7 py-3.5 rounded-xl bg-[#03113c] text-sm sm:text-base font-semibold text-white hover:bg-black transition duration-200 cursor-pointer shadow-sm active:scale-95 inline-flex items-center justify-center space-x-2 shrink-0 select-none"
            >
              <span>Get Offers</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </form>

          {/* Quick assistance suggestion triggers */}
          <div className="mt-6 flex flex-wrap gap-2.5 items-center">
            {quickPills.map((pill) => (
              <button
                key={pill.title}
                type="button"
                onClick={() => onPostWithTitle(pill.query)}
                className="rounded-full border border-white/20 bg-white/10 hover:bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white transition cursor-pointer flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-95"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-300" />
                <span>{pill.title}</span>
              </button>
            ))}

            {/* More inspiration popover activator */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowInspirationMenu(!showInspirationMenu)}
                className="rounded-full border border-white/20 bg-white/10 hover:bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white transition cursor-pointer flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-95"
              >
                <span>More inspiration</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showInspirationMenu && (
                <div className="absolute left-0 bottom-full mb-3 w-64 rounded-xl border border-white/10 bg-[#03113c] p-2 shadow-2xl z-50 text-left animate-in fade-in slide-in-from-bottom-2 duration-150">
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

          {/* Click-away close (optional, minimal) */}
          {showInspirationMenu && (
            <button
              type="button"
              onClick={() => setShowInspirationMenu(false)}
              className="sr-only"
              aria-label="Close inspiration menu"
            >
              <Ban className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

