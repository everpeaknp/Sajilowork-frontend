'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import SingleProjectPage from '@/components/projects/SingleProjectPage';
import { fetchPublicProjectBySlug } from '@/lib/projectApi';
import { PROJECT_MAP_PATH } from '@/lib/projectBrowsePath';
import type { Project } from './projectListData';

interface ProjectDetailsProps {
  projectSlug: string;
  onClose: () => void;
}

export default function ProjectDetails({ projectSlug, onClose }: ProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void fetchPublicProjectBySlug(projectSlug)
      .then((data) => {
        if (!cancelled) setProject(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectSlug]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="absolute inset-0 z-[50] flex max-w-[100vw] flex-col overflow-x-hidden overflow-y-auto bg-white dark:bg-neutral-950"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-[60] rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 sm:right-4 sm:top-4 dark:hover:bg-neutral-800"
        title="Close"
        aria-label="Close project details"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading project…
        </div>
      ) : project ? (
        <SingleProjectPage
          project={project}
          proposalPresentation="modal"
          variant="overlay"
          backLink={{ href: PROJECT_MAP_PATH, label: 'Back to project map' }}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-neutral-500">
          Project not found.
        </div>
      )}
    </motion.div>
  );
}
