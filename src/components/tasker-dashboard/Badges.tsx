'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Lock,
  ExternalLink,
  Zap,
  BadgeCheck,
  Droplets,
  Clock,
  Award,
  Plus,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { userService } from '@/services';
import { Badge } from '@/types';
import { toast } from 'sonner';
import BadgeUploadModal, {
  type BadgeUploadPayload,
} from '@/components/tasker-dashboard/BadgeUploadModal';
import {
  landingBody,
  landingBodyMuted,
  landingHeadline,
  landingHeadlineSm,
} from '@/components/LangingHome/landingTypography';

const BADGES_TYPO = `${landingBody} [&_h1]:font-formula [&_h1]:font-black [&_h1]:tracking-tight [&_h2]:font-formula [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h3]:font-formula [&_h3]:font-bold [&_h3]:tracking-tight`;

type DashboardBadgeType =
  | 'police_check'
  | 'payment_verified'
  | 'mobile_verified'
  | 'electrical_licence'
  | 'plumbing_licence';

type SectionId = 'identity' | 'licences';

const DOCUMENT_BADGE_TYPES = new Set<DashboardBadgeType>([
  'police_check',
  'electrical_licence',
  'plumbing_licence',
]);

const BADGE_UPLOAD_TITLES: Record<string, string> = {
  police_check: 'Upload Police Check',
  electrical_licence: 'Upload Electrical Licence',
  plumbing_licence: 'Upload Plumbing Licence',
};

const CORE_BADGE_TYPES: DashboardBadgeType[] = [
  'police_check',
  'payment_verified',
  'mobile_verified',
  'electrical_licence',
  'plumbing_licence',
];

const SECTION_NAV: {
  id: SectionId;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    id: 'identity',
    label: 'ID & account',
    icon: ShieldCheck,
    description: 'Identity and payments',
  },
  {
    id: 'licences',
    label: 'Licences',
    icon: BadgeCheck,
    description: 'Trade certifications',
  },
];

type BadgeVisualStatus = 'verified' | 'pending' | 'none';

function getBadgeStatus(badgeType: DashboardBadgeType, badges: Badge[]): BadgeVisualStatus {
  const record = badges.find((b) => b.badge_type === badgeType);
  if (record?.is_verified) return 'verified';
  if (record && !record.is_verified) return 'pending';
  return 'none';
}

function StatusChip({
  status,
  label,
}: {
  status: BadgeVisualStatus;
  label?: string;
}) {
  if (status === 'verified') {
    return (
      <span
        className={cn(
          landingHeadlineSm,
          'inline-flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-2 text-xs text-green-700',
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {label ?? 'Active'}
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span
        className={cn(
          landingHeadlineSm,
          'inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800',
        )}
      >
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Pending review
      </span>
    );
  }
  return null;
}

function PrimaryBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        landingBody,
        'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-emerald/25 transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
      )}
    >
      {children}
    </button>
  );
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        landingBody,
        'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-emerald/25 transition hover:opacity-90 active:scale-[0.98]',
      )}
    >
      {children}
    </Link>
  );
}

function GhostBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        landingBody,
        'text-sm font-semibold text-brand-emerald hover:underline disabled:cursor-not-allowed disabled:opacity-50',
      )}
    >
      {children}
    </button>
  );
}

interface BadgeItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: BadgeVisualStatus;
  statusLabel?: string;
  footer?: React.ReactNode;
  action: React.ReactNode;
}

function BadgeItem({ icon, title, description, status, statusLabel, footer, action }: BadgeItemProps) {
  return (
    <div className="flex flex-col gap-6 rounded-[24px] border border-outline-variant/70 bg-surface-low/30 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
      <div className="rounded-2xl bg-emerald-50 p-4 text-brand-emerald">{icon}</div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className={cn(landingHeadline, 'text-lg text-brand-dark')}>{title}</h3>
          <StatusChip status={status} label={statusLabel} />
        </div>
        <p className={cn(landingBodyMuted, 'text-sm leading-relaxed')}>{description}</p>
        {footer}
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">{action}</div>
    </div>
  );
}

