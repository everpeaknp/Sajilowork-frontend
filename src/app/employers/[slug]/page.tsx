'use client';

import { useMemo, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import '@/components/LangingHome/landing-home.css';
import { discoverPageRoot, discoverPageTypo } from '@/components/LangingHome/landingTypography';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import SingleEmployerPage from '@/components/employers/SingleEmployerPage';
import { findEmployerBySlug } from '@/components/employers/employerSlug';

export default function EmployerSlugPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [notification, setNotification] = useState<string | null>(null);

  const employer = useMemo(() => (slug ? findEmployerBySlug(slug) : undefined), [slug]);

  if (!slug) {
    notFound();
  }

  if (!employer) {
    notFound();
  }

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-hidden bg-white text-black selection:bg-[#1161fe] selection:text-white [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal`}
    >
      <Navbar />
      <main className="w-full max-w-none px-0 py-0">
        <AnimatePresence>
          {notification ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="sticky top-4 z-50 mx-auto mb-6 flex max-w-xl items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-sm"
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

        <SingleEmployerPage
          employer={employer}
          onContact={(name) => triggerNotification(`Message sent to ${name}.`)}
          onNotification={triggerNotification}
        />
      </main>
      <Footer />
    </div>
  );
}
