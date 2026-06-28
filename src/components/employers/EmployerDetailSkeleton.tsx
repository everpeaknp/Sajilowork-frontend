import { cn } from '@/lib/utils';

function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-neutral-200', className)} aria-hidden />;
}

function ListingRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex min-w-0 items-center gap-4">
        <Bone className="h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Bone className="h-4 w-48 max-w-full" />
          <Bone className="h-3 w-36 max-w-full" />
        </div>
      </div>
      <Bone className="h-5 w-5 shrink-0 rounded-full" />
    </div>
  );
}

export default function EmployerDetailSkeleton({
  ariaLabel = 'Loading employer profile',
}: {
  ariaLabel?: string;
}) {
  return (
    <section
      className="w-full min-w-0 select-none pb-16"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <div className="w-full px-4 pt-4 sm:px-6 sm:pt-6 md:px-10 lg:px-12 xl:px-16">
        <div className="relative mx-auto flex w-full max-w-[1600px] flex-col lg:block lg:min-h-[28rem]">
          {/* Hero */}
          <div className="relative z-0 order-1 w-full overflow-hidden rounded-3xl border border-[#F2ECE6] bg-[#FDF8F3] sm:rounded-[2rem]">
            <div className="relative z-10 w-full px-4 py-6 sm:px-6 sm:py-7 lg:px-10 lg:py-8 xl:px-12">
              <div className="text-left sm:ml-10 lg:ml-16 lg:pr-[min(380px,36%)] xl:ml-24">
                <div className="flex items-center gap-5 sm:gap-6 md:gap-8">
                  <Bone className="h-24 w-24 shrink-0 rounded-full sm:h-28 sm:w-28" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <Bone className="h-3 w-24" />
                    <Bone className="h-8 w-56 max-w-full" />
                    <Bone className="h-4 w-full max-w-md" />
                    <div className="flex flex-wrap gap-4 pt-1">
                      <Bone className="h-4 w-28" />
                      <Bone className="h-4 w-32" />
                      <Bone className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar card */}
          <div className="relative z-20 order-3 mt-6 w-full lg:absolute lg:right-6 lg:top-20 lg:order-none lg:mt-0 lg:max-w-[380px] xl:right-12 2xl:right-20">
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl">
              <Bone className="mb-2 h-6 w-32" />
              <Bone className="mb-6 h-4 w-full max-w-xs" />
              <div className="space-y-0">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-[#F4F4F4] py-3.5 last:border-0"
                  >
                    <Bone className="h-3.5 w-24" />
                    <Bone className="h-3.5 w-20" />
                  </div>
                ))}
              </div>
              <Bone className="mt-6 h-12 w-full rounded-lg" />
            </div>
          </div>

          {/* Main content */}
          <div className="relative z-10 order-2 w-full min-w-0 pb-10 pt-6 lg:order-none lg:pt-8 lg:pr-[calc(380px+3rem)] xl:pr-[calc(380px+4.5rem)] 2xl:pr-[calc(380px+6.5rem)]">
            <div className="space-y-10">
              <div className="space-y-4">
                <Bone className="h-6 w-36" />
                <div className="space-y-2">
                  <Bone className="h-4 w-full" />
                  <Bone className="h-4 w-full" />
                  <Bone className="h-4 w-4/5" />
                </div>
              </div>

              <div className="space-y-4">
                <Bone className="h-6 w-24" />
                <div className="space-y-3">
                  <ListingRowSkeleton />
                  <ListingRowSkeleton />
                </div>
              </div>

              <div className="space-y-4">
                <Bone className="h-6 w-28" />
                <div className="grid grid-cols-1 gap-6 rounded-2xl bg-neutral-50/60 p-6 md:grid-cols-12">
                  <div className="space-y-3 text-center md:col-span-4">
                    <Bone className="mx-auto h-12 w-20" />
                    <Bone className="mx-auto h-4 w-24" />
                  </div>
                  <div className="space-y-2 md:col-span-8">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Bone key={index} className="h-3 w-full" />
                    ))}
                  </div>
                </div>
                <Bone className="h-28 w-full rounded-2xl" />
              </div>

              <div className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <Bone className="h-6 w-40" />
                  <Bone className="h-4 w-28" />
                </div>
                <div className="space-y-3">
                  <ListingRowSkeleton />
                  <ListingRowSkeleton />
                  <ListingRowSkeleton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
