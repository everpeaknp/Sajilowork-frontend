'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import '@/components/LangingHome/landing-home.css';
import { discoverDmSans } from '@/components/LangingHome/landingTypography';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import SingleServicePage from '@/components/services/SingleServicePage';
import type { Service } from '@/components/services/serviceListData';
import { fetchPublicServiceBySlug } from '@/lib/serviceApi';

export default function ServiceSlugPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFoundState(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFoundState(false);

    void fetchPublicServiceBySlug(slug)
      .then((apiService) => {
        if (cancelled) return;
        if (apiService) {
          setService(apiService);
          return;
        }
        setNotFoundState(true);
      })
      .catch(() => {
        if (cancelled) return;
        setNotFoundState(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug || notFoundState) {
    notFound();
  }

  if (loading || !service) {
    return (
      <div
        className={`${discoverDmSans} discover-page antialiased mobile-bottom-nav-offset flex min-h-screen items-center justify-center bg-white text-sm text-neutral-500`}
      >
        Loading service…
      </div>
    );
  }

  return (
    <div
      className={`${discoverDmSans} discover-page antialiased mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white font-normal text-black selection:bg-[#1161fe] selection:text-white [&_a]:font-normal [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal tracking-tight`}
    >
      <Navbar />
      <main className="w-full max-w-none overflow-x-clip px-0 py-0 pb-2 md:pb-0">
        <SingleServicePage service={service} />
      </main>
      <Footer />
    </div>
  );
}
