'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Star, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { discoverBody, discoverHeadline } from '@/components/LangingHome/landingTypography';
import { formatNPR } from '@/lib/nepalLocale';
import { DEFAULT_SERVICE_IMAGE, serviceListingFallbackImage } from '@/lib/dashboardListingApi';
import { fetchPublicServices } from '@/lib/serviceApi';
import { buildBookmarkSlugSet, resolveListingSlug, toggleListingBookmark } from '@/lib/listingBookmark';
import { MarketplaceServiceCarouselSkeleton } from '@/components/common/MarketplaceBrowseSkeletons';
import type { Service } from './serviceListData';
import { getServiceDetailPath } from './serviceSlug';
import ServiceAuthorLink from './ServiceAuthorLink';

const PAGINATION_DOTS = [0, 1, 2];

interface BestServicesProps {
  className?: string;
}

export default function BestServices({ className = '' }: BestServicesProps) {
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const [loadingBestServices, setLoadingBestServices] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bestServices, setBestServices] = useState<Service[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoadingBestServices(true);
    void fetchPublicServices({ ordering: '-views_count' })
      .then((items) => {
        if (cancelled) return;
        setBestServices(items.slice(0, 7));
        setSavedSlugs(buildBookmarkSlugSet(items.slice(0, 7)));
      })
      .catch(() => {
        if (!cancelled) setBestServices([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBestServices(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const maxIndex = Math.max(0, bestServices.length - 1);

  const toggleFavorite = async (service: Service, e: React.MouseEvent) => {
    e.stopPropagation();
    const slug = resolveListingSlug(service.slug, service.id);
    const isSaved = savedSlugs.has(slug);
    const next = await toggleListingBookmark(slug, isSaved, 'service');
    if (next === null) return;
    setSavedSlugs((prev) => {
      const updated = new Set(prev);
      if (next) updated.add(slug);
      else updated.delete(slug);
      return updated;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
  };

  if (!loadingBestServices && bestServices.length === 0) {
    return null;
  }

  return (
    <section
      className={`relative z-0 w-full select-none bg-white px-4 pb-4 pt-6 sm:px-6 sm:pb-6 sm:pt-8 md:px-8 lg:px-12 ${className}`}
    >
      <div className="mx-auto w-full max-w-full">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className={`${discoverHeadline} mb-2 text-xl font-bold leading-tight tracking-tight text-[#131118] sm:text-2xl md:text-3xl`}
            >
              Best Services
            </h2>
            <p className={`${discoverBody} text-xs font-normal text-[#5e586c] sm:text-sm md:text-base`}>
              Most viewed and all-time top-selling services
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={loadingBestServices}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 text-neutral-600 transition-colors hover:border-neutral-800 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
              title="Previous"
              aria-label="Previous services"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {PAGINATION_DOTS.map((dotIndex) => {
                const isActive = currentIndex % 3 === dotIndex;
                return (
                  <button
                    key={dotIndex}
                    type="button"
                    onClick={() => setCurrentIndex(dotIndex * 2)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isActive ? 'w-2.5 bg-black' : 'w-2.5 bg-neutral-300/70'
                    }`}
                    aria-label={`Go to slide group ${dotIndex + 1}`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={loadingBestServices}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 text-neutral-600 transition-colors hover:border-neutral-800 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
              title="Next"
              aria-label="Next services"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative -mx-1 w-full overflow-hidden px-1">
          {loadingBestServices ? (
            <MarketplaceServiceCarouselSkeleton count={5} />
          ) : (
          <motion.div
            className="mx-1 flex cursor-grab gap-6 pb-4 active:cursor-grabbing"
            animate={{ x: `-${currentIndex * (100 / 5)}%` }}
            transition={{ type: 'spring', damping: 26, stiffness: 120 }}
          >
            {bestServices.map((card) => {
              const slug = resolveListingSlug(card.slug, card.id);
              const isFav = savedSlugs.has(slug);
              return (
                <div
                  key={card.id}
                  className="group flex w-full flex-shrink-0 flex-col justify-between overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-neutral-200 hover:shadow-md sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(20%-19.2px)]"
                >
                  <Link
                    href={getServiceDetailPath(card)}
                    className="relative block aspect-[1.18/1] w-full flex-shrink-0 overflow-hidden bg-neutral-100"
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          serviceListingFallbackImage(card) || DEFAULT_SERVICE_IMAGE;
                      }}
                    />

                    <button
                      type="button"
                      onClick={(e) => void toggleFavorite(card, e)}
                      className="absolute right-3.5 top-3.5 z-[1] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-100/50 bg-white text-black shadow-md transition-all hover:scale-105 active:scale-95"
                      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 transition-transform ${
                          isFav ? 'animate-pulse fill-red-500 text-red-500' : 'text-neutral-500'
                        }`}
                        strokeWidth={2.5}
                      />
                    </button>
                  </Link>

                  <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                    <div>
                      <span className="mb-1 block text-xs font-normal text-neutral-400 sm:text-[13px]">
                        {card.category}
                      </span>

                      <h3 className={`${discoverBody} mb-2.5 line-clamp-2 text-sm font-normal leading-snug sm:text-[15px]`}>
                        <Link
                          href={getServiceDetailPath(card)}
                          className="text-[#131118] transition-colors hover:text-[#52C47F]"
                        >
                          {card.title}
                        </Link>
                      </h3>

                      <div className="mt-1 flex items-center gap-1 text-[13px] text-neutral-500">
                        <Star className="h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                        <span className="font-normal text-neutral-800">{card.rating}</span>
                        <span className="text-xs text-neutral-400">({card.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-neutral-300 pt-4">
                      <ServiceAuthorLink
                        service={card}
                        className="flex min-w-0 items-center gap-1.5 transition-opacity hover:opacity-80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative h-[26px] w-[26px] flex-shrink-0 overflow-hidden rounded-full border border-neutral-200/60">
                          <img
                            src={card.author.avatar}
                            alt={card.author.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {card.author.online && (
                            <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-[#43b06d] ring-1 ring-white" />
                          )}
                        </div>
                        <span className="truncate text-xs font-normal text-neutral-500">{card.author.name}</span>
                      </ServiceAuthorLink>

                      <div className="flex-shrink-0 text-right">
                        <span className="mb-0.5 block text-[10px] font-normal leading-none text-neutral-400">
                          Starting at
                        </span>
                        <span className={`${discoverBody} text-[14px] font-normal text-neutral-800 sm:text-[15px]`}>
                          {formatNPR(card.startingPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
