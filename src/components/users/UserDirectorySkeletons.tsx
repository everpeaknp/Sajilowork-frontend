import { cn } from '@/lib/utils';

export function UserDirectoryCardSkeleton({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        'flex min-h-[400px] animate-pulse flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-brand-dark via-[#1e5c48] to-brand-emerald p-5 sm:p-6',
        className,
      )}
      aria-hidden
    >
      <div className="flex flex-col items-center text-center">
        <div className="h-20 w-20 rounded-full bg-white/20 ring-4 ring-white/10" />
        <div className="mt-4 h-3 w-24 rounded bg-white/15" />
        <div className="mt-2 h-5 w-32 rounded bg-white/25" />
        <div className="mt-3 h-3 w-full max-w-[200px] rounded bg-white/10" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-4/5 mx-auto rounded bg-white/10" />
      </div>
      <div className="mt-auto grid grid-cols-3 gap-2 pt-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white/10 px-3 py-2.5">
            <div className="mx-auto h-2 w-10 rounded bg-white/15" />
            <div className="mx-auto mt-2 h-5 w-8 rounded bg-white/20" />
          </div>
        ))}
      </div>
      <div className="mt-4 h-10 w-full rounded-full bg-white/25" />
    </article>
  );
}

export function UserDirectoryGridSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
        className,
      )}
      aria-busy
      aria-label="Loading members"
    >
      {Array.from({ length: count }).map((_, i) => (
        <UserDirectoryCardSkeleton key={i} />
      ))}
    </div>
  );
}
