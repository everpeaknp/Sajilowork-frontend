'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  ChevronUp,
  Star,
  Heart,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { discoverBody, discoverHeadline, discoverMedium } from '@/components/LangingHome/landingTypography';
import { formatNPR } from '@/lib/nepalLocale';

interface ServiceItem {
  id: string;
  category: string;
  title: string;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  author: {
    name: string;
    avatar: string;
    online: boolean;
  };
  startingPrice: number;
  deliveryTime: '24h' | '3days' | '7days' | 'anytime';
  budget: number;
  designTool: 'Figma' | 'Sketch' | 'Adobe XD' | 'Illustrator' | 'Photoshop';
  location: 'United States' | 'United Kingdom' | 'Germany' | 'Remote';
  speaks: 'English' | 'Spanish' | 'French' | 'German';
  level: 'New Seller' | 'Level 1' | 'Level 2' | 'Top Rated';
}

const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'av-1',
    category: 'Web & App Design',
    title: 'I will design modern websites in figma or sketch platform',
    rating: 4.82,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1541462608141-ad4979e408c9?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Wanda Runo',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 8500,
    deliveryTime: '24h',
    budget: 8500,
    designTool: 'Figma',
    location: 'United States',
    speaks: 'English',
    level: 'Level 2',
  },
  {
    id: 'av-2',
    category: 'Art & Illustration',
    title: 'I will create modern flat design illustration elements',
    rating: 4.82,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1618005198143-d3663a89228a?auto=format&fit=crop&q=80&w=400',
    ],
    author: {
      name: 'Ali Tufan',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 6500,
    deliveryTime: '3days',
    budget: 6500,
    designTool: 'Illustrator',
    location: 'Remote',
    speaks: 'English',
    level: 'Top Rated',
  },
  {
    id: 'av-3',
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
    startingPrice: 4500,
    deliveryTime: '7days',
    budget: 4500,
    designTool: 'Figma',
    location: 'United Kingdom',
    speaks: 'Spanish',
    level: 'Level 1',
  },
  {
    id: 'av-4',
    category: 'Web & App Design',
    title: 'I will do mobile app development for iOS and Android devices',
    rating: 4.82,
    reviews: 94,
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Wanda Runo',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 12000,
    deliveryTime: '7days',
    budget: 12000,
    designTool: 'Adobe XD',
    location: 'Remote',
    speaks: 'English',
    level: 'Top Rated',
  },
  {
    id: 'av-5',
    category: 'Web & App Design',
    title: 'I will design modern websites in figma or Adobe XD prototype',
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
    deliveryTime: '24h',
    budget: 9000,
    designTool: 'Figma',
    location: 'Germany',
    speaks: 'German',
    level: 'Level 2',
  },
  {
    id: 'av-6',
    category: 'Art & Illustration',
    title: 'I will paint modern minimalist canvas backgrounds & assets',
    rating: 4.91,
    reviews: 124,
    image:
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Ali Tufan',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 3500,
    deliveryTime: '3days',
    budget: 3500,
    designTool: 'Photoshop',
    location: 'United States',
    speaks: 'English',
    level: 'Level 2',
  },
  {
    id: 'av-7',
    category: 'Design & Creative',
    title: 'I will make responsive design layouts & vector drawings',
    rating: 4.75,
    reviews: 42,
    image:
      'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Emma Watson',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
      online: true,
    },
    startingPrice: 5500,
    deliveryTime: 'anytime',
    budget: 5500,
    designTool: 'Illustrator',
    location: 'Germany',
    speaks: 'French',
    level: 'New Seller',
  },
  {
    id: 'av-8',
    category: 'Web & App Design',
    title: 'I will create low-fidelity wireframes in Sketch application',
    rating: 4.88,
    reviews: 67,
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Marcus Thorne',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
      online: false,
    },
    startingPrice: 4800,
    deliveryTime: '3days',
    budget: 4800,
    designTool: 'Sketch',
    location: 'United Kingdom',
    speaks: 'English',
    level: 'Level 1',
  },
  {
    id: 'av-9',
    category: 'Design & Creative',
    title: 'I will construct pristine vector mockups for high-tier companies',
    rating: 4.98,
    reviews: 180,
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=400',
    author: {
      name: 'Marcus Thorne',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
      online: false,
    },
    startingPrice: 15000,
    deliveryTime: '24h',
    budget: 15000,
    designTool: 'Figma',
    location: 'United States',
    speaks: 'English',
    level: 'Top Rated',
  },
];

const BUDGET_MIN = 3000;
const BUDGET_MAX = 20000;
const BUDGET_DEFAULT = BUDGET_MAX;

