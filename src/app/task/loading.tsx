import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import { TaskPageSkeleton } from '@/components/skeletons';

export default function TaskLoading() {
  return (
    <div className="mobile-bottom-nav-offset min-h-screen bg-white pb-4 dark:bg-neutral-950 md:pb-0">
      <Navbar />
      <main className="pb-2 md:pb-0">
        <TaskPageSkeleton />
      </main>
      <Footer />
    </div>
  );
}
