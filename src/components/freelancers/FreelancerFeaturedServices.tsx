'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart, Check, X, ShieldCheck, Zap } from 'lucide-react';
import { formatNPR } from '@/lib/nepalLocale';
import {
  buildFreelancerFeaturedServices,
  type Freelancer,
  type FreelancerFeaturedServiceItem,
} from './freelancerData';

interface FreelancerFeaturedServicesProps {
  freelancer: Freelancer;
  services?: FreelancerFeaturedServiceItem[];
}

export default function FreelancerFeaturedServices({
  freelancer,
  services,
}: FreelancerFeaturedServicesProps) {
  const featuredServices = useMemo(
    () => services ?? buildFreelancerFeaturedServices(freelancer),
    [freelancer, services],
  );

  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [selectedService, setSelectedService] = useState<FreelancerFeaturedServiceItem | null>(
    null,
  );
  const [showToast, setShowToast] = useState<string | null>(null);

  const toggleFavorite = (id: string, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const isNowFavorite = !favorites[id];
    setFavorites((prev) => ({ ...prev, [id]: isNowFavorite }));

    if (isNowFavorite) {
      setShowToast('Saved to your favorites list!');
      window.setTimeout(() => setShowToast(null), 2500);
    }
  };

  const showToastMessage = (message: string) => {
    setShowToast(message);
    window.setTimeout(() => setShowToast(null), 2500);
  };

  return (
    <div className="mt-10 w-full">
      <h3 className="mb-8 text-xl font-normal tracking-tight text-black sm:text-2xl">
        Featured Services
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featuredServices.map((service, idx) => {
          const isLiked = Boolean(favorites[service.id]);

          return (
            <motion.div
              key={service.id}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-200/60 bg-white shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-md"
              onClick={() => setSelectedService(service)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-neutral-100 bg-neutral-50">
                <img
                  src={service.image}
                  alt={service.category}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-normal uppercase tracking-wider text-black shadow-sm backdrop-blur-sm">
                  Staff Pick
                </span>

                <button
                  type="button"
                  onClick={(event) => toggleFavorite(service.id, event)}
                  className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-neutral-200/20 bg-white text-neutral-600 shadow-sm transition-all hover:scale-110 hover:text-rose-500 active:scale-95"
                  aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    className={`h-4 w-4 transition-colors ${
                      isLiked
                        ? 'fill-rose-500 text-rose-500 stroke-rose-500'
                        : 'stroke-[2] text-neutral-500'
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <span className="text-xs font-normal uppercase leading-none tracking-wider text-black">
                    {service.category}
                  </span>

                  <h4 className="mt-2 line-clamp-2 text-sm font-normal leading-snug tracking-tight text-black transition-colors group-hover:text-[#52C47F] md:text-base">
                    {service.title}
                  </h4>

                  <div className="mt-3 flex select-none items-center gap-1.5 text-xs font-normal text-neutral-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 stroke-[1.5]" />
                    <span className="font-normal text-black">{service.rating}</span>
                    <span>{service.reviews} reviews</span>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-3.5 w-full border-t border-neutral-100" />

                  <div className="flex select-none items-baseline justify-between">
                    <span className="text-xs font-normal lowercase text-neutral-400">Starting at</span>
                    <span className="text-base font-normal tracking-tight text-black">
                      {formatNPR(service.startingPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 select-none items-center gap-2.5 rounded-full border border-neutral-800 bg-[#131118] px-5 py-3.5 text-xs font-normal text-white shadow-lg"
          >
            <Zap className="h-4 w-4 fill-emerald-400 text-emerald-400" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedService && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/45 p-4 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[24px] border border-neutral-100 bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="absolute right-5 top-5 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-100 bg-white/90 text-neutral-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-neutral-100"
                aria-label="Close service overview"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative h-[220px] w-full bg-neutral-100">
                <img
                  src={selectedService.image}
                  alt={selectedService.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-6 right-6">
                  <span className="text-[10px] font-normal uppercase tracking-wider text-emerald-400">
                    {selectedService.category}
                  </span>
                  <h4 className="mt-1 text-lg font-normal tracking-tight text-white sm:text-xl">
                    {selectedService.title}
                  </h4>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <span className="mb-2.5 block text-xs font-normal uppercase tracking-wider text-black">
                  Service Description
                </span>
                <p className="mb-6 text-xs font-normal leading-relaxed text-black sm:text-sm">
                  {selectedService.description}
                </p>

                <span className="mb-3.5 block text-xs font-normal uppercase tracking-wider text-black">
                  What is included in this offer:
                </span>
                <div className="mb-8 flex max-w-lg flex-col gap-2.5">
                  {selectedService.details.map((bullet) => (
                    <div key={bullet} className="flex items-center gap-2.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span className="text-xs font-normal text-black sm:text-sm">
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
                  <div className="flex select-none flex-col">
                    <span className="text-[10px] font-normal uppercase text-neutral-400">
                      Budget Starting Price
                    </span>
                    <span className="mt-0.5 text-xl font-normal tracking-tight text-black">
                      {formatNPR(selectedService.startingPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className="cursor-pointer rounded-xl px-4 py-2.5 text-xs font-normal text-neutral-500 transition-colors hover:bg-neutral-50"
                    >
                      Close Overview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedService(null);
                        showToastMessage('Direct consultation opened!');
                      }}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#52C47F] px-5 py-3 text-xs font-normal text-white shadow-sm transition-all hover:bg-[#43a86c] active:scale-[0.97]"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Order Service</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
