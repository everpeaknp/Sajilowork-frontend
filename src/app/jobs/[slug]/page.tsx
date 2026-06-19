'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import '@/components/LangingHome/landing-home.css';
import { discoverDmSans } from '@/components/LangingHome/landingTypography';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import SingleJobPage from '@/components/jobs/SingleJobPage';
import JobDetailSkeleton from '@/components/jobs/JobDetailSkeleton';
import type { Job } from '@/components/jobs/jobListData';
import {
  fetchPublicJobBySlug,
  fetchPublicJobs,
  getRelatedJobsFromList,
} from '@/lib/jobApi';

export default function JobSlugPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
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

    void Promise.all([fetchPublicJobBySlug(slug), fetchPublicJobs()])
      .then(([apiJob, allJobs]) => {
        if (cancelled) return;
        if (apiJob) {
          setJob(apiJob);
          setRelatedJobs(getRelatedJobsFromList(apiJob, allJobs, 3));
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

  if (loading || !job) {
    return (
      <div
        className={`${discoverDmSans} discover-page antialiased mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white font-normal text-black selection:bg-[#1161fe] selection:text-white tracking-tight`}
      >
        <Navbar />
        <main className="w-full max-w-none overflow-x-clip px-0 py-0 pb-2 md:pb-0">
          <JobDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className={`${discoverDmSans} discover-page antialiased mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white font-normal text-black selection:bg-[#1161fe] selection:text-white [&_a]:font-normal [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal tracking-tight`}
    >
      <Navbar />
      <main className="w-full max-w-none overflow-x-clip px-0 py-0 pb-2 md:pb-0">
        <SingleJobPage job={job} relatedJobs={relatedJobs} applicationPresentation="modal" />
      </main>
      <Footer />
    </div>
  );
}
