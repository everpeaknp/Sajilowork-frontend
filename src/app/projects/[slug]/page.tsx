'use client';

import { useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import '@/components/LangingHome/landing-home.css';
import { discoverDmSans } from '@/components/LangingHome/landingTypography';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import SingleProjectPage from '@/components/projects/SingleProjectPage';
import { findProjectBySlug } from '@/components/projects/projectSlug';

export default function ProjectSlugPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const project = useMemo(() => (slug ? findProjectBySlug(slug) : undefined), [slug]);

  if (!slug || !project) {
    notFound();
  }

  return (
    <div
      className={`${discoverDmSans} discover-page antialiased mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white font-normal text-black selection:bg-[#1161fe] selection:text-white [&_a]:font-normal [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal tracking-tight`}
    >
      <Navbar />
      <main className="w-full max-w-none px-0 py-0">
        <SingleProjectPage project={project} />
      </main>
      <Footer />
    </div>
  );
}
