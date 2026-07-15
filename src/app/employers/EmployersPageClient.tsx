'use client';

import '@/components/LangingHome/landing-home.css';
import { discoverPageRoot, discoverPageTypo } from '@/components/LangingHome/landingTypography';
import { EmployersContent } from '@/components/employers';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import type { Employer } from '@/components/employers/employerData';

type EmployersPageClientProps = {
  initialEmployers?: Employer[];
};

export default function EmployersPageClient({
  initialEmployers,
}: EmployersPageClientProps) {
  return (
    <div
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-hidden bg-white selection:bg-[#1161fe] selection:text-white dark:bg-neutral-950 dark:selection:bg-brand-emerald`}
    >
      <Navbar />
      <main className="pb-2 md:pb-0">
        <EmployersContent initialEmployers={initialEmployers} />
      </main>
      <Footer />
    </div>
  );
}
