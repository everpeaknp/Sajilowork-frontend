'use client';

import '@/components/LangingHome/landing-home.css';
import { discoverDmSans } from '@/components/LangingHome/landingTypography';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import SingleProjectPage from '@/components/projects/SingleProjectPage';
import type { Project } from '@/components/projects/projectListData';

type ProjectSlugPageClientProps = {
  project: Project;
};

export default function ProjectSlugPageClient({ project }: ProjectSlugPageClientProps) {
  return (
    <div
      className={`${discoverDmSans} discover-page antialiased mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white font-normal text-black selection:bg-[#1161fe] selection:text-white dark:bg-neutral-950 dark:text-stone-100 dark:selection:bg-brand-emerald [&_a]:font-normal [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal tracking-tight`}
    >
      <Navbar />
      <main className="w-full max-w-none overflow-x-clip px-0 py-0 pb-2 md:pb-0">
        <SingleProjectPage project={project} proposalPresentation="modal" />
      </main>
      <Footer />
    </div>
  );
}
