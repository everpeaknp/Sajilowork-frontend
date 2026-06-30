import { cn } from '@/lib/utils';
import { MapViewSkeleton } from '@/components/skeletons';

export function TaskCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex w-full animate-pulse flex-col overflow-hidden rounded-[20px] border border-neutral-200/40 bg-[#fbf2ed] p-4 shadow-sm sm:rounded-[24px] sm:p-5',
        className,
      )}
      aria-hidden
    >
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-[#fcd074]/40 sm:-bottom-10 sm:-right-10" />
      <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-full rounded bg-neutral-200/80" />
          <div className="h-4 w-3/5 rounded bg-neutral-200/60" />
        </div>
        <div className="h-5 w-16 shrink-0 rounded bg-[#52C47F]/20" />
      </div>
      <div className="relative z-10 mb-4 space-y-2.5">
        <div className="h-3.5 w-4/5 rounded bg-neutral-200/70" />
        <div className="h-3.5 w-2/3 rounded bg-neutral-200/60" />
        <div className="h-3.5 w-1/2 rounded bg-neutral-200/50" />
      </div>
      <div className="relative z-10 flex items-center justify-between pt-2">
        <div className="space-y-1.5">
          <div className="h-3.5 w-20 rounded bg-neutral-200/80" />
          <div className="h-3 w-14 rounded bg-neutral-200/50" />
        </div>
        <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-200/80 ring-2 ring-white/80" />
      </div>
    </div>
  );
}

export function TaskCardListSkeleton({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-3 pb-2', className)} aria-busy aria-label="Loading tasks">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TaskAvatarListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col items-center gap-4" aria-busy aria-label="Loading tasks">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-12 w-12 animate-pulse rounded-full bg-slate-200 ring-2 ring-slate-100"
        />
      ))}
    </div>
  );
}

export function TaskMapSkeleton() {
  return <MapViewSkeleton />;
}
