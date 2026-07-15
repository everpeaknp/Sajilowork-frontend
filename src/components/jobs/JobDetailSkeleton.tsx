import { cn } from '@/lib/utils';

function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-neutral-200 dark:bg-neutral-800', className)} aria-hidden />;
}

export default function JobDetailSkeleton() {
  return (
    <div
      className="select-none bg-white pb-8 pt-6 sm:pb-12 sm:pt-8 dark:bg-neutral-950"
      aria-busy="true"
      aria-label="Loading job"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-end gap-2 sm:mb-5">
          <Bone className="h-10 w-10 rounded-full" />
          <Bone className="h-10 w-10 rounded-full" />
        </div>

        <Bone className="min-h-[180px] w-full rounded-[20px] sm:min-h-[200px] lg:min-h-[220px]" />

        <div className="mx-auto w-full max-w-3xl">
          <div className="mt-10 space-y-4 sm:mt-12">
            <Bone className="h-6 w-24" />
            <div className="space-y-2">
              <Bone className="h-3.5 w-full" />
              <Bone className="h-3.5 w-full" />
              <Bone className="h-3.5 w-4/5" />
            </div>
          </div>

          <div className="mt-10 space-y-4 sm:mt-12">
            <Bone className="h-6 w-36" />
            <div className="flex flex-wrap gap-2">
              <Bone className="h-8 w-24 rounded-full" />
              <Bone className="h-8 w-28 rounded-full" />
              <Bone className="h-8 w-20 rounded-full" />
              <Bone className="h-8 w-32 rounded-full" />
            </div>
          </div>

          <div className="mt-10 space-y-4 sm:mt-12">
            <Bone className="h-6 w-44" />
            <div className="space-y-3">
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-5/6" />
              <Bone className="h-4 w-4/6" />
            </div>
          </div>

          <div className="mt-10 space-y-4 sm:mt-12">
            <Bone className="h-6 w-40" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Bone className="h-20 rounded-xl" />
              <Bone className="h-20 rounded-xl" />
            </div>
            <Bone className="h-12 w-full rounded-lg sm:w-48" />
          </div>

          <div className="mt-12 space-y-6 sm:mt-16">
            <div className="space-y-2">
              <Bone className="h-6 w-32" />
              <Bone className="h-3.5 w-56 max-w-full" />
            </div>
            <div className="space-y-4">
              <Bone className="h-28 w-full rounded-2xl" />
              <Bone className="h-28 w-full rounded-2xl" />
              <Bone className="h-28 w-full rounded-2xl" />
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 text-center sm:mt-14 sm:flex-row sm:justify-between sm:text-left">
            <Bone className="h-4 w-72 max-w-full" />
            <Bone className="h-4 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}
