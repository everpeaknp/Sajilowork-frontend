import { MarketplaceBrowseRowListSkeleton } from '@/components/common/MarketplaceBrowseSkeletons';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import { Hero } from '@/components/projects';

export default function ProjectsLoading() {
  return (
    <div className="mobile-bottom-nav-offset min-h-screen bg-white pb-4 md:pb-0">
      <Navbar />
      <main className="pb-2 md:pb-0">
        <Hero />
        <MarketplaceBrowseRowListSkeleton count={6} />
      </main>
      <Footer />
    </div>
  );
}
