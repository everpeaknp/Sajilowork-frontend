import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import CancellationPolicyContent from '@/components/legal/CancellationPolicyContent';

export const metadata = {
  title: 'Cancellation policy | tasknepal',
  description: 'How task cancellations, fees, escrow refunds, and moderation work on tasknepal.',
};

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <Link
          href="/task"
          className="inline-flex items-center gap-2 text-primary font-semibold text-sm md:text-base mb-8 hover:underline"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden />
          Back to browse tasks
        </Link>
        <CancellationPolicyContent />
      </main>
      <Footer />
    </div>
  );
}
