import { MarketplaceFreelancerGridSkeleton } from '@/components/common/MarketplaceBrowseSkeletons';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import { FreelancerHero } from '@/components/freelancers';

export default function FreelancersLoading() {
  return (
    <div className="mobile-bottom-nav-offset min-h-screen bg-white pb-4 md:pb-0">
      <Navbar />
      <main className="pb-2 md:pb-0">
        <FreelancerHero />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <MarketplaceFreelancerGridSkeleton count={12} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
