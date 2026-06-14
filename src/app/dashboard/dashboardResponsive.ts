export const DASHBOARD_PAGE_ROOT =
  'animate-in fade-in min-w-0 overflow-x-clip font-sans text-black duration-300 select-none';

export const DASHBOARD_HEADING =
  'text-2xl font-normal leading-none tracking-tight text-neutral-900 sm:text-[34px]';

export const DASHBOARD_HEADING_MD =
  'text-2xl font-normal leading-tight tracking-tight text-neutral-900 sm:text-3xl';

export const DASHBOARD_HEADING_PROPOSALS =
  'font-sans text-2xl font-normal tracking-tight text-black sm:text-3xl';

export const DASHBOARD_CARD =
  'mx-auto max-w-7xl overflow-hidden rounded-2xl border border-neutral-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)] sm:p-6 md:p-8';

export const DASHBOARD_CARD_PLAIN =
  'mx-auto max-w-7xl overflow-hidden rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)] sm:p-6 md:p-8';

export const DASHBOARD_SUBTABS_WRAP = 'mb-6 overflow-x-auto border-b border-neutral-100 sm:mb-8';

export const DASHBOARD_SUBTABS_ROW = 'flex w-max min-w-full gap-4 pb-px sm:w-auto sm:min-w-0 sm:gap-6 md:gap-8';

export const DASHBOARD_PAGINATION_OUTER =
  'mt-8 flex select-none flex-col items-center justify-center gap-4 border-t border-neutral-100 pt-8 sm:mt-10 sm:pt-10 font-sans';

export const DASHBOARD_PAGINATION_INNER =
  'flex w-full max-w-full items-center justify-center gap-2 overflow-x-auto px-1 pb-1 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0';

export const DASHBOARD_PAGINATION_ARROW =
  'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white sm:h-12 sm:w-12';

export const DASHBOARD_PAGINATION_ARROW_PLAIN =
  'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] outline-none transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white sm:h-12 sm:w-12';

export function dashboardPageButtonClass(active: boolean): string {
  return `flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 text-sm font-normal outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 sm:h-[44px] sm:w-[44px] ${
    active
      ? 'bg-[#52C47F] font-semibold text-white shadow-sm'
      : 'bg-transparent text-black hover:text-[#52C47F]'
  }`;
}

export const DASHBOARD_STAT_VALUE = 'text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl';

export const DASHBOARD_MESSAGES_HEIGHT =
  'h-[min(560px,calc(100dvh-12rem))] lg:h-[650px]';
