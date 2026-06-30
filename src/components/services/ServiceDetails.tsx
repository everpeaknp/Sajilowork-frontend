'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import SingleServicePage from '@/components/services/SingleServicePage';
import { fetchPublicServiceBySlug } from '@/lib/serviceApi';
import type { Service } from './serviceListData';

interface ServiceDetailsProps {
  serviceSlug: string;
  onClose: () => void;
}

export default function ServiceDetails({ serviceSlug, onClose }: ServiceDetailsProps) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void fetchPublicServiceBySlug(serviceSlug)
      .then((data) => {
        if (!cancelled) setService(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceSlug]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="absolute inset-0 z-[50] flex max-w-[100vw] flex-col overflow-x-hidden overflow-y-auto bg-white"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-[60] rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 sm:right-4 sm:top-4"
        title="Close"
        aria-label="Close service details"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading service…
        </div>
      ) : service ? (
        <SingleServicePage service={service} />
      ) : (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-neutral-500">
          Service not found.
        </div>
      )}
    </motion.div>
  );
}
