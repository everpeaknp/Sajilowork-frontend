import { MarketplaceServiceCarouselSkeleton } from '@/components/common/MarketplaceBrowseSkeletons';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import { Hero } from '@/components/discover';

export default function DiscoverLoading() {
  return (
    <div className="mobile-bottom-nav-offset min-h-screen bg-white pb-4 md:pb-0 dark:bg-neutral-950">
      <Navbar />
      <main className="pb-2 md:pb-0">
        <Hero />
        <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
          <MarketplaceServiceCarouselSkeleton count={4} />
          <MarketplaceServiceCarouselSkeleton count={4} />
        </div>
      </main>
      <Footer outerClassName="bg-[#FAF6F0] dark:bg-neutral-950" />
    </div>
  );
}
