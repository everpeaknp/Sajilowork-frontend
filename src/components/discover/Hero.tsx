'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  CheckCircle2,
  Search as SearchIcon,
  ThumbsUp,
} from 'lucide-react';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';

const POPULAR_TAGS = ['Cleaning', 'Moving', 'Handyman', 'Repairs', 'Gardening', 'Electrician'];

const SUGGESTIONS_DATABASE = [
  'Home deep cleaning',
  'Furniture moving help',
  'End of lease cleaning',
  'Handyman for odd jobs',
  'TV wall mounting',
  'Garden mowing and trimming',
  'Electrician for home wiring',
  'IKEA furniture assembly',
  'Plumbing leak repair',
  'Office cleaning service',
  'Packing and loading help',
  'Painting interior walls',
];

interface HeroProps {
  onSearchSubmit?: (query: string) => void;
}

interface SearchBoxProps {
  onSearchSubmit?: (query: string) => void;
}

function SearchBox({ onSearchSubmit }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = SUGGESTIONS_DATABASE.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    setSuggestions(filtered);
  }, [query]);

  const performSearch = (selectedQuery: string) => {
    if (!selectedQuery.trim()) return;
    setQuery(selectedQuery);
    setIsFocused(false);
    onSearchSubmit?.(selectedQuery);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    performSearch(query);
  };

  const handleTagClick = (tag: string) => {
    performSearch(tag);
  };

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`flex flex-col gap-2 rounded-lg border bg-white p-2 shadow-sm transition-all duration-300 sm:flex-row sm:items-center ${
            isFocused ? 'border-black ring-1 ring-black/5' : 'border-black'
          } relative z-30 w-full`}
        >
          <div className="flex min-w-0 flex-1 items-center">
            <div className="shrink-0 pl-3 pr-2 text-black sm:pl-4 sm:pr-3">
              <SearchIcon className="h-5 w-5 stroke-[2]" />
            </div>

            <input
              id="market-search"
              type="text"
              className={`${discoverBody} w-full min-w-0 flex-1 border-none bg-transparent py-2.5 text-base font-medium text-black outline-none placeholder:text-black focus:ring-0 sm:py-2 md:text-lg`}
              placeholder="What do you need done?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
          </div>

          <motion.button
            type="submit"
            className={`${discoverMedium} flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-black bg-[#193e32] px-5 py-3 text-white transition-all duration-200 hover:bg-neutral-900 sm:w-auto sm:py-2.5 md:px-8 md:py-3`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="text-sm md:text-base">Search</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {isFocused && suggestions.length > 0 && (
            <motion.div
              className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl shadow-brand-dark/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2.5">
                <div className={`${discoverMedium} px-3 py-1.5 text-xs uppercase tracking-wider text-neutral-400`}>
                  Popular task ideas
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`${discoverBody} flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-neutral-700 transition-colors hover:bg-neutral-50`}
                    onMouseDown={() => performSearch(item)}
                  >
                    <SearchIcon className="h-4 w-4 stroke-[1.5] text-brand-emerald" />
                    <span className="text-sm font-medium md:text-base">{item}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className={`${discoverBody} mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs`}>
        <span className={`${discoverMedium} mr-1.5 text-xs leading-relaxed text-neutral-500`}>
          Popular:
        </span>
        <div className="flex flex-wrap items-center">
          {POPULAR_TAGS.map((tag, idx) => (
            <React.Fragment key={tag}>
              <button
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`${discoverMedium} cursor-pointer text-xs transition-all duration-200 hover:text-black ${
                  query.toLowerCase() === tag.toLowerCase()
                    ? 'text-black underline underline-offset-2'
                    : 'text-neutral-600'
                }`}
              >
                {tag}
              </button>
              {idx < POPULAR_TAGS.length - 1 && (
                <span className="mr-1.5 text-neutral-400">,</span>
              )}
            </React.Fragment>
          ))}
        </div>
          </div>
    </div>
  );
}

