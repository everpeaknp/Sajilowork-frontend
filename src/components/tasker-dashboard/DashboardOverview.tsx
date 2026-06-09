'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Lock,
  HelpCircle,
  Loader2,
  Wallet,
  Briefcase,
  Search,
  ChevronRight,
  X,
} from 'lucide-react';
import { useTaskerStats } from '@/context/TaskerStatsContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { formatNPR } from '@/lib/nepalLocale';
import type { TaskerTierInfo, UserStats } from '@/services/dashboard.service';
import { walletService, type WalletBalance } from '@/services/wallet.service';
import {
  landingBody,
  landingBodyMuted,
  landingHeadline,
  landingHeadlineSm,
} from '@/components/LangingHome/landingTypography';

const DASHBOARD_TYPO = `${landingBody} [&_h1]:font-formula [&_h1]:font-black [&_h1]:tracking-tight [&_h2]:font-formula [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h3]:font-formula [&_h3]:font-bold [&_h3]:tracking-tight`;

const TIER_STYLES: Record<
  string,
  { ring: string; badge: string; gradient: string; border: string }
> = {
  bronze: {
    ring: 'from-orange-400/20 to-orange-600/20',
    badge: 'bg-orange-500 border-orange-700',
    gradient: 'bg-orange-800/10',
    border: 'border-orange-200',
  },
  silver: {
    ring: 'from-brand-emerald/10 to-brand-emerald/20',
    badge: 'bg-brand-emerald border-brand-emerald/20',
    gradient: 'bg-brand-emerald/10',
    border: 'border-brand-emerald/20',
  },
  gold: {
    ring: 'from-amber-400/20 to-amber-600/20',
    badge: 'bg-amber-500 border-amber-700',
    gradient: 'bg-amber-800/10',
    border: 'border-amber-200',
  },
  platinum: {
    ring: 'from-violet-400/20 to-violet-600/20',
    badge: 'bg-violet-600 border-violet-800',
    gradient: 'bg-violet-800/10',
    border: 'border-violet-200',
  },
};

