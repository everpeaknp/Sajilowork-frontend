'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import '@/components/LangingHome/landing-home.css';
import { discoverDmSans } from '@/components/LangingHome/landingTypography';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import SingleProjectPage from '@/components/projects/SingleProjectPage';
import type { Project } from '@/components/projects/projectListData';
import { fetchPublicProjectBySlug } from '@/lib/projectApi';

export default function ProjectSlugPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [project, setProject] = useState<Project | null>(null);
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

    void fetchPublicProjectBySlug(slug)
      .then((apiProject) => {
        if (cancelled) return;
        if (apiProject) {
          setProject(apiProject);
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

  if (loading || !project) {
    return (
      <div
        className={`${discoverDmSans} discover-page antialiased mobile-bottom-nav-offset flex min-h-screen items-center justify-center bg-white text-sm text-neutral-500`}
      >
        Loading project…
      </div>
    );
  }

  return (
    <div
      className={`${discoverDmSans} discover-page antialiased mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white font-normal text-black selection:bg-[#1161fe] selection:text-white [&_a]:font-normal [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal tracking-tight`}
    >
      <Navbar />
      <main className="w-full max-w-none overflow-x-clip px-0 py-0 pb-2 md:pb-0">
        <SingleProjectPage project={project} proposalPresentation="modal" />
      </main>
      <Footer />
    </div>
  );
}
