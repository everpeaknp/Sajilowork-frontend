'use client';

import { useEffect, useMemo, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import '@/components/LangingHome/landing-home.css';
import { discoverDmSans } from '@/components/LangingHome/landingTypography';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import SingleJobPage from '@/components/jobs/SingleJobPage';
import { findJobBySlug } from '@/components/jobs/jobSlug';
import { hydratePostedJobs } from '@/components/jobs/jobStore';
import type { Job } from '@/components/jobs/jobListData';

export default function JobSlugPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [job, setJob] = useState<Job | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydratePostedJobs();
    setJob(slug ? findJobBySlug(slug) : undefined);
    setReady(true);
  }, [slug]);

  const cachedJob = useMemo(() => (slug ? findJobBySlug(slug) : undefined), [slug]);
  const resolvedJob = ready ? job : cachedJob;

  if (!slug) {
    notFound();
  }

  if (ready && !resolvedJob) {
    notFound();
  }

  if (!resolvedJob) {
    return null;
  }

  return (
    <div
      className={`${discoverDmSans} discover-page antialiased mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white font-normal text-black selection:bg-[#1161fe] selection:text-white [&_a]:font-normal [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal tracking-tight`}
    >
      <Navbar />
      <main className="w-full max-w-none px-0 py-0">
        <SingleJobPage job={resolvedJob} />
      </main>
      <Footer />
    </div>
  );
}