function GraphicSection() {
  const MAIN_PORTRAIT =
    'https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fabout%2Fhome6-hero-img-1.png&w=1200&q=75';
  const SATELLITE_LEFT =
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200';
  const SATELLITE_TOP =
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200';
  const SATELLITE_RIGHT =
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200';

  return (
    <div
      className="relative mx-auto flex w-full max-w-[min(100%,520px)] select-none items-end justify-center overflow-hidden leading-none sm:max-w-xl lg:max-w-2xl"
      id="hero-graphic"
    >
      <div className="pointer-events-none absolute inset-0 z-10">
        <motion.div
          className="absolute left-[17%] top-[21%] h-4 w-4 rounded-full border-2 border-sky-400"
          animate={{ x: [-14, 14, -14] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <svg
          className="absolute left-[8%] top-[40%] h-12 w-20 text-emerald-600/30"
          viewBox="0 0 100 60"
          fill="none"
          aria-hidden
        >
          <path
            d="M10,35 Q35,10 50,35 T90,35"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M5,42 Q25,18 45,42 T85,42"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="3 3"
          />
        </svg>

        <motion.div
          className="absolute -top-[1.5%] right-[25%] select-none text-3xl font-medium text-rose-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          +
        </motion.div>

        <svg
          className="absolute right-[11%] top-[12%] h-12 w-16 text-purple-600/40"
          viewBox="0 0 100 60"
          fill="none"
                    aria-hidden
        >
          <path
            d="M15,10 C45,5 85,25 45,45 C25,50 10,25 35,15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <motion.div
          className="absolute right-[21%] top-[48%] text-amber-500"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-7 w-7 fill-amber-500/15" />
        </motion.div>

        <div className="animate-spin-slow absolute bottom-[23%] left-[18%] text-2xl font-medium text-indigo-500/60">
          ★
        </div>
      </div>

      <div className="relative z-20 flex w-full items-end justify-center sm:w-full lg:w-[124%] xl:w-[128%]">
        <motion.img
          src={MAIN_PORTRAIT}
          alt="Local tasker ready to help"
          className="pointer-events-none relative z-20 block h-auto w-full max-h-[min(380px,52vh)] select-none object-contain object-bottom drop-shadow-xl sm:max-h-[min(480px,60vh)] lg:max-h-[min(640px,78vh)]"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          referrerPolicy="no-referrer"
          draggable={false}
        />
      </div>

      <motion.div
        className="absolute left-[6%] top-[32%] z-30 h-14 w-14 overflow-hidden rounded-full sm:left-[3%] sm:top-[30%] sm:h-20 sm:w-20"
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.7, delay: 0.3 },
          scale: { duration: 0.7, delay: 0.3 },
          x: { duration: 0.7, delay: 0.3 },
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
        }}
        whileHover={{ scale: 1.08 }}
      >
        <img
          src={SATELLITE_LEFT}
          alt="Tasker"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      <motion.div
        className="absolute right-[8%] top-[8%] z-30 h-16 w-16 overflow-hidden rounded-full sm:right-[7%] sm:top-[5%] sm:h-[84px] sm:w-[84px]"
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.7, delay: 0.4 },
          scale: { duration: 0.7, delay: 0.4 },
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
        }}
        whileHover={{ scale: 1.08 }}
      >
        <img
          src={SATELLITE_TOP}
          alt="Tasker"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      <motion.div
        className="absolute right-[2%] top-[50%] z-30 h-14 w-14 overflow-hidden rounded-full sm:-right-[1%] sm:top-[49%] sm:h-20 sm:w-20"
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.7, delay: 0.5 },
          scale: { duration: 0.7, delay: 0.5 },
          x: { duration: 0.7, delay: 0.5 },
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
        }}
        whileHover={{ scale: 1.08 }}
      >
        <img
          src={SATELLITE_RIGHT}
          alt="Tasker"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      <motion.div
        className="absolute bottom-[24%] left-[2%] z-30 hidden max-w-[calc(100%-1rem)] flex-col justify-center rounded-none border border-neutral-100/80 bg-white py-3 pl-8 pr-4 shadow-2xl min-[420px]:flex sm:bottom-[28%] sm:-left-[5%] sm:min-w-[210px] sm:py-5 sm:pl-10 sm:pr-8 md:min-w-[230px]"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.8, delay: 0.6 },
          x: { duration: 0.8, delay: 0.6 },
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
        }}
        whileHover={{ scale: 1.03 }}
      >
        <div className="absolute -left-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#193e32] text-[#45a874] shadow">
          <ThumbsUp className="h-4 w-4 fill-brand-emerald text-brand-emerald" />
        </div>
        <div>
          <span className={`${discoverBody} text-base font-medium leading-none text-neutral-900 md:text-lg`}>
            4.9/5
          </span>
          <span className={`${discoverBody} mt-1 block text-xs leading-tight text-neutral-500`}>
            Clients rate taskers
          </span>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-[8%] right-[2%] z-30 hidden max-w-[calc(100%-1rem)] flex-col justify-center rounded-none border border-neutral-100/80 bg-white py-3 pl-8 pr-4 shadow-2xl min-[420px]:flex sm:-right-[2%] sm:bottom-[12%] sm:min-w-[190px] sm:py-5 sm:pl-10 sm:pr-8 md:min-w-[210px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.8, delay: 0.7 },
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
        }}
        whileHover={{ scale: 1.03 }}
      >
        <div className="absolute -left-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#193e32] text-[#45a874] shadow">
          <CheckCircle2 className="h-4 w-4 fill-brand-emerald text-brand-emerald" />
        </div>
        <div>
          <span className={`${discoverBody} text-base font-medium leading-none text-neutral-900 md:text-lg`}>
            12K+
          </span>
          <span className={`${discoverBody} mt-1 block text-xs leading-tight text-neutral-500`}>
            Tasks completed
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default function Hero({ onSearchSubmit }: HeroProps) {
  return (
    <section className="relative flex flex-col justify-start overflow-hidden bg-white px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:min-h-[calc(100dvh-4rem)] lg:px-12 lg:pt-8 xl:px-16">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[28%] bg-[#faf7ee] lg:block"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div className="grid flex-1 grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col justify-start self-start text-left lg:col-span-7 lg:mt-0 lg:translate-y-2 lg:justify-center lg:self-center">
            <motion.h1
              className={`${discoverHeadline} mb-4 text-[1.75rem] leading-[1.12] text-brand-dark sm:mb-6 sm:text-3xl md:text-4xl lg:text-[46px] xl:text-[54px]`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              With talented <span className="relative inline-block text-brand-emerald">taskers</span>{' '}
              <span className="lg:hidden"> </span>
              <br className="hidden sm:block" />
              get more done.
            </motion.h1>

            <motion.p
              className={`${discoverBody} mb-6 max-w-lg text-sm font-medium leading-relaxed text-neutral-500 sm:mb-8 sm:text-base md:text-lg`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Post a task on TaskNepal and connect with verified locals for cleaning, moving,
              repairs, and more.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <SearchBox onSearchSubmit={onSearchSubmit} />
            </motion.div>
          </div>

          <div className="relative flex w-full items-end justify-center overflow-hidden lg:col-span-5 lg:self-end">
            <GraphicSection />
          </div>

          <div className="grid grid-cols-2 gap-3 min-[420px]:hidden">
            <div className="rounded-lg border border-neutral-100 bg-white px-4 py-3 shadow-sm">
              <p className={`${discoverBody} text-base font-medium text-neutral-900`}>4.9/5</p>
              <p className={`${discoverBody} mt-0.5 text-xs text-neutral-500`}>Clients rate taskers</p>
            </div>
            <div className="rounded-lg border border-neutral-100 bg-white px-4 py-3 shadow-sm">
              <p className={`${discoverBody} text-base font-medium text-neutral-900`}>12K+</p>
              <p className={`${discoverBody} mt-0.5 text-xs text-neutral-500`}>Tasks completed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
