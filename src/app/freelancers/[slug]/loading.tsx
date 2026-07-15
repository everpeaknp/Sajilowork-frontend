import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';

export default function FreelancerSlugLoading() {
  return (
    <div className="mobile-bottom-nav-offset min-h-screen bg-white pb-4 md:pb-0 dark:bg-neutral-950">
      <Navbar />
      <main className="w-full max-w-none px-0 py-0">
        <div className="animate-pulse" aria-busy="true" aria-label="Loading profile">
          <div className="mx-auto mb-8 min-h-[240px] max-w-5xl rounded-[24px] bg-neutral-100 dark:bg-neutral-900" />
          <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
            <div className="h-4 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-4 w-5/6 rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
              <div className="h-32 rounded bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-32 rounded bg-neutral-100 dark:bg-neutral-800" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
