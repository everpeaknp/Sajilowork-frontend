import type { Category, Task, User } from '@/types';
import { TASK_BROWSE_PATH, taskMapPathWithQuery } from '@/lib/taskBrowsePath';
import { formatNPR } from '@/lib/nepalLocale';
import { taskBudgetAmount } from '@/lib/taskFilters';
import { extractTaskList } from '@/lib/taskUtils';
import { getMediaUrl } from '@/lib/utils';
import { IMAGES, RECENT_TASKS, TOP_TASKERS } from '@/components/constants';
import type { PaginatedResponse } from '@/types';

export type LandingTaskCard = {
  id: string;
  slug: string;
  user: string;
  avatar: string;
  task: string;
  price: string;
  category: string;
  rating: number;
};

export type LandingTaskerCard = {
  id: string;
  name: string;
  type: string;
  avatar: string;
  rating: number;
  totalRatings: number;
  completionRate: number;
  specialities: string[];
  description: string;
  profileHref: string;
  topReview?: { text: string; author: string };
};

export type CategoryColumn = {
  title: string;
  links: { label: string; href: string }[];
};

import { postTaskHref as buildPostTaskHref } from '@/lib/postTaskPath';

export function browseTasksHref(category?: string): string {
  return taskMapPathWithQuery(category);
}

/** Title-only helper for marketing/category links. */
export function postTaskHref(title?: string): string {
  return buildPostTaskHref(title ? { title } : undefined);
}

export function publicUserHref(user: Pick<User, 'id' | 'username'>): string {
  const slug = user.username?.trim() || user.id;
  return `/users/${encodeURIComponent(String(slug))}`;
}

