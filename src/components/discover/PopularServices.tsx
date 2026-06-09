'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart } from 'lucide-react';
import { discoverBody, discoverHeadline, discoverMedium } from '@/components/LangingHome/landingTypography';
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

const SERVICES_BY_CATEGORY: Record<string, Service[]> = {
  'Development & IT': [
    {
      id: 'dev-1',
      category: 'Web & App Design',
      title: 'I will design modern websites in figma or adobe xd',
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
      startingPrice: 983,
    },
    {
      id: 'dev-2',
      category: 'Art & Illustration',
      title: 'I will create modern flat design illustration',
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
      startingPrice: 983,
    },
    {
      id: 'dev-3',
      category: 'Design & Creative',
      title:
        'I will build a fully responsive design in HTML,CSS, bootstrap, and javascript',
      rating: 4.82,
      reviews: 94,
      image:
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Wanda Runo',
        avatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 983,
    },
    {
      id: 'dev-4',
      category: 'Web & App Design',
      title: 'I will do mobile app development for ios and android',
      rating: 4.82,
      reviews: 94,
      image:
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Wanda Runo',
        avatar:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 983,
    },
    {
      id: 'dev-5',
      category: 'Software Architecture',
      title: 'I will design highly scalable AWS or Google Cloud architectures',
      rating: 4.89,
      reviews: 112,
      image:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Ali Tufan',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 1450,
    },
    {
      id: 'dev-6',
      category: 'E-Commerce Development',
      title: 'I will build high conversion Shopify or WooCommerce storefronts',
      rating: 4.93,
      reviews: 74,
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Wanda Runo',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 850,
    },
  ],
  'Design & Creative': [
    {
      id: 'des-1',
      category: 'Brand Styling',
      title: 'I will design minimalist brand guidelines and vector logotypes',
      rating: 4.95,
      reviews: 120,
      image:
        'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Emma Watson',
        avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 750,
    },
    {
      id: 'des-2',
      category: 'Packaging Design',
      title: 'I will construct premium eco-friendly product boxes & labels',
      rating: 4.88,
      reviews: 65,
      image:
        'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Marcus Thorne',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 1200,
    },
    {
      id: 'des-3',
      category: 'Game Art',
      title: 'I will design immersive 3D low poly game environments and characters',
      rating: 4.96,
      reviews: 43,
      image:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Marcus Thorne',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 650,
    },
    {
      id: 'des-4',
      category: '3D Rendering',
      title: 'I will create architectural hyper realistic interior walkthroughs',
      rating: 4.84,
      reviews: 51,
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Emma Watson',
        avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 1100,
    },
    {
      id: 'des-5',
      category: 'Illustration',
      title: 'I will draw custom vector children book covers and illustrations',
      rating: 4.97,
      reviews: 82,
      image:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Elena Rostova',
        avatar:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 320,
    },
    {
      id: 'des-6',
      category: 'NFT Generator',
      title: 'I will generate high fidelity unique digital collectibles and traits',
      rating: 4.75,
      reviews: 19,
      image:
        'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Ali Tufan',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 950,
    },
  ],
  'Digital Marketing': [
    {
      id: 'mkt-1',
      category: 'SEO Optimization',
      title: 'I will audit your online rankings and deploy advanced backlinks campaigns',
      rating: 4.91,
      reviews: 142,
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Amélie Laurent',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 450,
    },
    {
      id: 'mkt-2',
      category: 'Social Presence',
      title: 'I will operate as your personal organic social media growth manager',
      rating: 4.79,
      reviews: 88,
      image:
        'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Sven Gieler',
        avatar:
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100',
        online: false,
      },
      startingPrice: 620,
    },
    {
      id: 'mkt-3',
      category: 'Google Ads Specialist',
      title: 'I will set up high converting Google search ad campaigns',
      rating: 4.88,
      reviews: 35,
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Amélie Laurent',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 450,
    },
    {
      id: 'mkt-4',
      category: 'Social Identity',
      title: 'I will build cohesive organic brand templates for social handles',
      rating: 4.92,
      reviews: 62,
      image:
        'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Sven Gieler',
        avatar:
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100',
        online: false,
      },
      startingPrice: 280,
    },
    {
      id: 'mkt-5',
      category: 'Content Strategy',
      title: 'I will plan custom researched content systems to double organic leads',
      rating: 4.95,
      reviews: 41,
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Wanda Runo',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 500,
    },
    {
      id: 'mkt-6',
      category: 'Email Automation',
      title: 'I will deploy high revenue newsletter flows and templates in Klaviyo',
      rating: 4.81,
      reviews: 29,
      image:
        'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Emma Watson',
        avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 350,
    },
  ],
  'Music & Audio': [
    {
      id: 'aud-1',
      category: 'Voice Acting',
      title: 'I will record studio-quality warm podcast intros and deep advertisements',
      rating: 5.0,
      reviews: 57,
      image:
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Elena Rostova',
        avatar:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 350,
    },
    {
      id: 'aud-2',
      category: 'Mixing & Mastering',
      title: 'I will professionally mix and master your songs to industry loudness standard',
      rating: 4.94,
      reviews: 123,
      image:
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Elena Rostova',
        avatar:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 150,
    },
    {
      id: 'aud-3',
      category: 'Sound Design',
      title: 'I will synthesize custom cinematic audio sound effects for films and developers',
      rating: 4.9,
      reviews: 32,
      image:
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Sven Gieler',
        avatar:
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100',
        online: false,
      },
      startingPrice: 250,
    },
    {
      id: 'aud-4',
      category: 'Beat Making',
      title: 'I will produce original royalty-free lofi, trap, or pop background backing tracks',
      rating: 4.87,
      reviews: 45,
      image:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Ali Tufan',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 180,
    },
    {
      id: 'aud-5',
      category: 'Podcasting Assets',
      title: 'I will design custom intro theme music and premium sound idents',
      rating: 5.0,
      reviews: 14,
      image:
        'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Rajesh Kumar',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 300,
    },
    {
      id: 'aud-6',
      category: 'Audio Editing',
      title: 'I will isolate background noise, enhance speech compression, and edit audio logs',
      rating: 4.79,
      reviews: 22,
      image:
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Sarah Jenkins',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 80,
    },
  ],
  'Video & Animation': [
    {
      id: 'vid-1',
      category: 'Explainer Animator',
      title: 'I will craft cinematic 2D character-led product marketing videos',
      rating: 4.87,
      reviews: 104,
      image:
        'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Rajesh Kumar',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 850,
    },
    {
      id: 'vid-2',
      category: 'Video Editing',
      title: 'I will edit highly engaging YouTube blogs or corporate product campaigns',
      rating: 4.85,
      reviews: 89,
      image:
        'https://images.unsplash.com/photo-1574717024458-388ee486b247?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Rajesh Kumar',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 200,
    },
    {
      id: 'vid-3',
      category: 'Logo Animation',
      title: 'I will animate professional high finish neon or flat vector intro bumpers',
      rating: 4.92,
      reviews: 54,
      image:
        'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Marcus Thorne',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 120,
    },
    {
      id: 'vid-4',
      category: 'Color Correction',
      title: 'I will apply cinematic custom LUTs and matches to video timelines',
      rating: 4.96,
      reviews: 28,
      image:
        'https://images.unsplash.com/photo-1574717024458-388ee486b247?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Amélie Laurent',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 300,
    },
    {
      id: 'vid-5',
      category: 'Virtual Production',
      title: 'I will track, key, and render heavy green screen assets seamlessly',
      rating: 4.78,
      reviews: 16,
      image:
        'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Elena Rostova',
        avatar:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 500,
    },
    {
      id: 'vid-6',
      category: 'Reels & Shorts Editor',
      title: 'I will add popular kinetic text edits and overlays for high CTR results',
      rating: 4.89,
      reviews: 67,
      image:
        'https://images.unsplash.com/photo-1574717024458-388ee486b247?auto=format&fit=crop&q=80&w=400',
      author: {
        name: 'Wanda Runo',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
        online: true,
      },
      startingPrice: 90,
    },
  ],
};

