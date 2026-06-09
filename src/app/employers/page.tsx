'use client';

import '@/components/LangingHome/landing-home.css';
import { discoverPageRoot, discoverPageTypo } from '@/components/LangingHome/landingTypography';
import { EmployersContent } from '@/components/employers';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';

export default function EmployersPage() {
  return (
    <div
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-hidden bg-white selection:bg-[#1161fe] selection:text-white`}
    >
      <Navbar />
      <main className="pb-2 md:pb-0">
        <EmployersContent />
      </main>
      <Footer />
    </div>
  );
}
