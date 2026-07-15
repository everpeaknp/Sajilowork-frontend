import { cn } from '@/lib/utils';

function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-neutral-200 dark:bg-neutral-800', className)} aria-hidden />;
}

function InfoBarItemSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Bone className="h-11 w-11 shrink-0 rounded-full" />
      <div className="space-y-2">
        <Bone className="h-3.5 w-20" />
        <Bone className="h-3.5 w-28" />
      </div>
    </div>
  );
}

export default function ServiceDetailSkeleton() {
  return (
    <div
      className="select-none bg-white pb-8 pt-6 sm:pb-12 sm:pt-8 dark:bg-neutral-950"
      aria-busy="true"
      aria-label="Loading service"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-end gap-2 sm:mb-5">
          <Bone className="h-10 w-10 rounded-full" />
          <Bone className="h-10 w-10 rounded-full" />
        </div>

        <Bone className="min-h-[150px] w-full rounded-[20px] sm:min-h-[165px] md:min-h-[175px] lg:min-h-[190px]" />

        <div className="mt-8 grid grid-cols-1 items-start gap-8 sm:mt-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-8 lg:col-span-8">
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              <InfoBarItemSkeleton />
              <InfoBarItemSkeleton />
              <InfoBarItemSkeleton />
            </div>

            <div className="space-y-3">
              <Bone className="aspect-[16/9] w-full rounded-2xl" />
              <div className="flex justify-center gap-2">
                <Bone className="h-2 w-2 rounded-full" />
                <Bone className="h-2 w-2 rounded-full" />
                <Bone className="h-2 w-2 rounded-full" />
              </div>
            </div>

            <div className="space-y-4 border-b border-neutral-200 pb-10">
              <Bone className="h-6 w-24" />
              <div className="flex flex-wrap gap-2">
                <Bone className="h-8 w-24 rounded-full" />
                <Bone className="h-8 w-28 rounded-full" />
                <Bone className="h-8 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-4/5" />
              </div>
            </div>

            <div className="space-y-4 border-b border-neutral-200 pb-10">
              <Bone className="h-6 w-40" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Bone className="h-36 rounded-xl" />
                <Bone className="h-36 rounded-xl" />
                <Bone className="h-36 rounded-xl" />
              </div>
            </div>

            <div className="space-y-4 border-b border-neutral-200 pb-10">
              <Bone className="h-6 w-16" />
              <Bone className="h-14 w-full rounded-xl" />
              <Bone className="h-14 w-full rounded-xl" />
              <Bone className="h-14 w-full rounded-xl" />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Bone className="h-6 w-44" />
                <Bone className="h-3.5 w-72 max-w-full" />
              </div>
              <div className="grid grid-cols-1 gap-6 rounded-2xl bg-neutral-50/60 p-6 md:grid-cols-12 dark:bg-neutral-900/60">
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
              <Bone className="h-28 w-full rounded-2xl" />
            </div>
          </div>

          <aside className="mx-auto w-full max-w-none space-y-5 sm:max-w-[20rem] lg:sticky lg:top-20 lg:col-span-4 lg:mx-0 lg:ml-auto lg:max-w-[19.5rem] lg:self-start">
            <div className="animate-pulse rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
              <div className="mb-4 flex gap-2">
                <Bone className="h-9 flex-1 rounded-lg" />
                <Bone className="h-9 flex-1 rounded-lg" />
                <Bone className="h-9 flex-1 rounded-lg" />
              </div>
              <Bone className="h-8 w-28" />
              <Bone className="mt-3 h-5 w-32" />
              <Bone className="mt-2 h-12 w-full" />
              <div className="mt-5 space-y-3 border-b border-neutral-200 pb-5">
                <Bone className="h-4 w-40" />
                <Bone className="h-4 w-36" />
                <Bone className="h-4 w-44" />
              </div>
              <Bone className="mt-5 h-11 w-full rounded-lg" />
            </div>

            <div className="animate-pulse rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <Bone className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Bone className="h-4 w-32" />
                  <Bone className="h-3.5 w-24" />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-5/6" />
              </div>
              <Bone className="mt-5 h-11 w-full rounded-lg" />
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <Bone className="h-4 w-64 max-w-full" />
          <Bone className="h-4 w-36" />
        </div>
      </div>
    </div>
  );
}
