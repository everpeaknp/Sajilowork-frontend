import { MarketplaceFreelancerGridSkeleton } from '@/components/common/MarketplaceBrowseSkeletons';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';

export default function EmployersLoading() {
  return (
    <div className="mobile-bottom-nav-offset min-h-screen bg-white pb-4 md:pb-0 dark:bg-neutral-950">
      <Navbar />
      <main className="pb-2 md:pb-0">
        <div className="mx-auto min-h-[200px] max-w-7xl animate-pulse rounded-[24px] bg-neutral-100 px-4 py-8 sm:px-6 lg:px-8 dark:bg-neutral-900" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <MarketplaceFreelancerGridSkeleton count={12} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