const CATEGORIES = [
  'Development & IT',
  'Design & Creative',
  'Digital Marketing',
  'Music & Audio',
  'Video & Animation',
];

interface PopularServicesProps {
  className?: string;
}

export default function PopularServices({ className = '' }: PopularServicesProps) {
  const [activeCategory, setActiveCategory] = useState('Development & IT');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentServices = SERVICES_BY_CATEGORY[activeCategory] || [];

  return (
    <section
      className={`overflow-hidden bg-white px-6 py-16 sm:px-8 sm:py-20 lg:px-12 xl:px-16 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <h2
              className={`${discoverHeadline} mb-3 text-3xl leading-tight text-[#131118] sm:text-4xl`}
            >
              Popular Services
            </h2>
            <p className={`${discoverBody} text-sm text-[#5e586c] sm:text-base`}>
              Most viewed and all-time top-selling services
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {CATEGORIES.map((cat) => {
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

        <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {currentServices.map((service, idx) => {
              const isFav = !!favorites[service.id];
              return (
                <motion.div
                  key={service.id}
                  className="group mx-auto flex w-full max-w-[691px] flex-col overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-md md:h-[192px] md:max-w-none md:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="relative h-[192px] w-full flex-shrink-0 overflow-hidden bg-neutral-100 md:h-full md:w-[190px]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
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
                        <span className="font-medium text-neutral-800">{service.rating}</span>
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