export function unwrapList<T>(data: PaginatedResponse<T> | T[] | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export function getTaskCategoryName(task: Task): string {
  if (typeof task.category === 'object' && task.category?.name) {
    return task.category.name;
  }
  return task.category_name || (typeof task.category === 'string' ? task.category : '');
}

export function mapTaskToLandingCard(task: Task): LandingTaskCard {
  const budget = taskBudgetAmount(task);
  const ratingRaw = task.owner_rating ?? 5;
  const rating = Number(ratingRaw);
  return {
    id: task.id,
    slug: task.slug || task.id,
    user: task.owner_name || 'Task poster',
    avatar: getMediaUrl(task.owner_image) || IMAGES.AVATAR_SARAH,
    task: task.title || 'Task',
    price: formatNPR(budget),
    category: getTaskCategoryName(task) || 'General',
    rating: Number.isFinite(rating) ? rating : 5,
  };
}

export function mapTasksFromResponse(
  data: PaginatedResponse<Task> | Task[] | null | undefined
): LandingTaskCard[] {
  return extractTaskList(data).map(mapTaskToLandingCard);
}

export function mapUserToLandingTasker(user: User): LandingTaskerCard {
  const first = (user.first_name || '').trim();
  const last = (user.last_name || '').trim();
  const display =
    (user.full_name || `${first} ${last}`.trim() || user.username || 'Tasker').trim();
  const rating = Number(user.average_rating ?? 0);
  const reviews = user.total_reviews ?? 0;
  const completed = user.completed_tasks ?? 0;
  const success = Number(user.success_rate ?? 0);
  const completionRate =
    success > 0 ? Math.round(success) : completed > 0 ? Math.min(99, 85 + (completed % 15)) : 90;

  return {
    id: user.id,
    name: display.toUpperCase(),
    type: user.is_verified_tasker ? 'Verified Tasker' : 'Local Tasker',
    avatar: getMediaUrl(user.profile_image) || IMAGES.TASKER_MARK,
    rating: rating > 0 ? Math.round(rating * 10) / 10 : 5,
    totalRatings: reviews,
    completionRate,
    specialities: user.bio
      ? [user.bio.slice(0, 48) + (user.bio.length > 48 ? '…' : '')]
      : ['General services'],
    description:
      user.bio?.trim() ||
      `${display} is an active tasker on SajiloWork, ready to help with local jobs in your area.`,
    profileHref: publicUserHref(user),
    topReview: reviews
      ? {
          text: `Highly rated by ${reviews} community review${reviews === 1 ? '' : 's'}.`,
          author: 'SajiloWork member',
        }
      : undefined,
  };
}

/** Top-level categories with subcategory links for the directory section. */
export function buildCategoryColumns(categories: Category[]): CategoryColumn[] {
  if (!categories.length) return [];

  const roots = categories.filter((c) => !c.parent);
  const source = roots.length > 0 ? roots : categories;

  return source.slice(0, 5).map((root) => {
    const subs = root.subcategories?.length
      ? root.subcategories
      : categories.filter((c) => {
          const parentId =
            typeof c.parent === 'object' ? c.parent?.id : c.parent;
          return parentId === root.id;
        });

    const links =
      subs.length > 0
        ? subs.slice(0, 6).map((sub) => ({
            label: sub.name,
            href: browseTasksHref(sub.name),
          }))
        : [
            {
              label: `Browse ${root.name}`,
              href: browseTasksHref(root.name),
            },
            {
              label: `Post a ${root.name} task`,
              href: postTaskHref(root.name),
            },
          ];

    return { title: root.name, links };
  });
}

export function topCategoryNames(categories: Category[], limit = 16): string[] {
  const names = categories
    .filter((c) => c.is_active !== false)
    .map((c) => c.name)
    .filter(Boolean);
  const unique = [...new Set(names)];
  return unique.slice(0, limit);
}

/** Minimum cards for a full landing task marquee (two rows of four). */
export const LANDING_TASK_FEED_MIN = 8;

/** Minimum tasker cards in the earnings carousel. */
export const LANDING_TASKER_MIN = 3;

export function isMockLandingTask(card: Pick<LandingTaskCard, 'id' | 'slug'>): boolean {
  return card.id.startsWith('fallback-') || card.slug.startsWith('fallback-');
}

export function buildMockLandingTaskCards(): LandingTaskCard[] {
  return RECENT_TASKS.map((t, i) => ({
    id: `fallback-${i}`,
    slug: `fallback-${i}`,
    user: t.user,
    avatar: t.avatar,
    task: t.task,
    price: t.price,
    category: t.category,
    rating: t.rating ?? 5,
  }));
}

/**
 * Use real tasks when enough exist; otherwise pad with mock cards so the UI stays full.
 */
export function ensureLandingTaskCards(
  real: LandingTaskCard[],
  minCount = LANDING_TASK_FEED_MIN,
  categoryFilter?: string | null
): LandingTaskCard[] {
  if (real.length >= minCount) return real;

  let pool = buildMockLandingTaskCards();
  if (categoryFilter?.trim()) {
    const norm = categoryFilter.trim().toUpperCase();
    const matching = pool.filter((m) => m.category.toUpperCase() === norm);
    const rest = pool.filter((m) => m.category.toUpperCase() !== norm);
    pool = [...matching, ...rest];
  }

  const merged: LandingTaskCard[] = [...real];
  let poolIndex = 0;
  while (merged.length < minCount) {
    const mock = pool[poolIndex % pool.length];
    poolIndex += 1;
    merged.push({
      ...mock,
      id: `fallback-pad-${merged.length}`,
      slug: `fallback-pad-${merged.length}`,
    });
  }
  return merged;
}

export function buildMockLandingTaskerCards(): LandingTaskerCard[] {
  return TOP_TASKERS.map((t, i) => ({
    id: `fallback-${i}`,
    name: t.name,
    type: t.type,
    avatar: t.avatar,
    rating: t.rating,
    totalRatings: t.totalRatings,
    completionRate: t.completionRate,
    specialities: t.specialities ?? [],
    description: t.description,
    profileHref: TASK_BROWSE_PATH,
    topReview: t.topReview,
  }));
}

export function ensureLandingTaskers(
  real: LandingTaskerCard[],
  minCount = LANDING_TASKER_MIN
): LandingTaskerCard[] {
  if (real.length >= minCount) return real;

  const merged: LandingTaskerCard[] = [...real];
  const pool = buildMockLandingTaskerCards();
  let poolIndex = 0;
  while (merged.length < minCount) {
    const mock = pool[poolIndex % pool.length];
    poolIndex += 1;
    merged.push({
      ...mock,
      id: `fallback-pad-${merged.length}`,
    });
  }
  return merged;
}
