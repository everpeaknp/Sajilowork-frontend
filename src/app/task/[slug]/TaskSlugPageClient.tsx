'use client';

import '@/components/LangingHome/landing-home.css';
import { discoverDmSans } from '@/components/LangingHome/landingTypography';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import SingleTaskPage from '@/components/task/page/SingleTaskPage';
import type { Task } from '@/types';

type TaskSlugPageClientProps = {
  task: Task;
};

export default function TaskSlugPageClient({ task }: TaskSlugPageClientProps) {
  return (
    <div
      className={`${discoverDmSans} discover-page antialiased mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white font-normal text-black selection:bg-[#1161fe] selection:text-white dark:bg-neutral-950 dark:text-stone-100 dark:selection:bg-brand-emerald [&_a]:font-normal [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal tracking-tight`}
    >
      <Navbar />
      <main className="w-full max-w-none overflow-x-clip px-0 py-0 pb-2 md:pb-0">
        <SingleTaskPage task={task} makeOfferPresentation="modal" />
      </main>
      <Footer />
    </div>
  );
}
