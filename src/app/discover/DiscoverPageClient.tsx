'use client';

import '@/components/LangingHome/landing-home.css';
import { discoverPageRoot, discoverPageTypo } from '@/components/LangingHome/landingTypography';
import { useRouter } from 'next/navigation';
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
import { postTaskHref } from '@/lib/postTaskPath';
import type { Service } from '@/components/services/serviceListData';

const sectionPad = '!py-12 sm:!py-14';
const sectionPadLoose = '!py-12 sm:!py-16';

type DiscoverPageClientProps = {
  popularServices?: Service[];
  trendingServices?: Service[];
};

export default function DiscoverPageClient({
  popularServices,
  trendingServices,
}: DiscoverPageClientProps) {
  const router = useRouter();

  return (
    <div
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white pb-4 selection:bg-brand-emerald selection:text-white md:pb-0`}
    >
      <Navbar />
      <main className="pb-2 md:pb-0">
        <Hero
          onSearchSubmit={(query) => {
            const trimmed = query.trim();
            if (!trimmed) return;
            router.push(`/discover?q=${encodeURIComponent(trimmed)}`);
          }}
        />
        <Workflow className="!py-10 sm:!py-12 lg:!py-14" />
        <GridCategories
          className={sectionPad}
          onSelectGridCategory={(name) => {
            router.push(postTaskHref({ title: name }));
          }}
        />
        <PopularServices className={sectionPad} initialServices={popularServices} />
        <BottomCTA className="!pt-10 sm:!pt-14 !pb-6" />
        <DiscoverStats className="!pt-4 !pb-10 sm:!pt-5 sm:!pb-12" />
        <Testimonials className={sectionPadLoose} />
        <TrendingServices className={sectionPadLoose} initialServices={trendingServices} />
        <OurBlog className={sectionPad} />
        <Partners className="!py-10 sm:!py-12" />
        <Newsletter className="!py-14 sm:!py-16" />
      </main>
      <Footer outerClassName="bg-[#FAF6F0]" />
    </div>
  );
}
