/**
 * @deprecated Import from `@/components/skeletons` instead.
 * Re-exports preserved for backward compatibility.
 */
import { cn } from '@/lib/utils';
import {
  CarouselSkeleton,
  GridSkeleton,
  JobCardSkeleton,
  ListSkeleton,
  ProjectCardSkeleton,
  ServiceCardSkeleton,
} from '@/components/skeletons';

export function MarketplaceBrowseRowSkeleton({
  className,
}: {
  className?: string;
}) {
  return <ProjectCardSkeleton className={className} />;
}

export function MarketplaceBrowseRowListSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return <ListSkeleton count={count} cardType="project" className={className} label="Loading listings" />;
}

export function MarketplaceServiceCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return <ServiceCardSkeleton className={className} />;
}

export function MarketplaceServiceCarouselSkeleton({ count = 5 }: { count?: number }) {
  return <CarouselSkeleton count={count} showHeader={false} className="p-0" />;
}

export function MarketplaceServiceGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return <GridSkeleton count={count} cardType="service" className={className} label="Loading services" />;
}

export function MarketplaceJobCardSkeleton({ className }: { className?: string }) {
  return <JobCardSkeleton className={className} />;
}

export function MarketplaceJobGridSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <GridSkeleton
      count={count}
      cardType="job"
      className={cn('mt-2', className)}
      label="Loading jobs"
    />
  );
}

export function MarketplaceFreelancerGridSkeleton({
  count = 12,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <GridSkeleton
      count={count}
      cardType="job"
      className={className}
      compact
      showActions={false}
      label="Loading freelancers"
    />
  );
}
