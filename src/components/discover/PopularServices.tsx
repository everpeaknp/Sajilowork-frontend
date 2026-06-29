'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart } from 'lucide-react';
import { discoverBody, discoverHeadline, discoverMedium } from '@/components/LangingHome/landingTypography';
import { formatNPR } from '@/lib/nepalLocale';
import { fetchPublicServices } from '@/lib/serviceApi';
import { DEFAULT_SERVICE_IMAGE } from '@/lib/dashboardListingApi';
import type { Service } from '@/components/services/serviceListData';
import { getServiceDetailPath } from '@/components/services/serviceSlug';
import OptimizedImage from '@/components/ui/optimized-image';

interface PopularServicesProps {
  className?: string;
  initialServices?: Service[];
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

export default function PopularServices({ className = '', initialServices }: PopularServicesProps) {
  const hasInitial = Boolean(initialServices?.length);
  const [services, setServices] = useState<Service[]>(initialServices ?? []);
  const [loading, setLoading] = useState(!hasInitial);
  const [activeCategory, setActiveCategory] = useState('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const skipInitialFetchRef = useRef(hasInitial);

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      const categories = topCategories(initialServices ?? []);
      setActiveCategory(categories[0] ?? '');
      return;
    }

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
      className={`overflow-hidden bg-[#fdfdfc] px-4 py-16 sm:px-8 sm:py-24 lg:px-12 xl:px-16 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 sm:mb-12">
          <div className="min-w-0">
            <motion.h2
              className={`${discoverHeadline} mb-2 text-3xl leading-tight text-brand-dark sm:text-4xl lg:text-[44px]`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Popular Services
            </motion.h2>
            <motion.p
              className={`${discoverBody} max-w-2xl text-sm text-neutral-500 sm:text-base`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Most viewed and all-time top-selling services
            </motion.p>
          </div>

          {categories.length > 0 ? (
            <motion.div
              className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex w-max max-w-full flex-nowrap gap-2 sm:w-auto sm:flex-wrap sm:gap-3">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`${discoverBody} cursor-pointer rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-brand-emerald text-white shadow-md shadow-brand-emerald/20'
                        : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50 hover:text-brand-dark'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
              </div>
            </motion.div>
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
          <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {currentServices.map((service, idx) => {
                const isFav = !!favorites[service.id];
                return (
                  <motion.div
                    key={service.id}
                    className="h-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link
                      href={getServiceDetailPath(service)}
                      className="group flex h-full min-h-[192px] w-full flex-col overflow-hidden rounded-xl border border-neutral-200/70 bg-white transition-all duration-300 hover:border-neutral-300 md:flex-row"
                    >
                      <div className="relative h-[192px] w-full shrink-0 overflow-hidden bg-neutral-100 md:w-[190px]">
                        <OptimizedImage
                          src={service.image}
                          alt={service.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 190px"
                          fallbackSrc={DEFAULT_SERVICE_IMAGE}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="relative flex min-h-[192px] min-w-0 flex-1 flex-col p-5 md:py-4">
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

                        <div className="flex flex-1 flex-col pr-10">
                          <span
                            className={`${discoverMedium} mb-2 block truncate text-xs uppercase tracking-wider text-brand-emerald`}
                          >
                            {service.category}
                          </span>

                          <h3
                            className={`${discoverHeadline} mb-3 line-clamp-2 min-h-[3.25rem] text-lg leading-snug text-brand-dark transition-colors group-hover:text-brand-emerald`}
                          >
                            {service.title}
                          </h3>

                          <div className="mt-auto flex items-center gap-1.5 text-sm text-neutral-500">
                            <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-brand-dark">
                              {service.rating > 0 ? service.rating.toFixed(2) : '—'}
                            </span>
                            <span className="text-neutral-400">({service.reviews} reviews)</span>
                          </div>
                        </div>

                        <div className="mt-4 flex shrink-0 items-center justify-between border-t border-neutral-100 pt-4">
                          <div className="flex min-w-0 flex-1 items-center gap-3 pr-3">
                            <div className="relative shrink-0">
                              <OptimizedImage
                                src={service.author.avatar}
                                alt={service.author.name}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full border border-neutral-200 object-cover"
                              />
                              {service.author.online && (
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                              )}
                            </div>
                            <span
                              className={`${discoverBody} truncate text-sm font-medium text-neutral-700`}
                            >
                              {service.author.name}
                            </span>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="mb-1 block text-xs font-normal leading-none text-neutral-400">
                              Starting at
                            </span>
                            <span
                              className={`${discoverMedium} whitespace-nowrap text-lg tabular-nums text-brand-dark`}
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
