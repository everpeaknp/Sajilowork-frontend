import { cn } from '@/lib/utils';

type LumaSpinProps = {
  className?: string;
};

export function LumaSpin({ className }: LumaSpinProps) {
  return (
    <div className={cn('relative aspect-square w-[65px]', className)} aria-hidden>
      <span className="animate-loader-anim absolute rounded-[50px] shadow-[inset_0_0_0_3px] shadow-gray-800 dark:shadow-gray-100" />
      <span className="animate-loader-anim animation-delay-loader absolute rounded-[50px] shadow-[inset_0_0_0_3px] shadow-gray-800 dark:shadow-gray-100" />
    </div>
  );
}

/** @deprecated Use `LumaSpin` */
export const Component = LumaSpin;
