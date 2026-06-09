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

const sectionPad = '!py-12 sm:!py-14';
const sectionPadLoose = '!py-12 sm:!py-16';

export default function DiscoverPage() {
  const router = useRouter();

  return (
    <div
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-hidden bg-white selection:bg-brand-emerald selection:text-white`}
    >
      <Navbar />
      <main className="pb-2 md:pb-0">
        <Hero
          onPostWithTitle={(title) => {
            router.push(`/post-task?title=${encodeURIComponent(title)}`);
          }}
        />
        <Workflow className="!py-10 sm:!py-12 lg:!py-14" />
        {/* <CategoryCarousel
          onSelectCategory={(categoryName) => {
            router.push(`/post-task?title=${encodeURIComponent(categoryName)}`);
          }}
        /> */}
        <GridCategories
          className={sectionPad}
          onSelectGridCategory={(name) => {
            router.push(`/post-task?title=${encodeURIComponent(name)}`);
          }}
        />
        <PopularServices className={sectionPad} />
        <BottomCTA className="!pt-10 sm:!pt-14 !pb-6" />
        <DiscoverStats className="!pt-4 !pb-10 sm:!pt-5 sm:!pb-12" />
        <Testimonials className={sectionPadLoose} />
        <TrendingServices className={sectionPadLoose} />
        <OurBlog className={sectionPad} />
        <Partners className="!py-10 sm:!py-12" />
        <Newsletter className="!py-14 sm:!py-16" />
      </main>
      <Footer outerClassName="bg-[#FAF6F0]" />
    </div>
  );
}