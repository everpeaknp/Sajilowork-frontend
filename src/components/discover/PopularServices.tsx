'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart } from 'lucide-react';
import { discoverBody, discoverHeadline, discoverMedium } from '@/components/LangingHome/landingTypography';
import { formatNPR } from '@/lib/nepalLocale';
import { fetchPublicServices } from '@/lib/serviceApi';
import { DEFAULT_SERVICE_IMAGE } from '@/lib/dashboardListingApi';
import type { Service } from '@/components/services/serviceListData';
import { getServiceDetailPath } from '@/components/services/serviceSlug';

interface PopularServicesProps {
  className?: string;
}

function topCategories(services: Service[], limit = 5): string[] {
  const counts = new Map<string, number>();
  for (const service of services) {
    const name = service.category?.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
    .slice(0, limit);
}

export default function PopularServices({ className = '' }: PopularServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchPublicServices({ ordering: '-bids_count', page_size: 50 })
      .then((items) => {
        if (cancelled) return;
        setServices(items);
        const categories = topCategories(items);
        setActiveCategory((prev) => {
          if (prev && categories.includes(prev)) return prev;
          return categories[0] ?? '';
        });
      })
      .catch(() => {
        if (!cancelled) {
          setServices([]);
          setActiveCategory('');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => topCategories(services), [services]);

  const currentServices = useMemo(
    () =>
      services
        .filter((service) => !activeCategory || service.category === activeCategory)
        .slice(0, 6),
    [services, activeCategory],
  );

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      className={`overflow-hidden bg-white px-4 py-12 sm:px-8 sm:py-20 lg:px-12 xl:px-16 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-12 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <h2
              className={`${discoverHeadline} mb-2 text-2xl leading-tight text-[#131118] sm:text-3xl md:text-4xl`}
            >
              Popular Services
            </h2>
            <p className={`${discoverBody} text-sm text-[#5e586c] sm:text-base`}>
              Most viewed and all-time top-selling services
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
              <div className="flex w-max max-w-full flex-nowrap gap-2 sm:w-auto sm:flex-wrap sm:gap-3">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`${discoverBody} cursor-pointer rounded-lg border px-4 py-2.5 text-xs font-medium transition-all duration-200 sm:px-5 sm:text-sm ${
                      isActive
                        ? 'border-black bg-white font-medium text-[#45a874]'
                        : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-black'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
              </div>
            </div>
          ) : null}
        </div>

        {loading ? (
          <p className={`${discoverBody} py-12 text-center text-sm text-neutral-400`}>
            Loading popular services…
          </p>
        ) : currentServices.length === 0 ? (
          <p className={`${discoverBody} py-12 text-center text-sm text-neutral-400`}>
            No services available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {currentServices.map((service, idx) => {
                const isFav = !!favorites[service.id];
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    whileHover={{ y: -2 }}
                  >
                    <Link
                      href={getServiceDetailPath(service)}
                      className="group mx-auto flex w-full max-w-[691px] flex-col overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-md md:h-[192px] md:max-w-none md:flex-row"
                    >
                      <div className="relative h-[192px] w-full flex-shrink-0 overflow-hidden bg-neutral-100 md:h-full md:w-[190px]">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_SERVICE_IMAGE;
                          }}
                        />
                      </div>

                      <div className="relative flex h-full min-w-0 flex-1 flex-col justify-between p-5 md:px-5 md:py-4">
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(service.id, e)}
                          className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200/60 bg-white text-black transition-colors hover:bg-neutral-50"
                          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart
                            className={`h-4 w-4 transition-transform active:scale-95 ${
                              isFav ? 'fill-black text-black' : 'text-black'
                            }`}
                            strokeWidth={2}
                          />
                        </button>

                        <div className="pr-6">
                          <span
                            className={`${discoverMedium} mb-1.5 block text-[11px] uppercase tracking-wider text-neutral-400`}
                          >
                            {service.category}
                          </span>

                          <h3
                            className={`${discoverBody} mb-2 line-clamp-2 text-sm font-medium leading-snug text-[#131118] transition-colors group-hover:text-emerald-800 md:text-[15px]`}
                          >
                            {service.title}
                          </h3>

                          <div className="flex items-center gap-1 text-xs text-neutral-500">
                            <Star className="h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                            <span className="font-medium text-neutral-800">
                              {service.rating > 0 ? service.rating.toFixed(2) : '—'}
                            </span>
                            <span className="text-neutral-400">({service.reviews} reviews)</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-[#131118] pt-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="relative flex-shrink-0">
                              <img
                                src={service.author.avatar}
                                alt={service.author.name}
                                className="h-[26px] w-[26px] rounded-full border border-neutral-200 object-cover"
                                referrerPolicy="no-referrer"
                              />
                              {service.author.online && (
                                <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full border border-white bg-[#10b981]" />
                              )}
                            </div>
                            <span
                              className={`${discoverBody} truncate text-xs font-medium text-neutral-600`}
                            >
                              {service.author.name}
                            </span>
                          </div>

                          <div className="ml-4 flex-shrink-0 text-right">
                            <span className="mb-0.5 block text-[10px] font-normal leading-none text-neutral-400">
                              Starting at
                            </span>
                            <span
                              className={`${discoverMedium} text-[14px] text-neutral-800 sm:text-[15px]`}
                            >
                              {formatNPR(service.startingPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
