'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { useAuthStore } from '@/store';
import { employerService } from '@/services';
import { mapEmployerProfileDtoToBusinessProfile } from '@/lib/employerApi';
import {
  buildDefaultEmployerBusinessProfile,
  resolveEmployerBusinessProfile,
  type EmployerBusinessProfile,
} from '@/lib/employerBusinessProfile';
import { getEmployerBusinessProfileHref } from '@/components/employers/employerSlug';
import { USER_PROFILE_UPDATED } from '@/lib/userProfileSync';
import { downloadElementAsHtml, printHtmlElement } from '@/lib/printDocument';
import { cn } from '@/lib/utils';

function contactLines(profile: EmployerBusinessProfile): string[] {
  return [
    profile.contactEmail.trim(),
    profile.contactPhone.trim(),
    profile.location.trim(),
  ].filter(Boolean);
}

function metaLine(profile: EmployerBusinessProfile): string {
  return [profile.industry.trim(), profile.teamSize.trim()].filter(Boolean).join(' · ');
}

type EmployerBusinessCardPreviewProps = {
  compact?: boolean;
};

export default function EmployerBusinessCardPreview({
  compact = false,
}: EmployerBusinessCardPreviewProps) {
  const user = useAuthStore((s) => s.user);
  const printRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<EmployerBusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await employerService.getMyEmployerProfile();
      if (response.success && response.data) {
        setProfile(mapEmployerProfileDtoToBusinessProfile(response.data));
        return;
      }
      setProfile(resolveEmployerBusinessProfile(user) ?? buildDefaultEmployerBusinessProfile(user));
    } catch {
      setProfile(resolveEmployerBusinessProfile(user) ?? buildDefaultEmployerBusinessProfile(user));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const onUpdated = () => {
      void loadProfile();
    };
    window.addEventListener(USER_PROFILE_UPDATED, onUpdated);
    return () => window.removeEventListener(USER_PROFILE_UPDATED, onUpdated);
  }, [loadProfile]);

  const displayName =
    profile?.accountType === 'company' && profile.companyName.trim()
      ? profile.companyName.trim()
      : [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
        profile?.companyName.trim() ||
        'Your business';

  const publicPath = getEmployerBusinessProfileHref({ username: profile?.slug || user?.username });
  const publicUrl =
    typeof window !== 'undefined' && publicPath
      ? `${window.location.origin}${publicPath}`
      : publicPath || '';

  const contacts = profile ? contactLines(profile) : [];
  const meta = profile ? metaLine(profile) : '';
  const website = profile?.website?.trim() ?? '';
  const tagline = profile?.tagline?.trim() ?? '';
  const isCompany = profile?.accountType === 'company';

  const hasContent = Boolean(
    profile &&
      (displayName !== 'Your business' || tagline || contacts.length > 0 || website),
  );

  const handleDownload = () => {
    const root = printRef.current;
    if (!root) return;

    const fileSlug =
      displayName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'business-card';

    const printed = printHtmlElement(root, `${displayName} — Business card`);
    if (!printed) {
      downloadElementAsHtml(root, `${fileSlug}.html`, `${displayName} — Business card`);
    }
  };

  const cardBody = (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-[#193E32] via-[#2f7a52] to-[#52C47F] text-white shadow-sm dark:border-neutral-700',
        compact ? 'p-5' : 'p-6 sm:p-8',
      )}
    >
      <div className="flex items-start gap-4">
        {profile?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.logoUrl}
            alt=""
            referrerPolicy="no-referrer"
            className={cn(
              'shrink-0 object-cover ring-2 ring-white/25',
              isCompany ? 'rounded-xl' : 'rounded-full',
              compact ? 'h-14 w-14' : 'h-16 w-16',
            )}
          />
        ) : (
          <div
            className={cn(
              'flex shrink-0 items-center justify-center bg-white/15 text-sm font-bold ring-2 ring-white/20',
              isCompany ? 'rounded-xl' : 'rounded-full',
              compact ? 'h-14 w-14' : 'h-16 w-16',
            )}
            aria-hidden
          >
            {displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className={cn('font-semibold tracking-tight', compact ? 'text-base' : 'text-lg')}>
            {displayName}
          </h3>
          {tagline ? (
            <p className="mt-1 text-sm leading-snug text-white/85">{tagline}</p>
          ) : (
            <p className="mt-1 text-sm text-white/55">Add a tagline to complete your card</p>
          )}
          {meta ? <p className="mt-2 text-xs font-medium text-white/70">{meta}</p> : null}
        </div>
      </div>

      {contacts.length > 0 ? (
        <div className="mt-5 space-y-1 border-t border-white/15 pt-4 text-sm text-white/90">
          {contacts.map((line) => (
            <p key={line} className="truncate">
              {line}
            </p>
          ))}
        </div>
      ) : null}

      {website || publicUrl ? (
        <div className="mt-4 space-y-1 break-all text-xs text-white/70">
          {website ? <p>{website}</p> : null}
          {publicUrl ? <p>{publicUrl}</p> : null}
        </div>
      ) : null}
    </article>
  );

  if (loading) {
    return (
      <section className={compact ? undefined : 'mx-auto max-w-7xl'}>
        {!compact ? (
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-stone-100">
            Business card
          </h2>
        ) : (
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
            Preview
          </p>
        )}
        <div className="mt-3 h-40 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
      </section>
    );
  }

  return (
    <section className={compact ? undefined : 'mx-auto max-w-7xl'}>
      <div
        className={cn(
          'mb-4 flex flex-col gap-3',
          compact ? 'sm:gap-2' : 'sm:flex-row sm:items-end sm:justify-between',
        )}
      >
        <div>
          {compact ? (
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">Preview</p>
          ) : (
            <>
              <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-stone-100">
                Business card
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Generated from your business profile. Print or save for networking.
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!hasContent}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl bg-[#52C47F] text-sm font-semibold text-white transition hover:bg-[#43b06c] disabled:cursor-not-allowed disabled:opacity-50',
            compact ? 'w-full px-4 py-2.5' : 'px-5 py-2.5',
          )}
        >
          <Download className="h-4 w-4" />
          {compact ? 'Download card' : 'Download / Print card'}
        </button>
      </div>

      {cardBody}

      {/* Print-only markup kept off-screen for the print helpers */}
      <div className="sr-only" aria-hidden="true">
        <div ref={printRef} className="bc-a4-sheet">
          <article className="bc-card">
            <header className="bc-header">
              {profile?.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt=""
                  className="bc-logo"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="bc-logo-placeholder" aria-hidden />
              )}

              <div className="min-w-0 flex-1">
                <h1 className="bc-name">{displayName}</h1>
                {tagline ? <p className="bc-tagline">{tagline}</p> : null}
                {meta ? <p className="bc-meta">{meta}</p> : null}
              </div>
            </header>

            {contacts.length > 0 ? (
              <div className="bc-contact">
                {contacts.map((line) => (
                  <p key={line} className="bc-contact-line">
                    {line}
                  </p>
                ))}
              </div>
            ) : null}

            {website || publicUrl ? (
              <footer className="bc-footer">
                {website ? <div>{website}</div> : null}
                {publicUrl ? <div>{publicUrl}</div> : null}
              </footer>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  );
}
