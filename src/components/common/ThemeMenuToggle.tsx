'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';

export type ThemeMenuToggleProps = {
  className?: string;
  /** Compact row for profile/guest menus */
  variant?: 'menu' | 'inline';
  'data-tour'?: string;
};

export default function ThemeMenuToggle({
  className,
  variant = 'menu',
  'data-tour': dataTour,
}: ThemeMenuToggleProps) {
  const { theme, setTheme, ready } = useTheme();

  if (variant === 'inline') {
    return (
      <button
        type="button"
        data-tour={dataTour}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100 hover:text-brand-emerald dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-brand-emerald',
          className,
        )}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? (
          <Sun className="h-4.5 w-4.5" strokeWidth={2} />
        ) : (
          <Moon className="h-4.5 w-4.5" strokeWidth={2} />
        )}
      </button>
    );
  }

  return (
    <div className={cn('px-3 py-2', className)}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
        Appearance
      </p>
      <div
        className="grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800/80"
        role="group"
        aria-label="Color theme"
      >
        <button
          type="button"
          disabled={!ready}
          onClick={() => setTheme('light')}
          aria-pressed={theme === 'light'}
          className={cn(
            'flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition',
            theme === 'light'
              ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200',
          )}
        >
          <Sun className="h-3.5 w-3.5" strokeWidth={2.25} />
          Light
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => setTheme('dark')}
          aria-pressed={theme === 'dark'}
          className={cn(
            'flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition',
            theme === 'dark'
              ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200',
          )}
        >
          <Moon className="h-3.5 w-3.5" strokeWidth={2.25} />
          Dark
        </button>
      </div>
    </div>
  );
}
