'use client';

import Link from 'next/link';
import { ArrowUpRight, Star } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import { cn, getMediaUrl } from '@/lib/utils';
import { formatProfileRating } from '@/lib/publicProfile';
import type { UserDirectoryEntry } from '@/services/user.service';

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

interface PublicUserDirectoryCardProps {
  user: UserDirectoryEntry;
  href: string;
  className?: string;
}

export default function PublicUserDirectoryCard({
  user,
  href,
  className = '',
}: PublicUserDirectoryCardProps) {
  const avatar = getMediaUrl(user.profile_image);
  const fullName = user.full_name?.trim() || '';
  const username = user.username?.trim() || '';
  const headingName = fullName || username || 'Member';
  const avatarName = headingName;
  const ratingDisplay = formatProfileRating(user.average_rating);
  const reviewCount = toNumber(user.total_reviews);
  const tasksCount = toNumber(user.tasks_completed);
  const bio = user.bio?.trim();
  const tagline = user.tagline?.trim();

  return (
    <Link
      href={href}
      className={`group block h-full ${className}`}
      aria-label={`View ${headingName}'s profile`}
    >
      <article className="relative flex h-full min-h-[400px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-brand-dark via-[#1e5c48] to-brand-emerald text-white shadow-lg transition-shadow hover:shadow-xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 40%)',
          }}
        />

        <div className="relative flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-col items-center text-center">
            <UserAvatar
              src={avatar}
              name={avatarName}
              size="xl"
              verified={user.is_verified_tasker}
              className="!h-20 !w-20 ring-4 ring-white/20 shadow-xl"
            />
            {username ? (
              <p className="mt-4 text-sm text-white/60">@{username}</p>
            ) : null}
            <h2
              className={cn(
                'line-clamp-2 text-xl font-bold tracking-tight',
                username ? 'mt-1' : 'mt-4',
              )}
            >
              {headingName}
            </h2>
            {tagline ? (
              <p className="mt-2 line-clamp-2 text-sm text-white/85">{tagline}</p>
            ) : null}

            {user.is_online ? (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Online now
                </span>
              </div>
            ) : null}
          </div>

          {bio ? (
            <p className="mt-4 line-clamp-3 text-center text-sm leading-relaxed text-white/75">
              {bio}
            </p>
          ) : (
            <p className="mt-4 line-clamp-3 text-center text-sm leading-relaxed text-white/50">
              {reviewCount > 0 && Number(ratingDisplay) > 0
                ? `${ratingDisplay}★ from ${reviewCount} review${reviewCount === 1 ? '' : 's'}`
                : 'No bio yet.'}
            </p>
          )}

          <div className="mt-auto grid grid-cols-3 gap-2 pt-5">
            <div className="rounded-xl bg-white/10 px-3 py-2.5 text-center backdrop-blur-sm">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/60">
                Rating
              </p>
              <p className="mt-1 flex items-center justify-center gap-1 text-lg font-bold">
                {ratingDisplay}
                {Number(ratingDisplay) > 0 ? (
                  <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                ) : null}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2.5 text-center backdrop-blur-sm">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/60">
                Reviews
              </p>
              <p className="mt-1 text-lg font-bold">{reviewCount}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2.5 text-center backdrop-blur-sm">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/60">
                Tasks
              </p>
              <p className="mt-1 text-lg font-bold">{tasksCount}</p>
            </div>
          </div>

          <span className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-dark transition-colors group-hover:bg-white/95">
            View profile
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}
