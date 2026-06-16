import type { Bid } from '@/types';

export type CheckoutKind = 'task' | 'project' | 'service' | 'job';

export function isCheckoutKind(value: string): value is CheckoutKind {
  return value === 'task' || value === 'project' || value === 'service' || value === 'job';
}

export function getCheckoutHref(
  kind: CheckoutKind,
  slug: string,
  options?: { packageId?: string },
): string {
  const base = `/checkout/${kind}/${encodeURIComponent(slug)}`;
  if (options?.packageId) {
    return `${base}?package=${encodeURIComponent(options.packageId)}`;
  }
  return base;
}

export function getCheckoutActionLabel(kind: CheckoutKind): string {
  switch (kind) {
    case 'project':
      return 'Send proposal';
    case 'service':
      return 'Complete purchase';
    case 'job':
      return 'Apply for this job';
    default:
      return 'Make offer';
  }
}

export function getCheckoutPageTitle(kind: CheckoutKind): string {
  switch (kind) {
    case 'project':
      return 'Proposal checkout';
    case 'service':
      return 'Service checkout';
    case 'job':
      return 'Job application checkout';
    default:
      return 'Offer checkout';
  }
}

export type CheckoutSuccessPayload = {
  bid?: Bid;
  orderTaskSlug?: string;
  bidId?: string;
  conversationId?: string;
};

export function getCheckoutSuccessRedirect(
  kind: CheckoutKind,
  payload: CheckoutSuccessPayload = {},
): string {
  const bidId = payload.bidId ?? (payload.bid?.id ? String(payload.bid.id) : undefined);
  const slug =
    payload.orderTaskSlug ??
    payload.bid?.task_slug ??
    (typeof payload.bid?.task === 'object' && payload.bid.task && 'slug' in payload.bid.task
      ? String((payload.bid.task as { slug?: string }).slug ?? '')
      : undefined);

  switch (kind) {
    case 'service':
      if (payload.conversationId) {
        return `/dashboard/message?conversation=${encodeURIComponent(payload.conversationId)}`;
      }
      if (slug && bidId) {
        return `/dashboard/proposals/${encodeURIComponent(slug)}/${encodeURIComponent(bidId)}?from=orders`;
      }
      return '/dashboard/orders';
    case 'job':
      return '/dashboard/proposals';
    case 'project':
      if (slug && bidId) {
        return `/dashboard/proposals/${encodeURIComponent(slug)}/${encodeURIComponent(bidId)}?from=proposals`;
      }
      return '/dashboard/proposals';
    case 'task':
    default:
      if (slug && bidId) {
        return `/dashboard/proposals/${encodeURIComponent(slug)}/${encodeURIComponent(bidId)}?from=contracts`;
      }
      return '/dashboard/contracts';
  }
}

export function isOfferProfileGateComplete(user: {
  profile_image?: string | null;
  date_of_birth?: string | null;
  has_payment_method?: boolean;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
} | null | undefined): boolean {
  if (!user) return false;
  return Boolean(
    user.profile_image &&
      user.date_of_birth &&
      user.has_payment_method &&
      user.address &&
      user.city &&
      user.postal_code,
  );
}

export function getListingDetailHref(kind: CheckoutKind, slug: string): string {
  switch (kind) {
    case 'project':
      return `/projects/${encodeURIComponent(slug)}`;
    case 'service':
      return `/services/${encodeURIComponent(slug)}`;
    case 'job':
      return `/jobs/${encodeURIComponent(slug)}`;
    default:
      return `/task/${encodeURIComponent(slug)}`;
  }
}
