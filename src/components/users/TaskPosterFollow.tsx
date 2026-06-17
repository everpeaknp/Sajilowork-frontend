'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import UserAvatar from '@/components/common/UserAvatar';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/auth.store';

interface TaskPosterFollowProps {
  posterId: string | null;
  profileSlug: string | null;
  posterName: string;
  posterAvatar: string;
  posterVerified?: boolean;
}

export default function TaskPosterFollow({
  posterId,
  profileSlug,
  posterName,
  posterAvatar,
  posterVerified = false,
}: TaskPosterFollowProps) {
  const { user } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile =
    posterId && user?.id && String(user?.id) === String(posterId);

  const profileSegment = profileSlug || posterId;
  const profileHref = profileSegment
    ? `/users/${encodeURIComponent(profileSegment)}`
    : null;

  useEffect(() => {
    if (!posterId) return;
    let cancelled = false;
    void userService.getFollowStatus(posterId).then((res) => {
      if (cancelled || !res.success || !res.data) return;
      setIsFollowing(res.data.is_following);
    });
    return () => {
      cancelled = true;
    };
  }, [posterId]);

  const handleFollow = useCallback(async () => {
    if (!posterId || isOwnProfile) return;
    if (!user) {
      window.location.href = '/signin';
      return;
    }
    setFollowLoading(true);
    try {
      const res = isFollowing
        ? await userService.unfollowUser(posterId)
        : await userService.followUser(posterId);
      if (!res.success || !res.data) {
        toast.error(res.message || 'Could not update follow status');
        return;
      }
      setIsFollowing(res.data.is_following);
      toast.success(res.data.is_following ? 'Following' : 'Unfollowed');
    } catch {
      toast.error('Could not update follow status');
    } finally {
      setFollowLoading(false);
    }
  }, [posterId, isOwnProfile, user, isFollowing]);

  const avatar = profileHref ? (
    <Link href={profileHref} className="shrink-0 overflow-visible rounded-full">
      <UserAvatar
        src={posterAvatar}
        alt={posterName}
        name={posterName}
        size="lg"
        verified={posterVerified}
      />
    </Link>
  ) : (
    <UserAvatar
      src={posterAvatar}
      alt={posterName}
      name={posterName}
      size="lg"
      verified={posterVerified}
    />
  );

  return (
    <div className="flex items-start gap-3 md:gap-4 overflow-visible px-1 sm:px-2">
      <div className="shrink-0 overflow-visible">{avatar}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] md:text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">
          Posted by
        </p>
        {profileHref ? (
          <Link
            href={profileHref}
            className="font-bold text-brand-emerald text-base md:text-lg truncate block hover:underline"
          >
            {posterName}
          </Link>
        ) : (
          <p className="font-bold text-brand-emerald text-base md:text-lg truncate">{posterName}</p>
        )}
      </div>
      {posterId && !isOwnProfile && (
        <button
          type="button"
          onClick={() => void handleFollow()}
          disabled={followLoading}
          className={`shrink-0 px-3 md:px-4 py-1.5 md:py-2 border-2 font-semibold text-xs md:text-sm rounded-full transition-all whitespace-nowrap disabled:opacity-60 ${
            isFollowing
              ? 'border-outline-variant text-on-surface-variant bg-surface-dim hover:bg-surface-variant/30'
              : 'border-brand-emerald text-brand-emerald hover:bg-brand-emerald hover:text-white'
          }`}
        >
          {followLoading ? '…' : isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
}
