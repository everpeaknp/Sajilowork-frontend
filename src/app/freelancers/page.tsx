'use client';

import '@/components/LangingHome/landing-home.css';
import { discoverPageRoot, discoverPageTypo } from '@/components/LangingHome/landingTypography';
import { FreelancersContent } from '@/components/freelancers';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';

export default function FreelancersPage() {
  return (
    <div
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-hidden bg-white text-black selection:bg-[#1161fe] selection:text-white [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal [&_span]:tracking-tight`}
    >
      <Navbar />
      <main className="pb-2 md:pb-0">
        <FreelancersContent />
      </main>
      <Footer />
    </div>
  );
}