function BadgesLoadingSkeleton() {
  return (
    <div className={cn(BADGES_TYPO, 'max-w-5xl animate-pulse space-y-8 pb-20')}>
      <div className="space-y-3">
        <div className="h-3 w-24 rounded bg-surface-low" />
        <div className="h-10 w-72 rounded bg-surface-low" />
        <div className="h-4 w-full max-w-lg rounded bg-surface-low" />
      </div>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <div className="h-40 rounded-[28px] bg-surface-low" />
          <div className="h-56 rounded-[28px] bg-surface-low" />
        </div>
        <div className="space-y-6 lg:col-span-8">
          <div className="h-80 rounded-[32px] bg-surface-low" />
          <div className="h-96 rounded-[32px] bg-surface-low" />
        </div>
      </div>
    </div>
  );
}

export default function Badges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('identity');
  const [uploadModal, setUploadModal] = useState<{
    badgeType: DashboardBadgeType | 'custom_licence';
    title: string;
    variant: 'standard' | 'custom';
    prefillName?: string;
    prefillDescription?: string;
  } | null>(null);

  const fetchBadges = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getBadges();
      if (response.success && response.data) {
        setBadges(response.data);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load badges';
      console.error('Failed to fetch badges:', error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  useEffect(() => {
    if (loading) return;

    const sectionIds = SECTION_NAV.map((s) => `badges-section-${s.id}`);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          const id = visible[0].target.id.replace('badges-section-', '') as SectionId;
          setActiveSection(id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const openUploadModal = (
    badgeType: DashboardBadgeType | 'custom_licence',
    variant: 'standard' | 'custom' = 'standard',
  ) => {
    setUploadModal({
      badgeType,
      variant,
      title:
        variant === 'custom'
          ? 'Add custom licence badge'
          : BADGE_UPLOAD_TITLES[badgeType] ?? 'Upload document',
    });
  };

  const handleAddBadge = async (badgeType: DashboardBadgeType) => {
    if (DOCUMENT_BADGE_TYPES.has(badgeType)) {
      openUploadModal(badgeType);
      return;
    }

    if (badgeType === 'payment_verified') {
      const existing = badges.find((b) => b.badge_type === 'payment_verified');
      if (!existing?.is_verified) {
        toast.message('Link a payment method first', {
          description: 'Add eSewa or a bank account under Payment Methods.',
        });
        return;
      }
    }

    try {
      setSubmitting(badgeType);
      const response = await userService.addBadge({ badge_type: badgeType });

      if (response.success && response.data) {
        await fetchBadges();
        if (response.data.is_verified) {
          toast.success('Badge is now active');
        } else {
          toast.success('Badge submitted — we will review it shortly');
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add badge';
      toast.error(message);
    } finally {
      setSubmitting(null);
    }
  };

  const handleUploadSubmit = async (payload: BadgeUploadPayload) => {
    if (!uploadModal) return;

    const { badgeType, variant } = uploadModal;
    try {
      setSubmitting(badgeType);
      const response = await userService.addBadgeWithDocument(
        {
          badge_type: badgeType,
          document_number: payload.documentNumber,
          name: variant === 'custom' ? payload.customName : undefined,
          description: variant === 'custom' ? payload.customDescription : undefined,
        },
        payload.file,
      );
      if (response.success) {
        await fetchBadges();
        setUploadModal(null);
        toast.success('Document uploaded — pending admin review');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upload document';
      toast.error(message);
      throw error;
    } finally {
      setSubmitting(null);
    }
  };

  const getBadgeIcon = (badgeType: string) => {
    const props = { className: 'h-8 w-8', strokeWidth: 2 as const };
    switch (badgeType) {
      case 'police_check':
        return <ShieldCheck {...props} />;
      case 'payment_verified':
        return <CreditCard {...props} />;
      case 'mobile_verified':
        return <Smartphone {...props} />;
      case 'electrical_licence':
        return <Zap {...props} />;
      case 'plumbing_licence':
        return <Droplets {...props} />;
      default:
        return <Award {...props} />;
    }
  };

  const badgeList = Array.isArray(badges) ? badges : [];
  const customLicenceBadges = badgeList.filter((b) => b.badge_type === 'custom_licence');
  const mobileActive = badgeList.some((b) => b.badge_type === 'mobile_verified' && b.is_verified);
  const paymentRecord = badgeList.find((b) => b.badge_type === 'payment_verified');

  const sectionCounts = useMemo(() => {
    const identityTypes: DashboardBadgeType[] = [
      'police_check',
      'payment_verified',
      'mobile_verified',
    ];
    const licenceTypes: DashboardBadgeType[] = [
      'electrical_licence',
      'plumbing_licence',
    ];

    const countVerified = (types: DashboardBadgeType[]) =>
      types.filter((type) =>
        badgeList.some((b) => b.badge_type === type && b.is_verified),
      ).length;

    const customVerified = customLicenceBadges.filter((b) => b.is_verified).length;

    return {
      identity: countVerified(identityTypes),
      licences: countVerified(licenceTypes) + customVerified,
    };
  }, [badgeList, customLicenceBadges]);

  const trustProgress = useMemo(() => {
    const verified = CORE_BADGE_TYPES.filter((type) =>
      badgeList.some((b) => b.badge_type === type && b.is_verified),
    ).length;
    return {
      verified,
      total: CORE_BADGE_TYPES.length,
      percent: Math.round((verified / CORE_BADGE_TYPES.length) * 100),
    };
  }, [badgeList]);

  const scrollToSection = useCallback((id: SectionId) => {
    setActiveSection(id);
    document.getElementById(`badges-section-${id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const openCustomReplace = (badge: Badge) => {
    setUploadModal({
      badgeType: 'custom_licence',
      variant: 'custom',
      title: `Update: ${badge.name}`,
      prefillName: badge.name,
      prefillDescription: badge.description ?? '',
    });
  };

  const renderDocAction = (badgeType: DashboardBadgeType) => {
    const record = badgeList.find((b) => b.badge_type === badgeType);
    const status = getBadgeStatus(badgeType, badgeList);
    const busy = submitting === badgeType;

    if (status === 'verified') {
      return record?.verification_document ? (
        <a
          href={record.verification_document}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(landingBody, 'text-sm font-semibold text-brand-emerald hover:underline')}
        >
          View document
        </a>
      ) : null;
    }

    if (status === 'pending') {
      return (
        <GhostBtn disabled={busy} onClick={() => openUploadModal(badgeType)}>
          {busy ? 'Uploading…' : 'Replace document'}
        </GhostBtn>
      );
    }

    return (
      <PrimaryBtn disabled={busy} onClick={() => handleAddBadge(badgeType)}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Upload
      </PrimaryBtn>
    );
  };

  if (loading) {
    return <BadgesLoadingSkeleton />;
  }

  const policeRecord = badgeList.find((b) => b.badge_type === 'police_check');

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(BADGES_TYPO, 'max-w-5xl space-y-8 pb-20')}
    >
      <header>
        <p
          className={cn(
            landingHeadlineSm,
            'mb-2 text-[10px] uppercase tracking-[0.3em] text-brand-emerald',
          )}
        >
          Trust & safety
        </p>
        <h1 className={cn(landingHeadline, 'text-2xl text-brand-dark sm:text-4xl')}>
          Verified badges
        </h1>
        <p className={cn(landingBodyMuted, 'mt-2 max-w-xl text-sm leading-relaxed')}>
          Badges help members know who you are and what you can do. The more you collect, the more
          customers trust your profile.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-[28px] border border-outline-variant bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p
                    className={cn(
                      landingHeadlineSm,
                      'text-xs uppercase tracking-[0.2em] text-gray-400',
                    )}
                  >
                    Trust score
                  </p>
                  <p className={cn(landingHeadline, 'mt-1 text-2xl text-brand-dark')}>
                    {trustProgress.percent}%
                  </p>
                </div>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald"
                  aria-hidden
                >
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-low">
                <div
                  className="h-full rounded-full bg-brand-emerald transition-all duration-500"
                  style={{ width: `${trustProgress.percent}%` }}
                />
              </div>
              <p className={cn(landingBodyMuted, 'mt-3 text-xs')}>
                {trustProgress.verified} of {trustProgress.total} core badges verified
              </p>
            </div>

            <nav
              className="rounded-[28px] border border-outline-variant bg-white p-3 shadow-sm"
              aria-label="Badge sections"
            >
              <ul className="space-y-1">
                {SECTION_NAV.map((item) => {
                  const Icon = item.icon;
                  const count = sectionCounts[item.id];
                  const isActive = activeSection === item.id;
                  const max = item.id === 'identity' ? 3 : 2 + customLicenceBadges.length;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(item.id)}
                        className={cn(
                          'flex w-full min-h-[48px] items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all',
                          isActive
                            ? 'bg-brand-emerald text-white shadow-md shadow-brand-emerald/20'
                            : 'text-brand-dark hover:bg-surface-low',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            isActive ? 'text-white' : 'text-brand-emerald',
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className={cn(landingHeadlineSm, 'block text-sm')}>
                            {item.label}
                          </span>
                          <span
                            className={cn(
                              landingBody,
                              'block text-xs font-medium',
                              isActive ? 'text-white/80' : 'text-gray-400',
                            )}
                          >
                            {item.description}
                          </span>
                        </span>
                        <span
                          className={cn(
                            landingHeadlineSm,
                            'rounded-full px-2 py-0.5 text-xs',
                            isActive ? 'bg-white/20 text-white' : 'bg-surface-low text-gray-500',
                          )}
                        >
                          {count}/{max}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50/60 px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
              <p className={cn(landingBody, 'text-xs font-medium leading-relaxed text-green-800')}>
                A green tick on your public profile means our team has verified that badge.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-outline-variant bg-white px-4 py-3 shadow-sm">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" aria-hidden />
              <p className={cn(landingBodyMuted, 'text-xs leading-relaxed')}>
                Documents are encrypted and reviewed only for verification.{' '}
                <button type="button" className="font-semibold text-brand-emerald hover:underline">
                  Trust center
                </button>
              </p>
            </div>
          </div>
        </aside>

        <div className="space-y-6 lg:col-span-8">
          <section
            id="badges-section-identity"
            className="scroll-mt-28 rounded-[32px] border border-outline-variant bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-50 p-3 text-brand-emerald">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className={cn(landingHeadline, 'text-xl text-brand-dark')}>ID & account</h2>
                <p className={cn(landingBodyMuted, 'mt-1 text-sm')}>
                  Identity and payment verification customers look for first.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <BadgeItem
                icon={getBadgeIcon('police_check')}
                title="Police check"
                description="Provide peace of mind by successfully completing a police check."
                status={getBadgeStatus('police_check', badgeList)}
                footer={
                  policeRecord?.verified_at ? (
                    <p className={cn(landingBodyMuted, 'text-xs')}>
                      Verified {new Date(policeRecord.verified_at).toLocaleDateString()}
                    </p>
                  ) : null
                }
                action={renderDocAction('police_check')}
              />

              <BadgeItem
                icon={getBadgeIcon('payment_verified')}
                title="Payment method verified"
                description="Make payments with ease by having your payment method verified."
                status={
                  paymentRecord?.is_verified
                    ? 'verified'
                    : paymentRecord
                      ? 'pending'
                      : 'none'
                }
                action={
                  paymentRecord?.is_verified ? (
                    <Link
                      href="/tasker-dashboard/methods"
                      className={cn(
                        landingBody,
                        'text-sm font-semibold text-brand-emerald hover:underline',
                      )}
                    >
                      Manage methods
                    </Link>
                  ) : (
                    <>
                      <PrimaryLink href="/tasker-dashboard/methods">Link payment method</PrimaryLink>
                      {paymentRecord && !paymentRecord.is_verified ? (
                        <PrimaryBtn
                          disabled={submitting === 'payment_verified'}
                          onClick={() => handleAddBadge('payment_verified')}
                        >
                          {submitting === 'payment_verified' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          Activate badge
                        </PrimaryBtn>
                      ) : null}
                    </>
                  )
                }
              />

              <BadgeItem
                icon={getBadgeIcon('mobile_verified')}
                title="Mobile verified"
                description="Verified mobile number for instant task notifications."
                status={mobileActive ? 'verified' : 'none'}
                action={
                  mobileActive ? (
                    <Link
                      href="/tasker-dashboard/profile"
                      className={cn(
                        landingBody,
                        'text-sm font-semibold text-brand-emerald hover:underline',
                      )}
                    >
                      View profile
                    </Link>
                  ) : (
                    <PrimaryLink href="/tasker-dashboard/settings?tab=mobile">
                      Verify mobile
                    </PrimaryLink>
                  )
                }
              />
            </div>
          </section>

          <section
            id="badges-section-licences"
            className="scroll-mt-28 rounded-[32px] border border-outline-variant bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-50 p-3 text-brand-emerald">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className={cn(landingHeadline, 'text-xl text-brand-dark')}>Licence badges</h2>
                <p className={cn(landingBodyMuted, 'mt-1 text-sm')}>
                  Trade licences and certifications that prove your qualifications.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <BadgeItem
                icon={getBadgeIcon('electrical_licence')}
                title="Electrical licence"
                description="Let others know you hold an electrical contractor licence."
                status={getBadgeStatus('electrical_licence', badgeList)}
                statusLabel="Verified"
                action={renderDocAction('electrical_licence')}
              />

              <BadgeItem
                icon={getBadgeIcon('plumbing_licence')}
                title="Plumbing licence"
                description="Let others know you hold a valid plumbing licence."
                status={getBadgeStatus('plumbing_licence', badgeList)}
                statusLabel="Verified"
                action={renderDocAction('plumbing_licence')}
              />

              {customLicenceBadges.map((badge) => (
                <BadgeItem
                  key={badge.id}
                  icon={getBadgeIcon('custom')}
                  title={badge.name}
                  description={
                    badge.description ||
                    'Custom licence or certification on your profile.'
                  }
                  status={badge.is_verified ? 'verified' : 'pending'}
                  statusLabel="Verified"
                  footer={
                    badge.document_number ? (
                      <p className={cn(landingBodyMuted, 'text-xs')}>
                        Ref: {badge.document_number}
                      </p>
                    ) : null
                  }
                  action={
                    <>
                      {badge.verification_document ? (
                        <a
                          href={badge.verification_document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            landingBody,
                            'text-sm font-semibold text-brand-emerald hover:underline',
                          )}
                        >
                          View document
                        </a>
                      ) : null}
                      {!badge.is_verified ? (
                        <GhostBtn onClick={() => openCustomReplace(badge)}>
                          Replace document
                        </GhostBtn>
                      ) : null}
                    </>
                  }
                />
              ))}

              <button
                type="button"
                onClick={() => openUploadModal('custom_licence', 'custom')}
                className="group flex w-full flex-col gap-5 rounded-[24px] border-2 border-dashed border-brand-emerald/25 bg-emerald-50/30 p-5 text-left transition hover:border-brand-emerald/50 sm:flex-row sm:items-center sm:gap-8 sm:p-6"
              >
                <div className="rounded-2xl bg-white p-4 text-brand-emerald shadow-sm transition group-hover:scale-105">
                  <Plus className="h-8 w-8" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className={cn(landingHeadline, 'text-lg text-brand-dark')}>
                    Add custom licence badge
                  </h3>
                  <p className={cn(landingBodyMuted, 'text-sm leading-relaxed')}>
                    Upload any trade licence or certification not listed above — HVAC, gas fitting,
                    builder, arborist, and more.
                  </p>
                </div>
                <span
                  className={cn(
                    landingBody,
                    'inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-2xl bg-brand-emerald px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-emerald/25',
                  )}
                >
                  Upload
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {submitting ? (
        <p
          className={cn(
            landingBodyMuted,
            'flex items-center justify-center gap-2 text-center text-sm',
          )}
          role="status"
        >
          <Loader2 className="h-4 w-4 animate-spin text-brand-emerald" aria-hidden />
          Submitting {submitting.replace(/_/g, ' ')}…
        </p>
      ) : null}

      <BadgeUploadModal
        open={uploadModal !== null}
        title={uploadModal?.title ?? 'Upload document'}
        variant={uploadModal?.variant ?? 'standard'}
        initialCustomName={uploadModal?.prefillName}
        initialCustomDescription={uploadModal?.prefillDescription}
        onClose={() => setUploadModal(null)}
        onSubmit={handleUploadSubmit}
        submitting={submitting !== null}
      />
    </motion.div>
  );
}
