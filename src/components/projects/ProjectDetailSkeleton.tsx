import { cn } from '@/lib/utils';

function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-neutral-200', className)} aria-hidden />;
}

export default function ProjectDetailSkeleton({
  ariaLabel = 'Loading project',
}: {
  ariaLabel?: string;
}) {
  return (
    <div
      className="select-none bg-white pb-8 pt-6 sm:pb-12 sm:pt-8"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Bone key={index} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <div className="flex gap-2">
            <Bone className="h-10 w-10 rounded-full" />
            <Bone className="h-10 w-10 rounded-full" />
          </div>
        </div>

        <Bone className="min-h-[180px] w-full rounded-[24px] sm:min-h-[200px] lg:min-h-[220px]" />

        <div className="mt-8 grid grid-cols-1 items-start gap-8 sm:mt-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-12 lg:col-span-8">
            <div className="space-y-4">
              <Bone className="h-6 w-28" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Bone className="h-16 rounded-xl" />
                <Bone className="h-16 rounded-xl" />
                <Bone className="h-16 rounded-xl" />
                <Bone className="h-16 rounded-xl" />
              </div>
              <div className="space-y-2 pt-2">
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-4/5" />
              </div>
            </div>

            <div className="space-y-4">
              <Bone className="h-6 w-36" />
              <div className="flex flex-wrap gap-2">
                <Bone className="h-8 w-24 rounded-full" />
                <Bone className="h-8 w-28 rounded-full" />
                <Bone className="h-8 w-20 rounded-full" />
                <Bone className="h-8 w-32 rounded-full" />
              </div>
            </div>

            <div className="space-y-3">
              <Bone className="h-6 w-32" />
              <Bone className="h-20 w-full rounded-xl" />
              <Bone className="h-20 w-full rounded-xl" />
            </div>

            <div className="space-y-3">
              <Bone className="aspect-[16/9] w-full rounded-2xl" />
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 border-b border-neutral-200 pb-3">
                <Bone className="h-5 w-24" />
                <Bone className="h-5 w-28" />
              </div>
              <Bone className="h-32 w-full rounded-2xl" />
            </div>

            <div className="space-y-4 border-t border-neutral-200 pt-10">
              <Bone className="h-6 w-40" />
              <Bone className="h-4 w-full max-w-xl" />
              <Bone className="h-4 w-28" />
            </div>

            <div className="space-y-6 border-t border-neutral-200 pt-10">
              <div className="space-y-2">
                <Bone className="h-6 w-44" />
                <Bone className="h-3.5 w-72 max-w-full" />
              </div>
              <div className="grid grid-cols-1 gap-6 rounded-2xl bg-neutral-50/60 p-6 md:grid-cols-12">
                <div className="space-y-3 text-center md:col-span-4">
                  <Bone className="mx-auto h-12 w-20" />
                  <Bone className="mx-auto h-4 w-24" />
                  <Bone className="mx-auto h-3 w-28" />
                </div>
                <div className="space-y-2 md:col-span-8">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Bone key={index} className="h-3 w-full" />
                  ))}
                </div>
              </div>
              <Bone className="h-28 w-full rounded-2xl" />
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="animate-pulse rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 border-b border-neutral-100 pb-5">
                <Bone className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Bone className="h-4 w-32" />
                  <Bone className="h-3.5 w-24" />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <Bone className="h-4 w-full" />
                <Bone className="h-4 w-5/6" />
                <Bone className="h-4 w-4/6" />
              </div>
              <Bone className="mt-6 h-12 w-full rounded-lg" />
              <Bone className="mt-3 h-11 w-full rounded-lg" />
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <Bone className="h-4 w-72 max-w-full" />
          <Bone className="h-4 w-36" />
        </div>
      </div>
    </div>
  );
}
