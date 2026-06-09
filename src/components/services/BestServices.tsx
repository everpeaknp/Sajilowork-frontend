'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { discoverBody, discoverHeadline } from '@/components/LangingHome/landingTypography';
import { formatNPR } from '@/lib/nepalLocale';

interface ServiceCard {
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

const BEST_SERVICES_DATA: ServiceCard[] = [
  {
    id: 'best-1',
    category: 'Web & App Design',
    title: 'I will design modern websites in figma or sketch platform',
    rating: 4.82,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Wanda Runo',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 8500,
  },
  {
    id: 'best-2',
    category: 'Art & Illustration',
    title: 'I will create modern flat design illustration elements',
    rating: 4.82,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Ali Tufan',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 6500,
  },
  {
    id: 'best-3',
    category: 'Design & Creative',
    title: 'I will build a fully responsive design in HTML, CSS layout',
    rating: 4.82,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Wanda Runo',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 7200,
  },
  {
    id: 'best-4',
    category: 'Web & App Design',
    title: 'I will do mobile app development for iOS and Android devices',
    rating: 4.82,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Wanda Runo',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 12000,
  },
  {
    id: 'best-5',
    category: 'Web & App Design',
    title: 'I will design modern websites in figma or adobe high fidelity',
    rating: 4.82,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Emma Watson',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 9000,
  },
  {
    id: 'best-6',
    category: 'Writing & Translation',
    title: 'I will proofread and edit articles with professional precision',
    rating: 4.95,
    reviews: 142,
    image:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Marcus Thorne',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
      online: false,
    },
    startingPrice: 3500,
  },
  {
    id: 'best-7',
    category: 'Digital Marketing',
    title: 'I will execute cohesive organic brand campaigns on social media',
    rating: 4.78,
    reviews: 35,
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Ali Tufan',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 4200,
  },
];

const PAGINATION_DOTS = [0, 1, 2];

interface BestServicesProps {
  className?: string;
}

export default function BestServices({ className = '' }: BestServicesProps) {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const maxIndex = BEST_SERVICES_DATA.length - 1;

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
  };

  return (
    <section
      className={`w-full select-none bg-white px-4 pb-4 pt-6 sm:px-6 sm:pb-6 sm:pt-8 md:px-8 lg:px-12 ${className}`}
    >
      <div className="mx-auto w-full max-w-full">
        <div className="mb-10 flex items-center justify-between gap-6">
          <div>
            <h2
              className={`${discoverHeadline} mb-2 text-2xl font-bold leading-tight tracking-tight text-[#131118] sm:text-3xl`}
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
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 text-neutral-600 transition-colors hover:border-neutral-800 hover:text-black"
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
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 text-neutral-600 transition-colors hover:border-neutral-800 hover:text-black"
              title="Next"
              aria-label="Next services"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative -mx-1 w-full overflow-hidden px-1">
          <motion.div
            className="mx-1 flex cursor-grab gap-6 pb-4 active:cursor-grabbing"
            animate={{ x: `-${currentIndex * (100 / 5)}%` }}
            transition={{ type: 'spring', damping: 26, stiffness: 120 }}
          >
            {BEST_SERVICES_DATA.map((card) => {
              const isFav = !!favorites[card.id];
              return (
                <div
                  key={card.id}
                  className="group flex w-full flex-shrink-0 flex-col justify-between overflow-hidden rounded-none border border-neutral-300 bg-white transition-all duration-300 sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(20%-19.2px)]"
                >
                  <div className="relative aspect-[1.18/1] w-full flex-shrink-0 overflow-hidden bg-neutral-100">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      referrerPolicy="no-referrer"
                    />

                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(card.id, e)}
                      className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-100/50 bg-white text-black shadow-md transition-all hover:scale-105 active:scale-95"
                      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 transition-transform ${
                          isFav ? 'animate-pulse fill-red-500 text-red-500' : 'text-neutral-500'
                        }`}
                        strokeWidth={2.5}
                      />
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                    <div>
                      <span className="mb-1 block text-xs font-normal text-neutral-400 sm:text-[13px]">
                        {card.category}
                      </span>

                      <h3
                        className={`${discoverBody} mb-2.5 line-clamp-2 text-sm font-normal leading-snug text-[#131118] transition-colors group-hover:text-[#52C47F] sm:text-[15px]`}
                      >
                        {card.title}
                      </h3>

                      <div className="mt-1 flex items-center gap-1 text-[13px] text-neutral-500">
                        <Star className="h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                        <span className="font-normal text-neutral-800">{card.rating}</span>
                        <span className="text-xs text-neutral-400">({card.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-neutral-300 pt-4">
                      <div className="flex min-w-0 items-center gap-1.5">
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
                      </div>

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
        </div>
      </div>
    </section>
  );
}
