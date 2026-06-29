import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import JobDetailSkeleton from '@/components/jobs/JobDetailSkeleton';

export default function JobDetailLoading() {
  return (
    <div className="mobile-bottom-nav-offset min-h-screen bg-white">
      <Navbar />
      <main className="w-full max-w-none px-0 py-0 pb-2 md:pb-0">
        <JobDetailSkeleton />
      </main>
      <Footer />
    </div>
  );
}
