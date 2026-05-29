'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Star,
  Users,
  UserPlus,
  ChevronLeft,
  Loader2,
  BadgeCheck,
  Briefcase,
  Car,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Navbar from '@/components/common/navbar';
import UserAvatar from '@/components/common/UserAvatar';
import { userService } from '@/services/user.service';
import { reviewService } from '@/services/review.service';
import { getMediaUrl } from '@/lib/utils';
import {
  extractReviewList,
  formatCompletionRate,
  formatProfileRating,
  formatReviewTimeAgo,
  groupProfileSkills,
  reviewerDisplayName,
} from '@/lib/publicProfile';
import type { PublicProfileReview, PublicUserProfile } from '@/types/publicProfile';
import type { PortfolioItem, UserSkill } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import PublicPortfolioGallery from '@/components/users/PublicPortfolioGallery';
import PublicLicenceBadges, {
  getVerifiedLicenceBadges,
} from '@/components/users/PublicLicenceBadges';
import PublicProfileSection from '@/components/users/PublicProfileSection';

interface PublicUserProfileProps {
  slug: string;
}

export default function PublicUserProfile({ slug }: PublicUserProfileProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [reviews, setReviews] = useState<PublicProfileReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  const loadProfile = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setPortfolioItems([]);
    try {
      const res = await userService.getPublicProfileByUsername(slug);
      if (!res.success || !res.data) {
        setProfile(null);
        setError(res.message || 'User not found');
        return;
      }
      setProfile(res.data);
      setFollowersCount(res.data.followers_count ?? 0);
      setIsFollowing(Boolean(res.data.is_following));
      if (
        slug &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug) &&
        res.data.username &&
        String(res.data.username).trim() &&
        String(res.data.username).toLowerCase() !== slug.toLowerCase()
      ) {
        router.replace(`/users/${encodeURIComponent(String(res.data.username))}`);
      }

      try {
        const reviewsRes = await reviewService.getUserReviews(res.data.id);
        if (reviewsRes.success && reviewsRes.data) {
          const list = Array.isArray(reviewsRes.data.results) ? reviewsRes.data.results : [];
          setReviews(extractReviewList(list as never));
        } else {
          setReviews([]);
        }
      } catch {
        setReviews([]);
      }

      try {
        const portfolioRes = await userService.getPortfolio(res.data.id);
        if (portfolioRes.success && Array.isArray(portfolioRes.data)) {
          setPortfolioItems(portfolioRes.data);
        } else {
          setPortfolioItems([]);
        }
      } catch {
        setPortfolioItems([]);
      }
    } catch (err) {
      setProfile(null);
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Failed to load profile';
      setError(message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const visibleReviews = useMemo(
    () => (showAllReviews ? reviews : reviews.slice(0, 6)),
    [reviews, showAllReviews],
  );

  const skillGroups = useMemo(
    () => groupProfileSkills(profile?.skills),
    [profile?.skills],
  );

  const verifiedLicences = useMemo(
    () => getVerifiedLicenceBadges(profile?.badges),
    [profile?.badges],
  );

  const ratingDisplay = formatProfileRating(profile?.average_rating);
  const reviewCount = profile?.total_reviews ?? reviews.length;
  const completionDisplay = formatCompletionRate(
    profile?.completion_rate,
    profile?.tasks_completed,
  );
  const tasksCount = profile?.tasks_completed ?? 0;

  const isOwnProfile =
    currentUser?.id && profile?.id && String(currentUser.id) === String(profile.id);

  const handleFollow = async () => {
    if (isOwnProfile || !profile?.id) return;
    if (!currentUser) {
      router.push('/signin');
      return;
    }
    try {
      const res = isFollowing
        ? await userService.unfollowUser(profile.id)
        : await userService.followUser(profile.id);
      if (!res.success || !res.data) {
        toast.error(res.message || 'Could not update follow status');
        return;
      }
      setIsFollowing(res.data.is_following);
      setFollowersCount(res.data.followers_count ?? 0);
      toast.success(res.data.is_following ? 'Following' : 'Unfollowed');
    } catch {
      toast.error('Could not update follow status');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-100">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-100">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-2 text-2xl font-bold text-[#000d45]">Profile not found</h1>
          <p className="mb-6 text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => router.push('/task')}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Browse tasks
          </button>
        </div>
      </div>
    );
  }

  const avatar = getMediaUrl(profile.profile_image);
  const displayName = profile.display_name || profile.full_name;
  const onlineLabel = profile.online_status || (profile.is_online ? 'Online now' : 'Offline');
  const taskSkills = skillGroups.skill;
  const transportLabels =
    skillGroups.transport.length > 0
      ? skillGroups.transport.map((s) => s.name)
      : (profile.transportation_tags ?? []);
  const languageSkills = skillGroups.language;
  const qualificationSkills = skillGroups.qualification;
  const experienceSkills = skillGroups.experience;

  const hasSkills =
    taskSkills.length > 0 ||
    languageSkills.length > 0 ||
    qualificationSkills.length > 0 ||
    experienceSkills.length > 0;

  const navLinks = [
    profile.bio ? { href: '#about', label: 'About' } : null,
    verifiedLicences.length ? { href: '#licences', label: 'Licences' } : null,
    hasSkills ? { href: '#skills', label: 'Skills' } : null,
    portfolioItems.length ? { href: '#portfolio', label: 'Portfolio' } : null,
    { href: '#reviews', label: 'Reviews' },
  ].filter(Boolean) as { href: string; label: string }[];

  const memberSince = profile.date_joined
    ? format(new Date(profile.date_joined), 'MMMM yyyy')
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Hero */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#000d45] via-[#0c2860] to-[#1161fe] text-white shadow-lg">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            aria-hidden
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 40%)',
            }}
          />

          <div className="relative px-6 pb-6 pt-8 sm:px-10 sm:pb-8 sm:pt-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <UserAvatar
                  src={avatar}
                  name={profile.full_name}
                  size="xl"
                  className="!h-24 !w-24 shrink-0 ring-4 ring-white/20 shadow-xl sm:!h-28 sm:!w-28"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/70">
                    {profile.role === 'tasker' ? 'Tasker profile' : 'Member profile'}
                  </p>
                  <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                    {displayName}
                  </h1>
                  {profile.username ? (
                    <p className="mt-1 text-sm text-white/60">@{profile.username}</p>
                  ) : null}
                  {profile.tagline ? (
                    <p className="mt-2 max-w-lg text-base text-white/85">{profile.tagline}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-medium backdrop-blur-sm">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          profile.is_online ? 'bg-emerald-400' : 'bg-white/40'
                        }`}
                      />
                      {onlineLabel}
                    </span>
                    {profile.location_display ? (
                      <span className="inline-flex items-center gap-1.5 text-white/80">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {profile.location_display}
                      </span>
                    ) : null}
                    {profile.is_verified_tasker ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified tasker
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {!isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => void handleFollow()}
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
                    isFollowing
                      ? 'bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/20'
                      : 'bg-white text-[#000d45] hover:bg-white/95'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              ) : null}
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  Rating
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold">
                  {ratingDisplay}
                  {Number(ratingDisplay) > 0 ? (
                    <Star className="h-5 w-5 fill-amber-300 text-amber-300" />
                  ) : null}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  Reviews
                </p>
                <Link
                  href="#reviews"
                  className="mt-1 block text-2xl font-bold hover:underline"
                >
                  {reviewCount}
                </Link>
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  Completion
                </p>
                <p className="mt-1 text-2xl font-bold">{completionDisplay}</p>
                <p className="text-xs text-white/60">
                  {tasksCount} {tasksCount === 1 ? 'task' : 'tasks'}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  Followers
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold">
                  <Users className="h-5 w-5 text-white/70" />
                  {followersCount}
                </p>
              </div>
            </div>

            {verifiedLicences.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                {verifiedLicences.map((badge) => (
                  <span
                    key={badge.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/25 px-3 py-1.5 text-xs font-semibold text-emerald-50 ring-1 ring-emerald-400/30"
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {badge.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        {/* In-page nav */}
        {navLinks.length > 1 ? (
          <nav
            className="sticky top-0 z-10 -mx-4 mt-4 border-b border-slate-200/80 bg-slate-100/95 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6"
            aria-label="Profile sections"
          >
            <ul className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {navLinks.map((link) => (
                <li key={link.href} className="shrink-0">
                  <a
                    href={link.href}
                    className="inline-block rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-[#000d45]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div className="mt-6 space-y-6">
          {profile.bio ? (
            <PublicProfileSection id="about" title="About">
              <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-700">
                {profile.bio}
              </p>
            </PublicProfileSection>
          ) : null}

          <PublicLicenceBadges badges={profile.badges} />

          {hasSkills ? (
            <PublicProfileSection
              id="skills"
              eyebrow="Expertise"
              title="Skills & experience"
              description={
                taskSkills.length > 0
                  ? `${taskSkills.length} service ${taskSkills.length === 1 ? 'area' : 'areas'}`
                  : undefined
              }
            >
              <SkillsContent
                taskSkills={taskSkills}
                languageSkills={languageSkills}
                qualificationSkills={qualificationSkills}
                experienceSkills={experienceSkills}
              />
            </PublicProfileSection>
          ) : null}

          <PublicPortfolioGallery items={portfolioItems} />

          <PublicProfileSection
            id="reviews"
            title="Reviews"
            description={
              reviewCount > 0
                ? `${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'} from clients`
                : 'No reviews yet'
            }
            action={
              reviews.length > 6 && !showAllReviews ? (
                <button
                  type="button"
                  onClick={() => setShowAllReviews(true)}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View all
                </button>
              ) : null
            }
          >
            {reviews.length === 0 ? (
              <p className="text-center text-slate-500 py-6">No reviews yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {visibleReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
            {reviews.length > 6 && !showAllReviews ? (
              <button
                type="button"
                onClick={() => setShowAllReviews(true)}
                className="mt-4 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                Show all {reviews.length} reviews
              </button>
            ) : null}
          </PublicProfileSection>

          {(transportLabels.length > 0 || memberSince) && (
            <footer className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              {transportLabels.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Car className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">Transport:</span>
                  {transportLabels.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-3 py-1 text-sm font-medium text-[#000d45] ring-1 ring-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              {memberSince ? (
                <p className="text-sm text-slate-500">Member since {memberSince}</p>
              ) : null}
            </footer>
          )}
        </div>
      </main>
    </div>
  );
}

function SkillTag({ skill, verifiedStyle }: { skill: UserSkill; verifiedStyle?: boolean }) {
  const verified = Boolean(skill.verified);
  return (
    <span
      className={
        verifiedStyle
          ? `inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ${
              verified
                ? 'bg-emerald-50 text-emerald-900 ring-emerald-200'
                : 'bg-slate-50 text-[#000d45] ring-slate-200'
            }`
          : 'rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-[#000d45] ring-1 ring-slate-200/80'
      }
    >
      {verifiedStyle ? (
        <span
          className={`h-1.5 w-1.5 rounded-full ${verified ? 'bg-emerald-500' : 'bg-slate-400'}`}
          aria-hidden
        />
      ) : null}
      {skill.name}
    </span>
  );
}

function SkillGroup({
  title,
  skills,
  verifiedStyle,
}: {
  title: string;
  skills: UserSkill[];
  verifiedStyle?: boolean;
}) {
  if (!skills.length) return null;
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#000d45]">
        <Briefcase className="h-4 w-4 text-slate-400" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <SkillTag key={String(s.id ?? s.name)} skill={s} verifiedStyle={verifiedStyle} />
        ))}
      </div>
    </div>
  );
}

