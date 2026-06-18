'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@/components/LangingHome/landing-home.css';
import { discoverPageRoot, discoverPageTypo } from '@/components/LangingHome/landingTypography';
import Hero from '@/components/discover/Hero';
import Workflow from '@/components/discover/Workflow';
import GridCategories from '@/components/discover/GridCategories';
import PopularServices from '@/components/discover/PopularServices';
import BottomCTA from '@/components/discover/BottomCTA';
import DiscoverStats from '@/components/discover/DiscoverStats';
import Testimonials from '@/components/discover/Testimonials';
import TrendingServices from '@/components/discover/TrendingServices';
import OurBlog from '@/components/discover/OurBlog';
import Partners from '@/components/discover/Partners';
import Newsletter from '@/components/discover/Newsletter';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import HomeAuthRedirect from '@/app/_components/HomeAuthRedirect';

const sectionPad = '!py-12 sm:!py-14';
const sectionPadLoose = '!py-12 sm:!py-16';

export default function Home() {
  const router = useRouter();

  const handleCapture = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    const anchor = target.closest('a');
    if (anchor) {
      e.preventDefault();
      e.stopPropagation();
      router.push('/signin');
      return;
    }

    const button = target.closest('button');
    if (button) {
      const ariaLabel = button.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.startsWith('Scroll')) {
        return; // Allow carousel buttons to work
      }
      e.preventDefault();
      e.stopPropagation();
      router.push('/signin');
    }
  };

  return (
    <div
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white pb-4 selection:bg-brand-emerald selection:text-white md:pb-0`}
    >
      <HomeAuthRedirect />
      <Navbar />
      <main className="pb-2 md:pb-0" onClickCapture={handleCapture}>
        <Hero onSearchSubmit={() => router.push('/signin')} />
        <Workflow className="!py-10 sm:!py-12 lg:!py-14" />
        <GridCategories
          className={sectionPad}
          onSelectGridCategory={() => router.push('/signin')}
        />
        <PopularServices className={sectionPad} />
        <BottomCTA className="!pt-10 sm:!pt-14 !pb-6" />
        <DiscoverStats className="!pt-4 !pb-10 sm:!pt-5 sm:!pb-12" />
        <Testimonials className={`${sectionPadLoose} !pb-8 sm:!pb-10`} />
        <TrendingServices className={`${sectionPadLoose} !pt-12 sm:!pt-14`} />
        <OurBlog className={sectionPad} />
        <Partners className="!py-10 sm:!py-12" />
        <Newsletter className="!py-14 sm:!py-16" />
      </main>
      <Footer outerClassName="bg-[#FAF6F0]" />
    </div>
  );
}
