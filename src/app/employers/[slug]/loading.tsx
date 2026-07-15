import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import EmployerDetailSkeleton from '@/components/employers/EmployerDetailSkeleton';

export default function EmployerSlugLoading() {
  return (
    <div className="mobile-bottom-nav-offset min-h-screen bg-white pb-4 md:pb-0 dark:bg-neutral-950">
      <Navbar />
      <main className="w-full max-w-none px-0 py-0">
        <EmployerDetailSkeleton />
      </main>
      <Footer />
    </div>
  );
}
