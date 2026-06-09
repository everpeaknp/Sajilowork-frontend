'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Heart, Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';
import { formatNPR } from '@/lib/nepalLocale';

interface Service {
  id: string;
  category: string;
  title: string;
  rating: number;
  reviews: number;
  image: string;
  author: {
    name: string;
    avatar: string;
    online: boolean;
  };
  startingPrice: number;
}

const TRENDING_SERVICES: Service[] = [
  {
    id: 'trend-1',
    category: 'Web & App Design',
    title: 'I will do mobile app development for ios...',
    rating: 4.82,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600',
    author: {
      name: 'Wanda Runo',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 983,
  },
  {
    id: 'trend-2',
    category: 'Web & App Design',
    title: 'I will design modern websites in figma o...',
    rating: 4.82,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600',
    author: {
      name: 'Wanda Runo',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 983,
  },
  {
    id: 'trend-3',
    category: 'Web & App Design',
    title: 'I will design modern websites in figma o...',
    rating: 4.82,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600',
    author: {
      name: 'Wanda Runo',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 983,
  },
  {
    id: 'trend-4',
    category: 'Design & Creative',
    title: 'I will build a fully responsive design i...',
    rating: 4.82,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=600',
    author: {
      name: 'Wanda Runo',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 983,
  },
  {
    id: 'trend-5',
    category: 'Development & IT',
    title: 'I will deploy high-converting Shopify store...',
    rating: 4.93,
    reviews: 74,
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
    author: {
      name: 'Ali Tufan',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 850,
  },
  {
    id: 'trend-6',
    category: 'Design & Creative',
    title: 'I will design minimalist brand guidelines...',
    rating: 4.95,
    reviews: 120,
    image:
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600',
    author: {
      name: 'Emma Watson',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 750,
  },
];

const INFINITE_SERVICES = [
  ...TRENDING_SERVICES,
  ...TRENDING_SERVICES,
  ...TRENDING_SERVICES,
  ...TRENDING_SERVICES,
  ...TRENDING_SERVICES,
];

interface TrendingServicesProps {
  className?: string;
}

export default function TrendingServices({ className = '' }: TrendingServicesProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const timer = setTimeout(() => {
      const card = container.firstElementChild as HTMLElement | null;
      const cardWidth = card ? card.getBoundingClientRect().width : 290;
      const gap = 24;
      const offset = cardWidth + gap;
      container.scrollLeft = TRENDING_SERVICES.length * 2 * offset;
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const scrollByCard = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const card = container.firstElementChild as HTMLElement | null;
    const cardWidth = card ? card.getBoundingClientRect().width : 290;
    const gap = 24;
    const delta = (cardWidth + gap) * (direction === 'left' ? -1 : 1);
    container.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const card = container.firstElementChild as HTMLElement | null;
    const cardWidth = card ? card.getBoundingClientRect().width : 290;
    const gap = 24;
    const offset = cardWidth + gap;
    const totalSetWidth = TRENDING_SERVICES.length * offset;

    if (container.scrollLeft < totalSetWidth) {
      container.scrollLeft += totalSetWidth;
    } else if (container.scrollLeft > totalSetWidth * 3) {
      container.scrollLeft -= totalSetWidth;
    }
  };

  return (
    <section
      className={`relative select-none overflow-hidden bg-[#1a3c34] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 xl:px-10 ${className}`}
    >
      <div className="relative mx-auto w-full max-w-[1240px]">
        <div className="relative z-10 mb-12 flex flex-row items-end justify-between">
          <div>
            <h2
              className={`${discoverHeadline} mb-3 text-3xl leading-tight text-white sm:text-4xl`}
            >
              Trending Services
            </h2>
            <p className={`${discoverMedium} text-sm text-[#a5bdbc]/90 sm:text-base`}>
              Aliquam lacinia diam quis lacus euismod
            </p>
          </div>

          <Link
            href="/search"
            className={`${discoverMedium} group flex items-center gap-2 text-sm text-white transition-colors duration-200 hover:text-[#4bbb80] sm:text-base`}
          >
            <span>All Services</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="relative z-10 w-full overflow-visible">
          <button
            type="button"
            onClick={() => scrollByCard('left')}
            className="absolute -left-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-100/10 bg-white text-[#1a3c34] shadow-lg transition-all duration-150 hover:bg-[#4bbb80] hover:text-white active:scale-95 active:bg-[#3ca46d] sm:-left-8 lg:-left-12"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={() => scrollByCard('right')}
            className="absolute -right-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-100/10 bg-white text-[#1a3c34] shadow-lg transition-all duration-150 hover:bg-[#4bbb80] hover:text-white active:scale-95 active:bg-[#3ca46d] sm:-right-8 lg:-right-12"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 stroke-[2.5]" />
          </button>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {INFINITE_SERVICES.map((service, idx) => {
              const isFav = !!favorites[service.id];
              return (
                <Link
                  key={`${service.id}-${idx}`}
                  href="/search"
                  className="group flex h-[385px] w-[250px] flex-shrink-0 cursor-pointer snap-start flex-col overflow-hidden rounded-none border-0 bg-white shadow-md transition-all duration-300 hover:no-underline hover:shadow-xl sm:w-[calc((100%-24px)/2)] md:w-[calc((100%-2*24px)/3)] lg:h-[417px] lg:w-[calc((100%-3*24px)/4)]"
                >
                  <div className="relative h-[200px] w-full flex-shrink-0 overflow-hidden rounded-none bg-neutral-100 lg:h-[215px]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full rounded-none object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      referrerPolicy="no-referrer"
                    />

                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(service.id, e)}
                      className="absolute right-4 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-neutral-100/20 bg-white text-black shadow-md transition-all duration-200 hover:scale-105 hover:bg-neutral-50 active:scale-95"
                      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart
                        className={`h-[17px] w-[17px] transition-transform ${
                          isFav
                            ? 'fill-red-500 text-red-500 stroke-red-500'
                            : 'stroke-[2.2] text-neutral-700'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-[18px]">
                    <div>
                      <span
                        className={`${discoverBody} mb-1.5 block text-[11px] uppercase tracking-wider text-neutral-400`}
                      >
                        {service.category}
                      </span>

                      <h3
                        className={`${discoverMedium} mb-2 line-clamp-2 h-10 text-[14px] leading-snug text-[#131118] transition-colors group-hover:text-[#4bbb80] sm:text-[15px]`}
                      >
                        {service.title}
                      </h3>

                      <div className={`${discoverBody} mb-2 flex items-center gap-1 text-[12px] text-neutral-500`}>
                        <Star className="mr-0.5 h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                        <span className={`${discoverMedium} text-neutral-800`}>{service.rating}</span>
                        <span className="text-neutral-400">({service.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-black pt-2.5">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="relative flex-shrink-0">
                          <img
                            src={service.author.avatar}
                            alt={service.author.name}
                            className="h-6 w-6 rounded-full border border-neutral-200 object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {service.author.online && (
                            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-[#10b981]" />
                          )}
                        </div>
                        <span className={`${discoverMedium} truncate text-[12px] text-neutral-600`}>
                          {service.author.name}
                        </span>
                      </div>

                      <div className="ml-3 flex flex-shrink-0 select-none items-center gap-1 text-right">
                        <span className={`${discoverBody} text-[10px] leading-none text-neutral-400`}>
                          Starting at
                        </span>
                        <span className={`${discoverMedium} text-[14px] leading-none tracking-tight text-[#131118]`}>
                          {formatNPR(service.startingPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