function TierMedal({
  tier,
  locked = false,
  size = 'lg',
}: {
  tier: TaskerTierInfo;
  locked?: boolean;
  size?: 'lg' | 'md';
}) {
  const styles = TIER_STYLES[tier.slug] ?? TIER_STYLES.bronze;
  const dimension = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';
  const iconSize = size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';
  const pad = size === 'lg' ? 'p-3' : 'p-2';

  return (
    <div
      className={`relative ${dimension} flex items-center justify-center bg-[#E5E7F2] rounded-full border-4 border-white shadow-sm overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.ring}`} />
      <div className={`z-10 ${styles.badge} rounded-full ${pad} border-2 shadow-lg`}>
        <Award className={`${iconSize} text-white`} />
      </div>
      <div className={`absolute bottom-0 w-full h-1/3 ${styles.gradient}`} />
      {locked && (
        <div className="absolute top-1 right-1 z-20 bg-white p-1 rounded-full shadow-sm">
          <Lock className="w-4 h-4 text-brand-dark" />
        </div>
      )}
    </div>
  );
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Reviews received (as reviewee) — not ratings the user gave to others. */
function formatReceivedRating(
  reviews: UserStats['reviews'] | undefined,
  profileRating?: number | string | null
): string {
  const fromStats = reviews?.average_rating;
  if (fromStats != null && fromStats > 0) {
    return fromStats.toFixed(1);
  }
  const fromProfile = profileRating != null ? Number(profileRating) : NaN;
  if (!Number.isNaN(fromProfile) && fromProfile > 0) {
    return fromProfile.toFixed(1);
  }
  const received = reviews?.received;
  if (received != null && received > 0 && fromStats != null) {
    return fromStats.toFixed(1);
  }
  return 'New';
}

export default function DashboardOverview() {
  const { stats, loading, error } = useTaskerStats();
  const { user } = useAuth();
  const [showTierHelp, setShowTierHelp] = useState(false);
  const [wallet, setWallet] = useState<WalletBalance | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await walletService.getBalance();
        if (!cancelled && res.success && res.data) {
          setWallet(res.data);
        }
      } catch {
        /* keep stats fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-emerald" />
      </div>
    );
  }

  const tier = stats?.tier;
  const currentTier = tier?.current ?? {
    slug: 'bronze',
    name: 'Bronze',
    min_earnings: 0,
    service_fee_percent: 20,
  };
  const nextTier = tier?.next ?? null;
  const earnings30d = tier?.earnings_last_30_days ?? stats?.earnings?.last_30_days ?? 0;
  const amountToNext = tier?.amount_to_next_tier ?? 0;
  const progress = tier?.progress_to_next_tier_percent ?? 0;
  const milestones = tier?.milestones ?? [
    { slug: 'bronze', name: 'Bronze', min_earnings: 0, service_fee_percent: 20 },
    { slug: 'silver', name: 'Silver', min_earnings: 880, service_fee_percent: 18.5 },
    { slug: 'gold', name: 'Gold', min_earnings: 2650, service_fee_percent: 16 },
    { slug: 'platinum', name: 'Platinum', min_earnings: 5300, service_fee_percent: 14 },
  ];
  const walletBalance = Number(
    wallet?.available_balance ?? stats?.earnings?.wallet_balance ?? 0
  );
  const heldBalance = Number(wallet?.held_balance ?? 0);
  const pendingBalance = Number(wallet?.pending_balance ?? 0);
  const currency = wallet?.currency ?? stats?.earnings?.currency ?? 'NPR';
  const activeTasks = stats?.tasks?.active_list ?? [];
  const taskActive =
    stats?.role === 'tasker' ? (stats?.tasks?.active ?? 0) : undefined;
  const taskCompleted = stats?.tasks?.completed ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(DASHBOARD_TYPO, 'max-w-4xl space-y-8 pb-20 sm:space-y-10')}
    >
      <header className="space-y-2">
        <p
          className={cn(
            landingHeadlineSm,
            'mb-2 text-[10px] uppercase tracking-[0.3em] text-brand-emerald',
          )}
        >
          Tasker hub
        </p>
        <h1 className={cn(landingHeadline, 'text-2xl text-brand-dark sm:text-4xl')}>
          My tasker dashboard
        </h1>
        <p className={cn(landingBodyMuted, 'max-w-xl text-sm leading-relaxed')}>
          Track your tier, earnings, and active work — all in one place.
        </p>
        {error && (
          <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            {error}. Showing the latest available data.
          </p>
        )}
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/task"
          className="group flex items-center gap-3 p-4 rounded-2xl border border-outline-variant bg-white hover:border-brand-emerald/30 hover:shadow-sm transition-all"
        >
          <div className="p-2.5 rounded-xl bg-brand-emerald/10 text-brand-emerald">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <p className={cn(landingHeadlineSm, 'text-sm text-brand-dark')}>Browse tasks</p>
            <p className={cn(landingBodyMuted, 'text-xs')}>Find work near you</p>
          </div>
        </Link>
        <Link
          href="/my-tasks"
          className="group flex items-center gap-3 p-4 rounded-2xl border border-outline-variant bg-white hover:border-brand-emerald/30 hover:shadow-sm transition-all"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className={cn(landingHeadlineSm, 'text-sm text-brand-dark')}>My tasks</p>
            <p className={cn(landingBodyMuted, 'text-xs')}>
              {taskActive ?? 0} active · {taskCompleted} completed
              {stats?.role === 'customer' && taskCompleted > 0 && (
                <span className="mt-0.5 block text-[10px] text-amber-700">
                  Posted as customer — open My tasks for assigned work
                </span>
              )}
            </p>
          </div>
        </Link>
        <Link
          href="/tasker-dashboard/payments"
          className="group flex items-center gap-3 p-4 rounded-2xl border border-outline-variant bg-white hover:border-brand-emerald/30 hover:shadow-sm transition-all"
        >
          <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className={cn(landingHeadlineSm, 'text-sm text-brand-dark')}>
              {formatNPR(walletBalance)}
            </p>
            <p className={cn(landingBodyMuted, 'text-xs')}>Available balance · {currency}</p>
            {(heldBalance > 0 || pendingBalance > 0) && (
              <p className="mt-0.5 text-[10px] leading-snug text-amber-700">
                {heldBalance > 0 && `${formatNPR(heldBalance)} in escrow`}
                {heldBalance > 0 && pendingBalance > 0 && ' · '}
                {pendingBalance > 0 && `${formatNPR(pendingBalance)} pending`}
              </p>
            )}
          </div>
        </Link>
      </section>

      <section className="space-y-6">
        <p
          className={cn(
            landingHeadlineSm,
            'text-[10px] uppercase tracking-[0.3em] text-[#6a719a]',
          )}
        >
          Your current tier
        </p>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <TierMedal tier={currentTier} />
          <div className="space-y-1">
            <h2 className={cn(landingHeadline, 'text-2xl text-brand-dark sm:text-3xl')}>
              {currentTier.name}
            </h2>
            <p className={cn(landingBodyMuted, 'text-base sm:text-lg')}>
              {currentTier.service_fee_percent}% service fee excl. GST
            </p>
          </div>
        </div>
      </section>

      {nextTier && (
        <>
          <hr className="border-gray-100" />
          <section className="space-y-6">
            <p
              className={cn(
                landingHeadlineSm,
                'text-[10px] uppercase tracking-[0.3em] text-[#6a719a]',
              )}
            >
              Your next tier
            </p>
            <div className="flex flex-col items-start gap-4 opacity-80 sm:flex-row sm:items-center sm:gap-6">
              <TierMedal tier={nextTier} locked />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={cn(landingHeadline, 'text-2xl text-brand-dark sm:text-3xl')}>
                    {nextTier.name}
                  </h2>
                  <Lock className="h-6 w-6 text-brand-dark" />
                </div>
                <p className={cn(landingBodyMuted, 'text-base sm:text-lg')}>
                  {nextTier.service_fee_percent}% service fee excl. GST
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="space-y-4">
        <h3 className={cn(landingHeadline, 'text-xl text-brand-dark')}>
          Your earnings (last 30 days)
        </h3>
        {nextTier ? (
          <p className={cn(landingBodyMuted, 'text-sm leading-relaxed')}>
            Your earnings are{' '}
            <span className={cn(landingHeadlineSm, 'text-brand-dark')}>{formatNPR(amountToNext)}</span>{' '}
            away from{' '}
            <span className={cn(landingHeadlineSm, 'text-brand-dark')}>{nextTier.name}</span> and
            lowering service fees.
          </p>
        ) : (
          <p className={cn(landingBodyMuted, 'text-sm leading-relaxed')}>
            You&apos;re on the highest tier. Keep up the great work to maintain your lower service
            fee.
          </p>
        )}
        <div className="space-y-2">
          <div className="w-full h-8 bg-gray-100 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(nextTier ? 5 : 100, progress)}%` }}
              className="h-full bg-brand-emerald flex items-center px-4 min-w-[4rem]"
            >
              <span className={cn(landingHeadlineSm, 'whitespace-nowrap text-sm text-white')}>
                {formatNPR(earnings30d)}
              </span>
            </motion.div>
          </div>
          <div
            className={cn(
              landingBodyMuted,
              'flex flex-wrap justify-between gap-x-1 gap-y-2 px-1 text-[10px] sm:text-xs',
            )}
          >
            {milestones.map((milestone) => (
              <span
                key={milestone.slug}
                className={milestone.slug === 'platinum' ? 'text-right' : ''}
              >
                {milestone.min_earnings === 0
                  ? formatNPR(0)
                  : milestone.slug === 'platinum'
                    ? `${formatNPR(milestone.min_earnings)}+`
                    : formatNPR(milestone.min_earnings)}
              </span>
            ))}
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {stats.bids && (
              <>
                <div className="rounded-2xl border border-outline-variant bg-white p-4">
                  <p
                    className={cn(
                      landingHeadlineSm,
                      'text-[10px] uppercase tracking-[0.2em] text-[#6a719a]',
                    )}
                  >
                    Total bids
                  </p>
                  <p className={cn(landingHeadline, 'mt-1 text-2xl text-brand-dark')}>
                    {stats.bids.total}
                  </p>
                </div>
                <div className="rounded-2xl border border-outline-variant bg-white p-4">
                  <p
                    className={cn(
                      landingHeadlineSm,
                      'text-[10px] uppercase tracking-[0.2em] text-[#6a719a]',
                    )}
                  >
                    Pending offers
                  </p>
                  <p className={cn(landingHeadline, 'mt-1 text-2xl text-brand-dark')}>
                    {stats.bids.pending ?? 0}
                  </p>
                </div>
              </>
            )}
            {stats.tasks && (
              <div className="rounded-2xl border border-outline-variant bg-white p-4">
                <p
                  className={cn(
                    landingHeadlineSm,
                    'text-[10px] uppercase tracking-[0.2em] text-[#6a719a]',
                  )}
                >
                  Completed
                </p>
                <p className={cn(landingHeadline, 'mt-1 text-2xl text-brand-dark')}>
                  {stats.tasks.completed}
                </p>
              </div>
            )}
            {stats.reviews && (
              <div className="rounded-2xl border border-outline-variant bg-white p-4">
                <p
                  className={cn(
                    landingHeadlineSm,
                    'text-[10px] uppercase tracking-[0.2em] text-[#6a719a]',
                  )}
                >
                  Rating
                </p>
                <p className={cn(landingHeadline, 'mt-1 text-2xl text-brand-dark')}>
                  {formatReceivedRating(stats.reviews, user?.average_rating)}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {activeTasks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={cn(landingHeadline, 'text-xl text-brand-dark')}>Active tasks</h3>
            <Link
              href="/my-tasks"
              className={cn(
                landingHeadlineSm,
                'inline-flex items-center gap-1 text-sm text-brand-emerald hover:opacity-80',
              )}
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <ul className="space-y-3">
            {activeTasks.map((task) => (
              <li key={task.id}>
                <Link
                  href={`/task/${task.slug}`}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-outline-variant bg-white hover:border-brand-emerald/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className={cn(landingHeadlineSm, 'truncate text-sm text-brand-dark')}>
                      {task.title}
                    </p>
                    <p className={cn(landingBodyMuted, 'text-sm')}>
                      {formatStatusLabel(task.status)}
                    </p>
                  </div>
                  <span className={cn(landingHeadlineSm, 'shrink-0 text-sm text-[#6a719a]')}>
                    {formatNPR(task.budget)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="pt-2">
        <button
          type="button"
          onClick={() => setShowTierHelp(true)}
          className={cn(
            landingHeadlineSm,
            'flex items-center gap-2 text-brand-emerald transition-colors hover:opacity-80',
          )}
        >
          <HelpCircle className="h-5 w-5" />
          <span>How do tiers work?</span>
        </button>
      </footer>

      <AnimatePresence>
        {showTierHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
            onClick={() => setShowTierHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h4 className={cn(landingHeadline, 'text-xl text-brand-dark')}>How tiers work</h4>
                <button
                  type="button"
                  onClick={() => setShowTierHelp(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className={cn(landingBodyMuted, 'mb-4 text-sm leading-relaxed')}>
                Your tier is based on task earnings received in the last 30 days. Higher tiers unlock
                lower service fees on completed tasks.
              </p>
              <ul className="space-y-2 text-sm">
                {milestones.map((milestone) => (
                  <li
                    key={milestone.slug}
                    className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0"
                  >
                    <span className={cn(landingHeadlineSm, 'text-sm text-brand-dark')}>
                      {milestone.name}
                    </span>
                    <span className={cn(landingBodyMuted, 'text-sm')}>
                      {milestone.min_earnings === 0
                        ? 'Starting tier'
                        : `${formatNPR(milestone.min_earnings)}+ · ${milestone.service_fee_percent}% fee`}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
