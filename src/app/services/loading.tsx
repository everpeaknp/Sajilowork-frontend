import { MarketplaceServiceGridSkeleton } from '@/components/common/MarketplaceBrowseSkeletons';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import { ServicesHero } from '@/components/services';

export default function ServicesLoading() {
  return (
    <div className="mobile-bottom-nav-offset min-h-screen bg-white pb-4 md:pb-0">
      <Navbar />
      <main className="pb-2 md:pb-0">
        <ServicesHero />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <MarketplaceServiceGridSkeleton count={8} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
