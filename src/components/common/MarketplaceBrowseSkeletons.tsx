import { cn } from '@/lib/utils';

export function MarketplaceBrowseRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex w-full animate-pulse flex-col overflow-hidden rounded-[8px] border border-neutral-200/90 bg-white p-4 sm:p-6 lg:h-[248px] lg:min-h-[248px] lg:max-h-[248px] lg:flex-row lg:items-stretch',
        className,
      )}
      aria-hidden
    >
      <div className="flex min-h-0 min-w-0 flex-1 gap-3 sm:gap-5">
        <div className="h-12 w-12 shrink-0 rounded-full bg-neutral-200" />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
          <div className="h-5 w-2/3 max-w-md rounded bg-neutral-200" />
          <div className="flex flex-wrap gap-2">
            <div className="h-3.5 w-24 rounded bg-neutral-100" />
            <div className="h-3.5 w-20 rounded bg-neutral-100" />
            <div className="h-3.5 w-28 rounded bg-neutral-100" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-full max-w-lg rounded bg-neutral-100" />
            <div className="h-3.5 w-4/5 max-w-md rounded bg-neutral-100" />
          </div>
          <div className="mt-auto flex max-h-[34px] flex-wrap gap-1.5 overflow-hidden">
            <div className="h-7 w-16 rounded-full bg-neutral-100" />
            <div className="h-7 w-20 rounded-full bg-neutral-100" />
            <div className="h-7 w-14 rounded-full bg-neutral-100" />
          </div>
        </div>
      </div>
      <div className="relative mt-4 shrink-0 border-t border-neutral-100 pt-4 sm:pt-5 lg:mt-0 lg:flex lg:w-auto lg:self-stretch lg:border-0 lg:border-l lg:border-neutral-200 lg:pl-8 lg:pt-0">
        <div className="flex h-full w-full min-w-0 flex-col items-stretch justify-between gap-4 sm:items-end lg:min-w-[260px]">
          <div className="h-6 w-28 rounded bg-neutral-200 sm:ml-auto" />
          <div className="h-9 w-32 rounded-lg bg-neutral-100 sm:ml-auto" />
        </div>
      </div>
    </div>
  );
}

export function MarketplaceBrowseRowListSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)} aria-busy="true" aria-label="Loading listings">
      {Array.from({ length: count }).map((_, index) => (
        <MarketplaceBrowseRowSkeleton key={index} />
      ))}
    </div>
  );
}

export function MarketplaceServiceCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col justify-between overflow-hidden rounded-none border border-neutral-300 bg-white',
        className,
      )}
      aria-hidden
    >
      <div className="aspect-[1.18/1] w-full flex-shrink-0 animate-pulse bg-neutral-200" />
      <div className="flex flex-1 animate-pulse flex-col justify-between p-5 sm:p-6">
        <div className="space-y-2.5">
          <div className="h-3 w-16 rounded bg-neutral-100" />
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-4 w-[80%] rounded bg-neutral-100" />
          <div className="h-3.5 w-24 rounded bg-neutral-100" />
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-neutral-300 pt-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="h-7 w-7 shrink-0 rounded-full bg-neutral-200" />
            <div className="h-3 w-20 rounded bg-neutral-100" />
          </div>
          <div className="shrink-0 space-y-1 text-right">
            <div className="ml-auto h-2.5 w-14 rounded bg-neutral-100" />
            <div className="ml-auto h-4 w-20 rounded bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MarketplaceServiceCarouselSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      className="flex gap-6 overflow-hidden pb-4"
      aria-busy="true"
      aria-label="Loading services"
    >
      {Array.from({ length: count }).map((_, index) => (
        <MarketplaceServiceCardSkeleton
          key={index}
          className="w-full shrink-0 sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(20%-19.2px)]"
        />
      ))}
    </div>
  );
}

export function MarketplaceServiceGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}
      aria-busy="true"
      aria-label="Loading services"
    >
      {Array.from({ length: count }).map((_, index) => (
        <MarketplaceServiceCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function MarketplaceJobCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-[260px] animate-pulse flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 sm:min-h-[300px] sm:p-8',
        className,
      )}
      aria-hidden
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center">
            <div className="h-[54px] w-[54px] shrink-0 rounded-full bg-neutral-200" />
            <div className="ml-3.5 h-4 w-24 rounded bg-neutral-100" />
          </div>
          <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-100" />
        </div>
        <div className="mt-5 space-y-2 sm:mt-6">
          <div className="h-5 w-full rounded bg-neutral-200" />
          <div className="h-5 w-[80%] rounded bg-neutral-100" />
        </div>
        <div className="mb-4 mt-4 flex flex-wrap gap-2 sm:mb-6">
          <div className="h-3.5 w-28 rounded bg-neutral-100" />
          <div className="h-3.5 w-20 rounded bg-neutral-100" />
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <div className="h-3.5 w-20 rounded bg-neutral-100" />
        <div className="h-3.5 w-16 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

export function MarketplaceJobGridSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        className,
      )}
      aria-busy="true"
      aria-label="Loading jobs"
    >
      {Array.from({ length: count }).map((_, index) => (
        <MarketplaceJobCardSkeleton key={index} />
      ))}
    </div>
  );
}

function MarketplaceFreelancerCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col items-stretch justify-between rounded-none border border-neutral-200/55 bg-white p-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 mt-1 h-[105px] w-[105px] rounded-full bg-neutral-100" />
        <div className="h-4 w-28 rounded bg-neutral-100" />
        <div className="mt-2 h-3 w-20 rounded bg-neutral-100" />
        <div className="mt-4 flex gap-1.5">
          <div className="h-7 w-14 rounded-full bg-neutral-100" />
          <div className="h-7 w-14 rounded-full bg-neutral-100" />
        </div>
      </div>
      <div className="mt-5 h-10 w-full rounded bg-neutral-100" />
    </div>
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
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        className,
      )}
      aria-busy="true"
      aria-label="Loading freelancers"
    >
      {Array.from({ length: count }).map((_, index) => (
        <MarketplaceFreelancerCardSkeleton key={index} />
      ))}
    </div>
  );
}
