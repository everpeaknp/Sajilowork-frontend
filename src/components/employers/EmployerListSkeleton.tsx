import { cn } from '@/lib/utils';

function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-neutral-200 dark:bg-neutral-800', className)} aria-hidden />;
}

export function EmployerCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-[200px] animate-pulse flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900',
        className,
      )}
      aria-hidden
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Bone className="h-12 w-12 shrink-0 rounded-full" />
          <Bone className="h-4 w-28 max-w-full" />
        </div>
        <Bone className="h-5 w-5 shrink-0 rounded-full" />
      </div>
      <div className="mt-6 flex items-center gap-2">
        <Bone className="h-4 w-4 rounded-full" />
        <Bone className="h-4 w-24" />
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Bone className="h-3.5 w-20" />
        <Bone className="h-3.5 w-px" />
        <Bone className="h-3.5 w-24" />
      </div>
    </div>
  );
}

export function EmployerListSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4', className)}
      aria-busy="true"
      aria-label="Loading employers"
    >
      {Array.from({ length: count }).map((_, index) => (
        <EmployerCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function EmployerFilterRowSkeleton() {
  return (
    <div className="mb-8 flex animate-pulse flex-col justify-between gap-5 pb-4 md:flex-row md:items-center" aria-hidden>
      <div className="flex flex-wrap items-center gap-2">
        <Bone className="h-10 w-28 rounded-lg" />
        <Bone className="h-10 w-28 rounded-lg" />
      </div>
      <Bone className="h-4 w-32" />
    </div>
  );
}
