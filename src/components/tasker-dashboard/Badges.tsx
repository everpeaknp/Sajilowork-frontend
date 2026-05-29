'use client';

import { useCallback, useEffect, useState } from 'react';
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
  Droplets,
  Clock,
  Award,
  Plus,
} from 'lucide-react';
import { userService } from '@/services';
import { Badge } from '@/types';
import { toast } from 'sonner';
import BadgeUploadModal, {
  type BadgeUploadPayload,
} from '@/components/tasker-dashboard/BadgeUploadModal';

type DashboardBadgeType =
  | 'police_check'
  | 'payment_verified'
  | 'mobile_verified'
  | 'electrical_licence'
  | 'plumbing_licence';

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

function BadgeStatus({
  badgeType,
  badges,
  onAdd,
  onUpload,
  addLabel = 'Add',
  verifiedLabel = 'Active',
}: {
  badgeType: DashboardBadgeType;
  badges: Badge[];
  onAdd: (type: DashboardBadgeType) => void;
  onUpload?: (type: DashboardBadgeType) => void;
  addLabel?: string;
  verifiedLabel?: string;
}) {
  const record = badges.find((b) => b.badge_type === badgeType);
  const needsDocument = DOCUMENT_BADGE_TYPES.has(badgeType);

  if (record?.is_verified) {
    return (
      <div className="flex flex-col items-stretch sm:items-end gap-2">
        <div className="px-5 py-2 bg-green-50 text-green-700 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-green-100">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {verifiedLabel}
        </div>
        {record.verified_at ? (
          <p className="text-[10px] font-bold text-green-700/80 uppercase tracking-widest text-center sm:text-right">
            Verified {new Date(record.verified_at).toLocaleDateString()}
          </p>
        ) : null}
        {record.verification_document ? (
          <a
            href={record.verification_document}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-primary uppercase tracking-widest hover:underline text-center sm:text-right"
          >
            View document
          </a>
        ) : null}
      </div>
    );
  }

  if (record && !record.is_verified) {
    return (
      <div className="flex flex-col items-stretch sm:items-end gap-3">
        <div className="px-5 py-2 bg-amber-50 text-amber-800 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-amber-100">
          <Clock className="w-3.5 h-3.5" />
          Pending review
        </div>
        {needsDocument && onUpload ? (
          <button
            type="button"
            onClick={() => onUpload(badgeType)}
            className="text-xs font-black text-primary uppercase tracking-[0.2em] hover:underline"
          >
            {record.verification_document ? 'Replace document' : 'Upload document'}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onAdd(badgeType)}
      className="bg-[#1161fe] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-sm group-hover:shadow-md active:scale-95"
    >
      {needsDocument ? 'Upload' : addLabel}
    </button>
  );
}

export default function Badges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
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
    if (!uploadModal) {
      return;
    }
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
    switch (badgeType) {
      case 'police_check':
        return <ShieldCheck className="w-10 h-10 text-blue-950" />;
      case 'payment_verified':
        return <CreditCard className="w-10 h-10 text-blue-950" />;
      case 'mobile_verified':
        return <Smartphone className="w-10 h-10 text-blue-950" />;
      case 'electrical_licence':
        return <Zap className="w-10 h-10 text-blue-950" />;
      case 'plumbing_licence':
        return <Droplets className="w-10 h-10 text-blue-950" />;
      default:
        return <ShieldCheck className="w-10 h-10 text-blue-950" />;
    }
  };

  const badgeList = Array.isArray(badges) ? badges : [];
  const customLicenceBadges = badgeList.filter((b) => b.badge_type === 'custom_licence');
  const verifiedLicenceBadges = badgeList.filter(
    (b) =>
      (b.badge_type === 'electrical_licence' ||
        b.badge_type === 'plumbing_licence' ||
        b.badge_type === 'custom_licence') &&
      b.is_verified,
  );
  const mobileActive = badgeList.some((b) => b.badge_type === 'mobile_verified' && b.is_verified);
  const paymentRecord = badgeList.find((b) => b.badge_type === 'payment_verified');

  const openCustomReplace = (badge: Badge) => {
    setUploadModal({
      badgeType: 'custom_licence',
      variant: 'custom',
      title: `Update: ${badge.name}`,
      prefillName: badge.name,
      prefillDescription: badge.description ?? '',
    });
  };

  const commonBadgeStyle =
    'group bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-900/5 flex flex-col md:flex-row md:items-center gap-8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-12 pb-24"
    >
      <header className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-10 bg-primary rounded-full" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              Trust & Safety
            </span>
          </div>
          <h1 className="text-4xl font-black text-blue-950 uppercase tracking-tighter">
            Verified Badges
          </h1>
        </div>

        <div className="bg-blue-950 text-white p-8 rounded-[40px] shadow-2xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 space-y-4">
            <p className="text-xl font-bold leading-relaxed tracking-tight">
              Badges help members be sure who you are and what you can do! The more you collect,
              the more Job Posters and Taskers will trust in your abilities.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-blue-200/60 font-medium">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 font-black" />
                A green tick shows active verification
              </span>
              <button
                type="button"
                className="flex items-center gap-1 text-white underline font-bold hover:text-blue-200 transition-colors"
              >
                Learn more <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-8">
        <h2 className="text-2xl font-black text-blue-950 uppercase tracking-tighter flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-primary" />
          ID Badges
        </h2>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading badges...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <div className={commonBadgeStyle}>
              <div className="p-6 bg-surface-low rounded-3xl group-hover:scale-110 transition-transform duration-500">
                {getBadgeIcon('police_check')}
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-black text-blue-950">Police Check</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Provide peace of mind to other members by successfully completing a Police Check.
                </p>
              </div>
              <BadgeStatus
                badgeType="police_check"
                badges={badgeList}
                onAdd={handleAddBadge}
                onUpload={openUploadModal}
              />
            </div>

            <div className={commonBadgeStyle}>
              <div className="p-6 bg-surface-low rounded-3xl group-hover:scale-110 transition-transform duration-500">
                {getBadgeIcon('payment_verified')}
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-black text-blue-950">Payment Method Verified</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Make payments with ease by having your payment method verified.
                </p>
              </div>
              <div className="flex flex-col items-stretch sm:items-end gap-3">
                {paymentRecord?.is_verified ? (
                  <BadgeStatus
                    badgeType="payment_verified"
                    badges={badgeList}
                    onAdd={handleAddBadge}
                  />
                ) : (
                  <>
                    <Link
                      href="/tasker-dashboard/methods"
                      className="bg-[#1161fe] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-sm text-center"
                    >
                      Link payment method
                    </Link>
                    {paymentRecord && !paymentRecord.is_verified ? (
                      <BadgeStatus
                        badgeType="payment_verified"
                        badges={badgeList}
                        onAdd={handleAddBadge}
                      />
                    ) : null}
                  </>
                )}
              </div>
            </div>

            <div className={commonBadgeStyle}>
              <div className="p-6 bg-surface-low rounded-3xl group-hover:scale-110 transition-transform duration-500">
                {getBadgeIcon('mobile_verified')}
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-black text-blue-950">Mobile Verified</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Verified mobile number for instant task notifications.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {mobileActive ? (
                  <div className="px-5 py-2 bg-green-50 text-green-700 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-green-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active
                  </div>
                ) : (
                  <Link
                    href="/tasker-dashboard/profile"
                    className="bg-[#1161fe] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-sm"
                  >
                    Verify mobile
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-black text-blue-950 uppercase tracking-tighter flex items-center gap-3">
          <Zap className="w-7 h-7 text-primary" />
          Licence Badges
        </h2>

        {!loading && verifiedLicenceBadges.length > 0 ? (
          <div className="rounded-[32px] border border-green-200 bg-green-50/80 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <h3 className="text-sm font-black text-green-800 uppercase tracking-[0.2em]">
                Verified licences
              </h3>
            </div>
            <ul className="flex flex-wrap gap-2">
              {verifiedLicenceBadges.map((badge) => (
                <li
                  key={badge.id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-green-200 text-sm font-bold text-green-900"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  {badge.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6">
          <div className={commonBadgeStyle}>
            <div className="p-6 bg-surface-low rounded-3xl group-hover:scale-110 transition-transform duration-500">
              {getBadgeIcon('electrical_licence')}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-black text-blue-950">Electrical Licence</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Let others know you hold an electrical contractor licence with this badge.
              </p>
            </div>
            <BadgeStatus
              badgeType="electrical_licence"
              badges={badgeList}
              onAdd={handleAddBadge}
              onUpload={openUploadModal}
              verifiedLabel="Verified"
            />
          </div>

          <div className={commonBadgeStyle}>
            <div className="p-6 bg-surface-low rounded-3xl group-hover:scale-110 transition-transform duration-500">
              {getBadgeIcon('plumbing_licence')}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-black text-blue-950">Plumbing Licence</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Let others know you hold a valid Plumbing licence with this badge.
              </p>
            </div>
            <BadgeStatus
              badgeType="plumbing_licence"
              badges={badgeList}
              onAdd={handleAddBadge}
              onUpload={openUploadModal}
              verifiedLabel="Verified"
            />
          </div>

          {customLicenceBadges.length > 0 ? (
            <div className="space-y-4 pt-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
                Your custom licences
              </p>
              {customLicenceBadges.map((badge) => (
                <div key={badge.id} className={commonBadgeStyle}>
                  <div className="p-6 bg-surface-low rounded-3xl">
                    <Award className="w-10 h-10 text-blue-950" />
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <h3 className="text-xl font-black text-blue-950 truncate">{badge.name}</h3>
                    {badge.description ? (
                      <p className="text-gray-500 font-medium leading-relaxed">{badge.description}</p>
                    ) : (
                      <p className="text-gray-500 font-medium leading-relaxed">
                        Custom licence or certification on your profile.
                      </p>
                    )}
                    {badge.document_number ? (
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Ref: {badge.document_number}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-stretch sm:items-end gap-3 shrink-0">
                    {badge.is_verified ? (
                      <div className="px-5 py-2 bg-green-50 text-green-700 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-green-100">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </div>
                    ) : (
                      <div className="px-5 py-2 bg-amber-50 text-amber-800 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-amber-100">
                        <Clock className="w-3.5 h-3.5" />
                        Pending review
                      </div>
                    )}
                    {badge.verification_document ? (
                      <a
                        href={badge.verification_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-primary uppercase tracking-widest hover:underline text-center sm:text-right"
                      >
                        View document
                      </a>
                    ) : null}
                    {!badge.is_verified ? (
                      <button
                        type="button"
                        onClick={() => openCustomReplace(badge)}
                        className="text-xs font-black text-primary uppercase tracking-[0.2em] hover:underline"
                      >
                        Replace document
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => openUploadModal('custom_licence', 'custom')}
            className="relative z-0 w-full group bg-gradient-to-br from-blue-50 to-white p-8 rounded-[40px] border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all flex flex-col sm:flex-row sm:items-center gap-6 text-left"
          >
            <div className="p-6 bg-white rounded-3xl shadow-sm group-hover:scale-105 transition-transform">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-black text-blue-950">Add custom licence badge</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Upload any trade licence or certification not listed above — HVAC, gas fitting,
                builder, arborist, and more.
              </p>
            </div>
            <span className="bg-[#1161fe] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shrink-0">
              Upload
            </span>
          </button>
        </div>
      </section>

      {submitting ? (
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
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

      <footer className="pt-12 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black text-blue-950 uppercase">Your Privacy Matters</p>
            <p className="text-xs text-gray-500 font-medium">
              All data is encrypted and handled by verified third parties.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="border-2 border-blue-950 text-blue-950 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-950 hover:text-white transition-all"
        >
          View Trust Center
        </button>
      </footer>
    </motion.div>
  );
}
