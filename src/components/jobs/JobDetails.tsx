'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import SingleJobPage from '@/components/jobs/SingleJobPage';
import { mapTaskToPublicJob } from '@/lib/jobApi';
import { jobService } from '@/services/job.service';
import type { Job } from './jobListData';

interface JobDetailsProps {
  jobSlug: string;
  onClose: () => void;
}

export default function JobDetails({ jobSlug, onClose }: JobDetailsProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void jobService
      .getJobBySlug(jobSlug)
      .then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          setJob(mapTaskToPublicJob(response.data));
        } else {
          setJob(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobSlug]);

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
        aria-label="Close job details"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading job…
        </div>
      ) : job ? (
        <SingleJobPage job={job} applicationPresentation="modal" />
      ) : (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-neutral-500">
          Job not found.
        </div>
      )}
    </motion.div>
  );
}
