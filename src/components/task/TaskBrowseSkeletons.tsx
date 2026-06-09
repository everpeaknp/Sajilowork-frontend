import { cn } from '@/lib/utils';

export function TaskCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex w-full animate-pulse flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-brand-dark via-[#1e5c48] to-brand-emerald p-4 sm:p-5',
        className,
      )}
      aria-hidden
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-full rounded bg-white/20" />
          <div className="h-4 w-3/5 rounded bg-white/15" />
        </div>
        <div className="h-5 w-16 shrink-0 rounded bg-white/25" />
      </div>
      <div className="mb-4 space-y-2.5">
        <div className="h-3.5 w-4/5 rounded bg-white/15" />
        <div className="h-3.5 w-2/3 rounded bg-white/15" />
        <div className="h-3.5 w-1/2 rounded bg-white/15" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-1.5">
          <div className="h-3.5 w-20 rounded bg-white/20" />
          <div className="h-3 w-14 rounded bg-white/10" />
        </div>
        <div className="h-10 w-10 shrink-0 rounded-full bg-white/20 ring-2 ring-white/10" />
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
  return (
    <div
      className="h-full w-full animate-pulse bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200"
      aria-hidden
    />
  );
}
