'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Droplets,
  Loader2,
  Plus,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import BadgeUploadModal, {
  type BadgeUploadPayload,
} from '@/components/tasker-dashboard/BadgeUploadModal';
import { userService } from '@/services';
import type { Badge } from '@/types';

type LicenceBadgeType = 'electrical_licence' | 'plumbing_licence' | 'custom_licence';

type BadgeVisualStatus = 'verified' | 'pending' | 'none';

function getBadgeStatus(badgeType: string, badges: Badge[]): BadgeVisualStatus {
  const record = badges.find((b) => b.badge_type === badgeType);
  if (record?.is_verified) return 'verified';
  if (record) return 'pending';
  return 'none';
}

function getBadgeIcon(badgeType: string) {
  switch (badgeType) {
    case 'electrical_licence':
      return <Zap className="h-7 w-7 text-[#52C47F]" strokeWidth={2} />;
    case 'plumbing_licence':
      return <Droplets className="h-7 w-7 text-[#52C47F]" strokeWidth={2} />;
    default:
      return <Award className="h-7 w-7 text-[#52C47F]" strokeWidth={2} />;
  }
}

function StatusChip({ status }: { status: BadgeVisualStatus }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Verified
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
        <Clock className="h-3.5 w-3.5" />
        Pending review
      </span>
    );
  }
  return null;
}

function LicenceBadgeRow({
  icon,
  title,
  description,
  status,
  footer,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: BadgeVisualStatus;
  footer?: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200/90 bg-neutral-50/40 p-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-100">
        {icon}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold text-neutral-900">{title}</h3>
          <StatusChip status={status} />
        </div>
        <p className="text-sm text-neutral-500">{description}</p>
        {footer}
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">{action}</div>
    </div>
  );
}

const UPLOAD_TITLES: Record<string, string> = {
  electrical_licence: 'Upload Electrical Licence',
  plumbing_licence: 'Upload Plumbing Licence',
};

export default function DashboardLicenceBadges({ embedded = false }: { embedded?: boolean }) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [uploadModal, setUploadModal] = useState<{
    badgeType: LicenceBadgeType;
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
      const message = error instanceof Error ? error.message : 'Failed to load licence badges';
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
    badgeType: LicenceBadgeType,
    variant: 'standard' | 'custom' = 'standard',
    prefill?: { name?: string; description?: string },
  ) => {
    setUploadModal({
      badgeType,
      variant,
      prefillName: prefill?.name,
      prefillDescription: prefill?.description,
      title:
        variant === 'custom'
          ? prefill?.name
            ? `Update: ${prefill.name}`
            : 'Add custom licence badge'
          : UPLOAD_TITLES[badgeType] ?? 'Upload document',
    });
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

  const renderDocAction = (badgeType: 'electrical_licence' | 'plumbing_licence') => {
    const record = badges.find((b) => b.badge_type === badgeType);
    const status = getBadgeStatus(badgeType, badges);
    const busy = submitting === badgeType;

    if (status === 'verified' && record?.verification_document) {
      return (
        <a
          href={record.verification_document}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[#52C47F] hover:underline"
        >
          View document
        </a>
      );
    }

    if (status === 'pending') {
      return (
        <button
          type="button"
          disabled={busy}
          onClick={() => openUploadModal(badgeType)}
          className="text-sm font-semibold text-[#52C47F] hover:underline disabled:opacity-50"
        >
          {busy ? 'Uploading…' : 'Replace document'}
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => openUploadModal(badgeType)}
        className="rounded-xl bg-[#52C47F] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#43b06c] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Upload'}
      </button>
    );
  };

  const customLicenceBadges = badges.filter((b) => b.badge_type === 'custom_licence');

  const badgeContent = loading ? (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 rounded-xl bg-neutral-100" />
      <div className="h-24 rounded-xl bg-neutral-100" />
      <div className="h-24 rounded-xl bg-neutral-100" />
    </div>
  ) : (
    <div className="space-y-4">
      <LicenceBadgeRow
        icon={getBadgeIcon('electrical_licence')}
        title="Electrical licence"
        description="Let others know you hold an electrical contractor licence."
        status={getBadgeStatus('electrical_licence', badges)}
        action={renderDocAction('electrical_licence')}
      />

      <LicenceBadgeRow
        icon={getBadgeIcon('plumbing_licence')}
        title="Plumbing licence"
        description="Let others know you hold a valid plumbing licence."
        status={getBadgeStatus('plumbing_licence', badges)}
        action={renderDocAction('plumbing_licence')}
      />

      {customLicenceBadges.map((badge) => (
        <LicenceBadgeRow
          key={badge.id}
          icon={getBadgeIcon('custom_licence')}
          title={badge.name ?? 'Custom licence'}
          description={badge.description ?? 'Custom licence or certification on your profile.'}
          status={badge.is_verified ? 'verified' : 'pending'}
          footer={
            badge.document_number ? (
              <p className="text-xs text-neutral-400">Ref: {badge.document_number}</p>
            ) : null
          }
          action={
            <>
              {badge.verification_document ? (
                <a
                  href={badge.verification_document}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[#52C47F] hover:underline"
                >
                  View document
                </a>
              ) : null}
              {!badge.is_verified ? (
                <button
                  type="button"
                  onClick={() =>
                    openUploadModal('custom_licence', 'custom', {
                      name: badge.name,
                      description: badge.description,
                    })
                  }
                  className="text-sm font-semibold text-[#52C47F] hover:underline"
                >
                  Replace document
                </button>
              ) : null}
            </>
          }
        />
      ))}

      <button
        type="button"
        onClick={() => openUploadModal('custom_licence', 'custom')}
        className="group flex w-full flex-col gap-4 rounded-xl border-2 border-dashed border-[#52C47F]/30 bg-emerald-50/30 p-5 text-left transition hover:border-[#52C47F]/50 sm:flex-row sm:items-center sm:gap-6"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-[#52C47F] shadow-sm ring-1 ring-emerald-100 transition group-hover:scale-105">
          <Plus className="h-7 w-7" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-neutral-900">Add custom licence badge</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Upload any trade licence or certification not listed above — HVAC, gas fitting, builder,
            arborist, and more.
          </p>
        </div>
      </button>
    </div>
  );

  return (
    <>
      {embedded ? (
        badgeContent
      ) : (
        <div className="mx-auto mt-6 max-w-7xl overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
          <div className="mb-6 border-b border-neutral-100 pb-5">
            <h2 className="text-[17px] font-semibold tracking-tight text-neutral-900" id="licence-badges-label">
              Licence badges
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Upload trade licences and certifications. Verified badges appear on your public profile.
            </p>
          </div>
          {badgeContent}
        </div>
      )}

      <BadgeUploadModal
        open={Boolean(uploadModal)}
        title={uploadModal?.title ?? 'Upload document'}
        variant={uploadModal?.variant ?? 'standard'}
        initialCustomName={uploadModal?.prefillName}
        initialCustomDescription={uploadModal?.prefillDescription}
        submitting={Boolean(submitting)}
        onClose={() => setUploadModal(null)}
        onSubmit={handleUploadSubmit}
      />
    </>
  );
}
