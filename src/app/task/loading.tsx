import { MarketplaceBrowseRowListSkeleton } from '@/components/common/MarketplaceBrowseSkeletons';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import { TaskHero } from '@/components/task/browse';

export default function TaskLoading() {
  return (
    <div className="mobile-bottom-nav-offset min-h-screen bg-white pb-4 md:pb-0">
      <Navbar />
      <main className="pb-2 md:pb-0">
        <TaskHero />
        <MarketplaceBrowseRowListSkeleton count={6} />
      </main>
      <Footer />
    </div>
  );
}
