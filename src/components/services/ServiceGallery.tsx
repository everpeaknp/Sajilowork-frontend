'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface ServiceGalleryProps {
  images: string[];
  altPrefix?: string;
}

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

function toGalleryImages(urls: string[], altPrefix: string): GalleryImage[] {
  return urls.map((url, index) => ({
    id: `service-gallery-${index}`,
    url,
    alt: `${altPrefix} — preview ${index + 1}`,
  }));
}

export default function ServiceGallery({ images, altPrefix = 'Service gallery' }: ServiceGalleryProps) {
  const galleryImages = useMemo(() => toGalleryImages(images, altPrefix), [images, altPrefix]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  if (galleryImages.length === 0) return null;

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
    <div className="space-y-4" id="service-gallery">
      <div className="group relative aspect-[5/4] overflow-hidden border border-neutral-200/65 bg-neutral-100 shadow-inner sm:aspect-[4/3] md:aspect-auto md:min-h-[440px] lg:min-h-[520px] dark:border-neutral-800 dark:bg-neutral-900">
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

        {galleryImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-md transition-all hover:bg-neutral-50 active:scale-90 sm:h-11 sm:w-11 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:hover:bg-neutral-800"
              aria-label="Previous image"
            >
              <ArrowLeft className="h-4 w-4 text-neutral-800 sm:h-5 sm:w-5 dark:text-stone-100" strokeWidth={2.5} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-md transition-all hover:bg-neutral-50 active:scale-90 sm:h-11 sm:w-11 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:hover:bg-neutral-800"
              aria-label="Next image"
            >
              <ArrowRight className="h-4 w-4 text-neutral-800 sm:h-5 sm:w-5 dark:text-stone-100" strokeWidth={2.5} />
            </button>
          </>
        ) : null}
      </div>

      {galleryImages.length > 1 ? (
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
                aria-label={`View image ${idx + 1}`}
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
      ) : null}
    </div>
  );
}
