'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import { disputeService, type Dispute } from '@/services/dispute.service';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  under_review: 'Under review',
  resolved: 'Resolved',
  closed: 'Closed',
  escalated: 'Escalated',
};

export default function DisputesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await disputeService.list();
      if (res.success && res.data) setDisputes(res.data);
      else setDisputes([]);
    } catch {
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) void load();
    if (!authLoading && !isAuthenticated) setLoading(false);
  }, [authLoading, isAuthenticated, load]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-[#0a1452]">My disputes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track disputes you have raised or are involved in.
        </p>

        {!authLoading && !isAuthenticated && (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center">
            <p className="text-gray-600">Sign in to view your disputes.</p>
            <Link href="/signin?redirect=/disputes" className="mt-4 inline-block text-sm font-semibold text-[#005fff]">
              Sign in
            </Link>
          </div>
        )}

        {isAuthenticated && loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#005fff]" />
          </div>
        )}

        {isAuthenticated && !loading && disputes.length === 0 && (
          <div className="mt-8 flex flex-col items-center rounded-2xl bg-white py-16 text-center">
            <AlertTriangle className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-gray-600">No disputes yet.</p>
            <Link href="/my-tasks" className="mt-4 text-sm font-semibold text-[#005fff]">
              Go to my tasks
            </Link>
          </div>
        )}

        {isAuthenticated && !loading && disputes.length > 0 && (
          <ul className="mt-6 space-y-3">
            {disputes.map((d) => (
              <li key={d.id} className="rounded-2xl bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-[#0a1452]">{d.title}</h2>
                    <p className="mt-1 text-xs capitalize text-gray-400">
                      {d.dispute_type.replace('_', ' ')} ·{' '}
                      {d.created_at
                        ? formatDistanceToNow(new Date(d.created_at), { addSuffix: true })
                        : ''}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {STATUS_LABEL[d.status] ?? d.status}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-gray-600">{d.description}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
