'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/common/UserAvatar';
import { formatNPR, shortenCommaSeparatedLocation } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import { bidService, extractBidList } from '@/services/bid.service';
import type { Bid } from '@/types';
import { getDashboardProposalDetailHref } from './dashboardTabs';
import {
  DASHBOARD_CARD_PLAIN,
  DASHBOARD_HEADING_MD,
  DASHBOARD_PAGE_ROOT,
} from './dashboardResponsive';

function formatDisplayDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatLocation(value?: string | null): string {
  const raw = value?.trim();
  if (!raw || /^remote$/i.test(raw)) return 'Remote';
  return shortenCommaSeparatedLocation(raw, 1);
}

function getTaskerName(tasker: Bid['tasker']): string {
  const full = [tasker.first_name, tasker.last_name].filter(Boolean).join(' ').trim();
  return full || tasker.username || 'Freelancer';
}

export default function DashboardContracts() {
  const { isCustomer, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Bid[]>([]);

  const loadContracts = useCallback(async () => {
    if (!isAuthenticated) {
      setContracts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = isCustomer
        ? await bidService.getReceivedBids()
        : await bidService.getMyBids();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load contracts');
      }
      const accepted = extractBidList(response.data).filter((bid) => bid.status === 'accepted');
      setContracts(accepted);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load contracts';
      toast.error(message);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    void loadContracts();
  }, [loadContracts]);

  const subtitle = useMemo(
    () =>
      isCustomer
        ? 'Active agreements with freelancers on your accepted offers.'
        : 'Work you are under contract to deliver after an accepted proposal.',
    [isCustomer],
  );

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} space-y-6`}>
      <div>
        <h1 className={DASHBOARD_HEADING_MD}>Contracts</h1>
        <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>
      </div>

      <div className={`${DASHBOARD_CARD_PLAIN} rounded-xl sm:rounded-2xl md:p-8`}>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#52C47F]" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-neutral-900">No active contracts yet</p>
            <p className="mt-2 text-sm text-neutral-500">
              {isCustomer
                ? 'Accepted proposals on your listings will appear here.'
                : 'When an employer accepts your proposal, the contract shows up here.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {contracts.map((bid) => {
              const detailHref =
                bid.task_slug && bid.id
                  ? getDashboardProposalDetailHref(bid.task_slug, bid.id)
                  : null;
              const counterpartyName = isCustomer
                ? getTaskerName(bid.tasker)
                : bid.task_owner_business_name?.trim() ||
                  bid.task_owner_name?.trim() ||
                  'Employer';
              const avatarSrc = isCustomer
                ? bid.tasker?.profile_image
                : bid.task_owner_logo_url;

              return (
                <li key={bid.id}>
                  <Link
                    href={detailHref ?? '#'}
                    className={`flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between ${
                      detailHref ? 'hover:bg-neutral-50/80 -mx-2 rounded-xl px-2' : 'pointer-events-none'
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <UserAvatar
                        src={avatarSrc ? getMediaUrl(avatarSrc) : undefined}
                        name={counterpartyName}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-900">
                          {bid.task_title || 'Listing'}
                        </p>
                        <p className="mt-0.5 text-sm text-neutral-600">
                          {isCustomer ? `With ${counterpartyName}` : `For ${counterpartyName}`}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {formatLocation(bid.task_city)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDisplayDate(bid.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatNPR(Number(bid.amount) || 0)}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-[#52C47F]/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[#2e6b4e]">
                        Accepted
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
