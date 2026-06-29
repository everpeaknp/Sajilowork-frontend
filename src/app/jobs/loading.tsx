import { MarketplaceJobGridSkeleton } from '@/components/common/MarketplaceBrowseSkeletons';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import { JobHero } from '@/components/jobs';

export default function JobsLoading() {
  return (
    <div className="mobile-bottom-nav-offset min-h-screen bg-white pb-4 md:pb-0">
      <Navbar />
      <main className="pb-2 md:pb-0">
        <JobHero />
        <MarketplaceJobGridSkeleton count={8} />
      </main>
      <Footer />
    </div>
  );
}
