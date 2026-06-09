'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageItem {
  id: string;
  url: string;
  alt: string;
}

interface EmployerGalleryProps {
  images?: ImageItem[];
}

const DEFAULT_IMAGES: ImageItem[] = [
  {
    id: 'img-1',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    alt: 'Relaxed workspace setting with bookcases and modern laptop desktop',
  },
  {
    id: 'img-2',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    alt: 'Concentrated specialist looking at visual projects on notebook screen',
  },
  {
    id: 'img-3',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    alt: 'Professional coder typing on keyboard with active development IDE',
  },
  {
    id: 'img-4',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    alt: 'Creative developer sketching mobile wires sitting comfortably on a couch',
  },
  {
    id: 'img-5',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    alt: 'Dynamic frontend team sharing layout perspectives in creative launchroom',
  },
];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (dir: number) => ({
    x: dir < 0 ? 300 : -300,
    opacity: 0,
    transition: {
      x: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
};

export default function EmployerGallery({ images }: EmployerGalleryProps) {
  const galleryImages = images ?? DEFAULT_IMAGES;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleThumbnailClick = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  return (
    <div className="space-y-4" id="employer-office-gallery">
      <div className="group relative aspect-[5/4] overflow-hidden border border-neutral-200/65 bg-neutral-100 shadow-inner sm:aspect-[4/3] md:min-h-[440px] lg:min-h-[520px] md:aspect-auto">
        <div className="absolute inset-0 select-none">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.img
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              src={galleryImages[activeIndex].url}
              alt={galleryImages[activeIndex].alt}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent p-5 pt-12 text-white">
          <p className="line-clamp-1 text-xs font-normal leading-relaxed tracking-tight sm:text-sm">
            {galleryImages[activeIndex].alt}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-md transition-all hover:bg-neutral-50 active:scale-90 sm:h-11 sm:w-11"
          aria-label="Previous image"
          id="btn-gallery-prev"
        >
          <ArrowLeft className="h-4 w-4 text-neutral-800 sm:h-5 sm:w-5" strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-md transition-all hover:bg-neutral-50 active:scale-90 sm:h-11 sm:w-11"
          aria-label="Next image"
          id="btn-gallery-next"
        >
          <ArrowRight className="h-4 w-4 text-neutral-800 sm:h-5 sm:w-5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {galleryImages.map((img, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => handleThumbnailClick(idx)}
              className={`relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300 focus:outline-none sm:rounded-2xl ${
                isActive
                  ? 'scale-95 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-transparent hover:scale-[1.02] hover:border-neutral-300'
              }`}
              id={`btn-gallery-thumb-${idx}`}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                className={`h-full w-full object-cover transition-all duration-500 ${
                  isActive ? 'brightness-105' : 'brightness-85 hover:brightness-100'
                }`}
                referrerPolicy="no-referrer"
              />
              {isActive ? <div className="pointer-events-none absolute inset-0 bg-emerald-500/10" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
