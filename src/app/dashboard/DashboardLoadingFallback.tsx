import { LumaSpin } from '@/components/ui/luma-spin';

type DashboardLoadingFallbackProps = {
  message?: string;
  fullScreen?: boolean;
};

export default function DashboardLoadingFallback({
  message = 'Loading dashboard…',
  fullScreen = true,
}: DashboardLoadingFallbackProps) {
  return (
    <div
      className={
        fullScreen
          ? 'flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#f0efec]'
          : 'flex flex-col items-center justify-center gap-4 py-16'
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LumaSpin />
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}
