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

export default function EmployerBusinessCardPreview() {
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
      : [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Your business';

  const publicPath = getEmployerBusinessProfileHref({ username: profile?.slug || user?.username });
  const publicUrl =
    typeof window !== 'undefined' && publicPath
      ? `${window.location.origin}${publicPath}`
      : publicPath || '';

  const contacts = profile ? contactLines(profile) : [];
  const meta = profile ? metaLine(profile) : '';
  const website = profile?.website?.trim() ?? '';
  const tagline = profile?.tagline?.trim() ?? '';

  const hasContent = Boolean(
    profile &&
      (displayName !== 'Your business' ||
        tagline ||
        contacts.length > 0 ||
        website),
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

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-stone-100">Your business card</h2>
        <p className="mt-4 text-sm text-neutral-500">Loading…</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-stone-100">Your business card</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Generated from your business profile. Print or save as PDF for networking and hiring.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!hasContent}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#52C47F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#43b06c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download / Print card
        </button>
      </div>

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
