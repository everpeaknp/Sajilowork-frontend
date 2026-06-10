'use client';

import { useMemo, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import '@/components/LangingHome/landing-home.css';
import { discoverDmSans } from '@/components/LangingHome/landingTypography';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import SingleFreelancerPage from '@/components/freelancers/SingleFreelancerPage';
import { findFreelancerBySlug } from '@/components/freelancers/freelancerSlug';

export default function FreelancerSlugPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [notification, setNotification] = useState<string | null>(null);

  const freelancer = useMemo(() => (slug ? findFreelancerBySlug(slug) : undefined), [slug]);

  if (!slug) {
    notFound();
  }

  if (!freelancer) {
    notFound();
  }

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div
      className={`${discoverDmSans} discover-page subpixel-antialiased mobile-bottom-nav-offset min-h-screen overflow-x-hidden bg-white font-normal text-black selection:bg-[#1161fe] selection:text-white [&_a]:font-normal [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal tracking-tight`}
    >
      <Navbar />
      <main className="w-full max-w-none px-0 py-0">
        <AnimatePresence>
          {notification ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="sticky top-4 z-50 mx-auto mb-6 flex max-w-xl items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-normal text-emerald-800 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                <span>{notification}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="cursor-pointer rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <SingleFreelancerPage
          freelancer={freelancer}
          onInquire={(name) => triggerNotification(`Message sent to ${name}.`)}
        />
      </main>
      <Footer />
    </div>
  );
}
