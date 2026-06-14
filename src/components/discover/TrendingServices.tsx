'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Heart, Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';
import { formatNPR } from '@/lib/nepalLocale';
import { fetchPublicServices } from '@/lib/serviceApi';
import { DEFAULT_SERVICE_IMAGE } from '@/lib/dashboardListingApi';
import type { Service } from '@/components/services/serviceListData';
import { getServiceDetailPath } from '@/components/services/serviceSlug';

interface TrendingServicesProps {
  className?: string;
}

export default function TrendingServices({ className = '' }: TrendingServicesProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchPublicServices({ ordering: '-views_count', page_size: 12 })
      .then((items) => {
        if (!cancelled) setServices(items);
      })
      .catch(() => {
        if (!cancelled) setServices([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const carouselServices = useMemo(() => {
    if (services.length === 0) return [];
    return Array.from({ length: 5 }, () => services).flat();
  }, [services]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || services.length === 0) return;

    const timer = setTimeout(() => {
      const card = container.firstElementChild as HTMLElement | null;
      const cardWidth = card ? card.getBoundingClientRect().width : 290;
      const gap = 24;
      const offset = cardWidth + gap;
      container.scrollLeft = services.length * 2 * offset;
    }, 100);

    return () => clearTimeout(timer);
  }, [services]);

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
    if (!container || services.length === 0) return;

    const card = container.firstElementChild as HTMLElement | null;
    const cardWidth = card ? card.getBoundingClientRect().width : 290;
    const gap = 24;
    const offset = cardWidth + gap;
    const totalSetWidth = services.length * offset;

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
        <div className="relative z-10 mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2
              className={`${discoverHeadline} mb-2 text-2xl leading-tight text-white sm:mb-3 sm:text-3xl md:text-4xl`}
            >
              Trending Services
            </h2>
            <p className={`${discoverMedium} text-sm text-[#a5bdbc]/90 sm:text-base`}>
              Most viewed services on tasknepal right now
            </p>
          </div>

          <Link
            href="/services"
            className={`${discoverMedium} group flex shrink-0 items-center gap-2 self-start text-sm text-white transition-colors duration-200 hover:text-[#4bbb80] sm:self-auto sm:text-base`}
          >
            <span>All Services</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="relative z-10 w-full overflow-hidden">
          {loading ? (
            <p className={`${discoverBody} py-12 text-center text-sm text-[#a5bdbc]/90`}>
              Loading trending services…
            </p>
          ) : services.length === 0 ? (
            <p className={`${discoverBody} py-12 text-center text-sm text-[#a5bdbc]/90`}>
              No services available yet.
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => scrollByCard('left')}
                className="absolute left-1 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-100/10 bg-white text-[#1a3c34] shadow-lg transition-all duration-150 hover:bg-[#4bbb80] hover:text-white active:scale-95 active:bg-[#3ca46d] sm:left-0 sm:h-12 sm:w-12 md:-left-8 lg:-left-12"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => scrollByCard('right')}
                className="absolute right-1 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-100/10 bg-white text-[#1a3c34] shadow-lg transition-all duration-150 hover:bg-[#4bbb80] hover:text-white active:scale-95 active:bg-[#3ca46d] sm:right-0 sm:h-12 sm:w-12 md:-right-8 lg:-right-12"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-6 w-6 stroke-[2.5]" />
              </button>

              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {carouselServices.map((service, idx) => {
                  const isFav = !!favorites[service.id];
                  return (
                    <Link
                      key={`${service.id}-${idx}`}
                      href={getServiceDetailPath(service)}
                      className="group flex h-[360px] w-[min(82vw,250px)] flex-shrink-0 cursor-pointer snap-start flex-col overflow-hidden rounded-none border-0 bg-white shadow-md transition-all duration-300 hover:no-underline hover:shadow-xl sm:h-[385px] sm:w-[calc((100%-24px)/2)] md:w-[calc((100%-2*24px)/3)] lg:h-[417px] lg:w-[calc((100%-3*24px)/4)]"
                    >
                      <div className="relative h-[200px] w-full flex-shrink-0 overflow-hidden rounded-none bg-neutral-100 lg:h-[215px]">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="h-full w-full rounded-none object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_SERVICE_IMAGE;
                          }}
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

                          <div
                            className={`${discoverBody} mb-2 flex items-center gap-1 text-[12px] text-neutral-500`}
                          >
                            <Star className="mr-0.5 h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                            <span className={`${discoverMedium} text-neutral-800`}>
                              {service.rating > 0 ? service.rating.toFixed(2) : '—'}
                            </span>
                            <span className="text-neutral-400">
                              ({service.reviews} reviews)
                            </span>
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
                            <span
                              className={`${discoverBody} text-[10px] leading-none text-neutral-400`}
                            >
                              Starting at
                            </span>
                            <span
                              className={`${discoverMedium} text-[14px] leading-none tracking-tight text-[#131118]`}
                            >
                              {formatNPR(service.startingPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