function SkillsContent({
  taskSkills,
  languageSkills,
  qualificationSkills,
  experienceSkills,
}: {
  taskSkills: UserSkill[];
  languageSkills: UserSkill[];
  qualificationSkills: UserSkill[];
  experienceSkills: UserSkill[];
}) {
  return (
    <div className="space-y-8">
      <SkillGroup title="Services" skills={taskSkills} verifiedStyle />
      <SkillGroup title="Languages" skills={languageSkills} />
      <SkillGroup title="Qualifications" skills={qualificationSkills} />
      <SkillGroup title="Work experience" skills={experienceSkills} />
    </div>
  );
}

function ReviewCard({ review }: { review: PublicProfileReview }) {
  const reviewerName = reviewerDisplayName(review.reviewer);
  const reviewerImg = getMediaUrl(review.reviewer?.profile_image);

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex items-start gap-3">
        <UserAvatar src={reviewerImg} name={reviewerName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#000d45]">{reviewerName}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-0.5 text-amber-600">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-sm font-bold">{review.rating}</span>
            </span>
            {review.created_at ? (
              <span className="text-xs text-slate-500">
                {formatReviewTimeAgo(review.created_at)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {review.comment ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.comment}</p>
      ) : null}
      {review.task_title ? (
        <p className="mt-2 text-xs font-medium text-slate-500">Task: {review.task_title}</p>
      ) : null}
    </article>
  );
}
