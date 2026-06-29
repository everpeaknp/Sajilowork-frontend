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
import OptimizedImage from '@/components/ui/optimized-image';

interface TrendingServicesProps {
  className?: string;
  initialServices?: Service[];
}

export default function TrendingServices({ className = '', initialServices }: TrendingServicesProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const hasInitial = Boolean(initialServices?.length);
  const [services, setServices] = useState<Service[]>(initialServices ?? []);
  const [loading, setLoading] = useState(!hasInitial);
  const skipInitialFetchRef = useRef(hasInitial);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }

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
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="relative z-10 mb-12 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2
              className={`${discoverHeadline} mb-3 text-3xl leading-tight text-white sm:text-4xl lg:text-[44px]`}
            >
              Trending Services
            </h2>
            <p className={`${discoverMedium} text-sm text-emerald-100/90 sm:text-base`}>
              Most viewed services on Sajilowork right now
            </p>
          </div>

          <Link
            href="/services"
            className={`${discoverMedium} group flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-[#1a3c34] sm:self-auto sm:text-base`}
          >
            <span>Explore All Services</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="relative z-10 w-full">
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
                className="absolute left-1 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#1a3c34] shadow-xl ring-1 ring-black/5 transition-all duration-300 hover:scale-105 hover:bg-brand-emerald hover:text-white active:scale-95 sm:left-0 md:-left-6 lg:-left-6"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2]" />
              </button>

              <button
                type="button"
                onClick={() => scrollByCard('right')}
                className="absolute right-1 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#1a3c34] shadow-xl ring-1 ring-black/5 transition-all duration-300 hover:scale-105 hover:bg-brand-emerald hover:text-white active:scale-95 sm:right-0 md:-right-6 lg:-right-6"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-6 w-6 stroke-[2]" />
              </button>

              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-8 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] px-4 sm:px-0 [&::-webkit-scrollbar]:hidden"
              >
                {carouselServices.map((service, idx) => {
                  const isFav = !!favorites[service.id];
                  return (
                    <Link
                      key={`${service.id}-${idx}`}
                      href={getServiceDetailPath(service)}
                      className="group flex h-[360px] w-[min(82vw,250px)] flex-shrink-0 cursor-pointer snap-start flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:h-[385px] sm:w-[calc((100%-24px)/2)] md:w-[calc((100%-2*24px)/3)] lg:h-[417px] lg:w-[calc((100%-3*24px)/4)]"
                    >
                      <div className="relative h-[200px] w-full flex-shrink-0 overflow-hidden bg-neutral-100 lg:h-[215px]">
                        <OptimizedImage
                          src={service.image}
                          alt={service.title}
                          fill
                          sizes="(max-width: 640px) 82vw, (max-width: 1024px) 33vw, 250px"
                          fallbackSrc={DEFAULT_SERVICE_IMAGE}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(service.id, e)}
                          className={`absolute right-4 top-4 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all duration-300 ${
                            isFav 
                              ? 'bg-white text-rose-500 shadow-sm' 
                              : 'bg-white/90 text-neutral-400 hover:bg-white hover:text-rose-400'
                          }`}
                          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart
                            className={`h-[16px] w-[16px] transition-transform ${
                              isFav ? 'fill-rose-500 text-rose-500' : 'stroke-[2] text-neutral-600'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <span
                            className={`${discoverMedium} mb-2 block text-[11px] uppercase tracking-wider text-brand-emerald`}
                          >
                            {service.category}
                          </span>

                          <h3
                            className={`${discoverHeadline} mb-3 line-clamp-2 h-11 text-[16px] leading-snug text-brand-dark transition-colors group-hover:text-brand-emerald`}
                          >
                            {service.title}
                          </h3>

                          <div
                            className={`${discoverBody} mb-3 flex items-center gap-1.5 text-[13px] text-neutral-500`}
                          >
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className={`${discoverMedium} text-brand-dark font-semibold`}>
                              {service.rating > 0 ? service.rating.toFixed(2) : '—'}
                            </span>
                            <span className="text-neutral-400">
                              ({service.reviews} reviews)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="relative flex-shrink-0">
                              <OptimizedImage
                                src={service.author.avatar}
                                alt={service.author.name}
                                width={28}
                                height={28}
                                className="h-7 w-7 rounded-full border border-neutral-200 object-cover"
                              />
                              {service.author.online && (
                                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
                              )}
                            </div>
                            <span className={`${discoverMedium} truncate text-[13px] text-neutral-700`}>
                              {service.author.name}
                            </span>
                          </div>

                          <div className="ml-3 flex flex-shrink-0 select-none flex-col items-end gap-0.5 text-right">
                            <span
                              className={`${discoverBody} text-[11px] leading-none text-neutral-400`}
                            >
                              Starting at
                            </span>
                            <span
                              className={`${discoverMedium} text-[15px] leading-none tracking-tight text-brand-dark`}
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