const DESIGN_TOOLS = ['Figma', 'Sketch', 'Adobe XD', 'Illustrator', 'Photoshop'] as const;
const LOCATIONS = ['United States', 'United Kingdom', 'Germany', 'Remote'] as const;
const LANGUAGES = ['English', 'Spanish', 'French', 'German'] as const;
const LEVELS = ['New Seller', 'Level 1', 'Level 2', 'Top Rated'] as const;

interface AvailableServicesProps {
  className?: string;
}

export default function AvailableServices({ className = '' }: AvailableServicesProps) {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(2);
  const [cardSlideIndex, setCardSlideIndex] = useState<Record<string, number>>({ 'av-2': 1 });

  const [deliveryTime, setDeliveryTime] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState(BUDGET_DEFAULT);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('best-seller');

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    delivery: false,
    budget: false,
    tools: false,
    location: false,
    speaks: false,
    level: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCardPrevSlide = (cardId: string, maxSlides: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardSlideIndex((prev) => {
      const current = prev[cardId] ?? 0;
      return { ...prev, [cardId]: current === 0 ? maxSlides - 1 : current - 1 };
    });
  };

  const handleCardNextSlide = (cardId: string, maxSlides: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardSlideIndex((prev) => {
      const current = prev[cardId] ?? 0;
      return { ...prev, [cardId]: current === maxSlides - 1 ? 0 : current + 1 };
    });
  };

  const toggleInList = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const hasActiveFilters =
    deliveryTime !== 'all' ||
    maxBudget !== BUDGET_DEFAULT ||
    selectedTools.length > 0 ||
    selectedLocations.length > 0 ||
    selectedLanguages.length > 0 ||
    selectedLevels.length > 0;

  const handleResetFilters = () => {
    setDeliveryTime('all');
    setMaxBudget(BUDGET_DEFAULT);
    setSelectedTools([]);
    setSelectedLocations([]);
    setSelectedLanguages([]);
    setSelectedLevels([]);
  };

  const filteredServices = useMemo(() => {
    let result = [...SERVICES_DATA];

    if (deliveryTime !== 'all') {
      result = result.filter((item) => item.deliveryTime === deliveryTime);
    }

    result = result.filter((item) => item.startingPrice <= maxBudget);

    if (selectedTools.length > 0) {
      result = result.filter((item) => selectedTools.includes(item.designTool));
    }
    if (selectedLocations.length > 0) {
      result = result.filter((item) => selectedLocations.includes(item.location));
    }
    if (selectedLanguages.length > 0) {
      result = result.filter((item) => selectedLanguages.includes(item.speaks));
    }
    if (selectedLevels.length > 0) {
      result = result.filter((item) => selectedLevels.includes(item.level));
    }

    if (sortBy === 'best-seller') {
      result.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.startingPrice - a.startingPrice);
    } else if (sortBy === 'reviews') {
      result.sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [
    deliveryTime,
    maxBudget,
    selectedTools,
    selectedLocations,
    selectedLanguages,
    selectedLevels,
    sortBy,
  ]);

  const deliveryCounts = {
    '24h': SERVICES_DATA.filter((s) => s.deliveryTime === '24h').length + 1944,
    '3days': SERVICES_DATA.filter((s) => s.deliveryTime === '3days').length + 8134,
    '7days': SERVICES_DATA.filter((s) => s.deliveryTime === '7days').length + 915,
    anytime: SERVICES_DATA.filter((s) => s.deliveryTime === 'anytime').length + 239,
  };

  return (
    <section
      className={`w-full select-none bg-white px-4 pb-12 pt-0 sm:px-6 sm:pb-14 sm:pt-2 md:px-8 lg:px-12 ${className}`}
    >
      <div className="mx-auto w-full max-w-full">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="w-full flex-shrink-0 lg:w-[330px]">
            {hasActiveFilters && (
              <div className="mb-6 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={`${discoverMedium} flex cursor-pointer items-center gap-1 text-xs text-red-500 transition-colors hover:text-red-700`}
                >
                  <X className="h-3 w-3" /> Clear All
                </button>
              </div>
            )}

            <div className="space-y-6">
              <FilterAccordion
                title="Delivery Time"
                open={openSections.delivery}
                onToggle={() => toggleSection('delivery')}
              >
                <div className="space-y-4 pr-2">
                  {(
                    [
                      { value: '24h', label: 'Express 24H', count: deliveryCounts['24h'] },
                      { value: '3days', label: 'Up to 3 days', count: deliveryCounts['3days'] },
                      { value: '7days', label: 'Up to 7 days', count: deliveryCounts['7days'] },
                      { value: 'all', label: 'Anytime', count: deliveryCounts.anytime },
                    ] as const
                  ).map((opt) => (
                    <label
                      key={opt.value}
                      className="group flex cursor-pointer items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="deliveryTime"
                          checked={
                            opt.value === 'all'
                              ? deliveryTime === 'all' || deliveryTime === 'anytime'
                              : deliveryTime === opt.value
                          }
                          onChange={() => setDeliveryTime(opt.value)}
                          className="h-[18px] w-[18px] flex-shrink-0 cursor-pointer rounded-full border border-neutral-300 accent-black"
                        />
                        <span className="text-[16px] leading-tight text-neutral-700 transition-colors group-hover:text-black">
                          {opt.label}
                        </span>
                      </div>
                      <span className="text-sm text-neutral-400">({opt.count.toLocaleString()})</span>
                    </label>
                  ))}
                </div>
              </FilterAccordion>

              <FilterAccordion
                title="Budget"
                open={openSections.budget}
                onToggle={() => toggleSection('budget')}
              >
                <div className="pr-2 pt-2">
                  <input
                    type="range"
                    min={BUDGET_MIN}
                    max={BUDGET_MAX}
                    step={500}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-100 accent-black"
                  />
                  <div className="mt-2 flex items-center justify-between text-sm text-neutral-500">
                    <span>Min: {formatNPR(BUDGET_MIN)}</span>
                    <span className={`${discoverMedium} text-[15px] text-black`}>
                      Under: {formatNPR(maxBudget)}
                    </span>
                    <span>Max: {formatNPR(BUDGET_MAX)}</span>
                  </div>
                </div>
              </FilterAccordion>

              <FilterAccordion
                title="Design Tool"
                open={openSections.tools}
                onToggle={() => toggleSection('tools')}
              >
                <CheckboxList
                  items={DESIGN_TOOLS}
                  selected={selectedTools}
                  onToggle={(v) => toggleInList(v, setSelectedTools)}
                />
              </FilterAccordion>

              <FilterAccordion
                title="Location"
                open={openSections.location}
                onToggle={() => toggleSection('location')}
              >
                <CheckboxList
                  items={LOCATIONS}
                  selected={selectedLocations}
                  onToggle={(v) => toggleInList(v, setSelectedLocations)}
                />
              </FilterAccordion>

              <FilterAccordion
                title="Speaks"
                open={openSections.speaks}
                onToggle={() => toggleSection('speaks')}
              >
                <CheckboxList
                  items={LANGUAGES}
                  selected={selectedLanguages}
                  onToggle={(v) => toggleInList(v, setSelectedLanguages)}
                />
              </FilterAccordion>

              <FilterAccordion
                title="Level"
                open={openSections.level}
                onToggle={() => toggleSection('level')}
                bordered={false}
              >
                <CheckboxList
                  items={LEVELS}
                  selected={selectedLevels}
                  onToggle={(v) => toggleInList(v, setSelectedLevels)}
                />
              </FilterAccordion>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between pb-4">
              <span className={`${discoverBody} text-base font-normal text-[#131118] md:text-lg`}>
                <span className="font-semibold text-black">{filteredServices.length}</span> services
                available
              </span>

              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-normal text-neutral-400">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`${discoverMedium} cursor-pointer appearance-none border-0 bg-transparent py-2 pl-1 pr-6 text-[#131118] focus:outline-none`}
                  >
                    <option value="best-seller">Best Seller</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="reviews">Most Reviewed</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-0.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-800" />
                </div>
              </div>
            </div>

            {filteredServices.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full rounded-none border border-dashed border-neutral-300 bg-neutral-50/50 py-20 text-center"
              >
                <SlidersHorizontal
                  className="mx-auto mb-4 h-12 w-12 text-neutral-300"
                  strokeWidth={1.5}
                />
                <h3 className={`${discoverHeadline} mb-1 text-lg text-[#131118]`}>
                  No services match your filters
                </h3>
                <p className={`${discoverBody} mx-auto mb-6 max-w-sm text-sm text-neutral-500`}>
                  Try clearing some criteria or sliders to discover more options available in our
                  marketplace.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={`${discoverMedium} cursor-pointer rounded-none bg-black px-6 py-2.5 text-sm text-white transition-colors hover:bg-neutral-800`}
                >
                  Reset Active Filters
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredServices.map((card) => {
                    const isFav = !!favorites[card.id];
                    const hasMultiImages = !!card.images && card.images.length > 0;
                    const activeSlideIdx = cardSlideIndex[card.id] ?? 0;
                    const displayImage =
                      hasMultiImages && card.images ? card.images[activeSlideIdx] : card.image;

                    return (
                      <motion.div
                        layout
                        key={card.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col justify-between overflow-hidden rounded-none border border-neutral-300 bg-white"
                      >
                        <div className="group relative aspect-[1.18/1] w-full flex-shrink-0 overflow-hidden bg-neutral-100">
                          <img
                            src={displayImage}
                            alt={card.title}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />

                          {hasMultiImages && card.images && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleCardPrevSlide(card.id, card.images!.length, e)}
                                className="absolute left-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-neutral-800 opacity-0 shadow transition-opacity group-hover:opacity-100"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleCardNextSlide(card.id, card.images!.length, e)}
                                className="absolute right-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-neutral-800 opacity-0 shadow transition-opacity group-hover:opacity-100"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/20 px-2 py-0.5 backdrop-blur-[1px]">
                                {card.images.map((_, idx) => (
                                  <span
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                      activeSlideIdx === idx ? 'w-3 bg-white' : 'w-1.5 bg-white/60'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(card.id, e)}
                            className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-100/50 bg-white text-black shadow transition-all hover:scale-105 active:scale-95"
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

                        <div className="flex flex-1 flex-col justify-between p-5">
                          <div>
                            <span className="mb-1 block text-xs font-normal text-neutral-400 sm:text-[13px]">
                              {card.category}
                            </span>
                            <h3
                              className={`${discoverBody} mb-2.5 line-clamp-2 text-sm font-normal leading-snug text-[#131118] transition-colors hover:text-emerald-600 sm:text-[15px]`}
                            >
                              {card.title}
                            </h3>
                            <div className="mt-1 flex items-center gap-1 text-[13px] text-neutral-400">
                              <Star className="h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                              <span className="font-normal text-neutral-800">{card.rating}</span>
                              <span className="text-neutral-500">{card.reviews} reviews</span>
                            </div>
                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-neutral-300 pt-4">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full border border-neutral-200/60">
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
                              <span className="truncate text-xs font-normal text-neutral-500">
                                {card.author.name}
                              </span>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-1 text-right">
                              <span className="text-[10px] font-normal leading-none text-neutral-400">
                                Starting at
                              </span>
                              <span className={`${discoverBody} text-[14px] font-normal text-neutral-800 sm:text-[15px]`}>
                                {formatNPR(card.startingPrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            <div className="mt-16 flex flex-col items-center justify-center gap-4 pt-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-all hover:border-neutral-400 hover:text-neutral-700"
                  title="Previous Page"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
                </button>

                <div className="flex items-center gap-1.5 md:gap-2">
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-full text-[15px] transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-[#52B788] font-semibold text-white shadow-sm'
                          : 'font-normal text-neutral-800 hover:text-[#52B788]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <span className="flex h-[50px] w-[40px] select-none items-end justify-center pb-3 text-base font-medium text-neutral-400">
                    ...
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(20)}
                    className={`flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-full text-[15px] transition-all duration-200 ${
                      currentPage === 20
                        ? 'bg-[#52B788] font-semibold text-white shadow-sm'
                        : 'font-normal text-neutral-800 hover:text-[#52B788]'
                    }`}
                  >
                    20
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(20, prev + 1))}
                  className="flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-full border border-black text-black transition-all hover:bg-neutral-50"
                  title="Next Page"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>

              <div className={`${discoverBody} mt-1 text-[14px] font-light tracking-wide text-neutral-800 md:text-base`}>
                1 – 20 of 300+ services available
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterAccordion({
  title,
  open,
  onToggle,
  children,
  bordered = true,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <div className={bordered ? 'border-b border-neutral-100 pb-5' : 'pb-5'}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between py-1 text-left text-[#131118]"
      >
        <span className={`${discoverHeadline} text-[18px] font-semibold tracking-wide`}>{title}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 text-neutral-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-neutral-400" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckboxList({
  items,
  selected,
  onToggle,
}: {
  items: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="mt-1 space-y-[18px]">
      {items.map((item) => {
        const isChecked = selected.includes(item);
        return (
          <label key={item} className="group flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onToggle(item)}
              className="h-[18px] w-[18px] flex-shrink-0 cursor-pointer rounded border border-neutral-300 accent-black"
            />
            <span className="text-[16px] leading-tight text-neutral-700 transition-colors group-hover:text-black">
              {item}
            </span>
          </label>
        );
      })}
    </div>
  );
}
