'use client';

import '@/components/LangingHome/landing-home.css';
import { discoverPageRoot, discoverPageTypo } from '@/components/LangingHome/landingTypography';
import { useRouter } from 'next/navigation';
import { ServicesHero, BestServices, AvailableServices } from '@/components/services';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';

export default function ServicesPage() {
  const router = useRouter();

  return (
    <div
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-hidden bg-white selection:bg-[#1161fe] selection:text-white`}
    >
      <Navbar />
      <main className="pb-2 md:pb-0">
        <ServicesHero
          onPostWithTitle={(title) => {
            router.push(`/post-task?title=${encodeURIComponent(title)}`);
          }}
        />
        <BestServices />
        <AvailableServices />
      </main>
      <Footer />
    </div>
  );
}
