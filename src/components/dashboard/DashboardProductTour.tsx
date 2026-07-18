'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useDashboardSidebarRole } from '@/app/dashboard/DashboardRoleSwitchContext';
import { useDashboardTab } from '@/app/dashboard/DashboardTabContext';
import {
  getDashboardTourSteps,
  hasSeenDashboardTour,
  markDashboardTourSeen,
  type DashboardTourStep,
} from '@/lib/dashboardTour';
import {
  DASHBOARD_ONBOARDING_DONE_EVENT,
  consumeOnboardingTourHandoff,
  hasOnboardingTourHandoff,
  shouldShowDashboardOnboarding,
} from '@/lib/dashboardOnboarding';
import { cn } from '@/lib/utils';

type TooltipPos = { top: number; left: number };

function isDesktopViewport() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(min-width: 1024px)').matches;
}

export default function DashboardProductTour() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useDashboardSidebarRole();
  const { mobileOpen, setMobileOpen } = useDashboardTab();

  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [forced, setForced] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<DashboardTourStep[]>([]);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos>({ top: 24, left: 24 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const finish = useCallback(() => {
    markDashboardTourSeen(user?.id, role);
    setActive(false);
    setForced(false);
    setStepIndex(0);
    setHighlightRect(null);
    document.querySelectorAll('.dashboard-tour-highlight').forEach((el) => {
      el.classList.remove('dashboard-tour-highlight');
    });
  }, [role, user?.id]);

  const startTour = useCallback(
    (options?: { force?: boolean }) => {
      if (!user?.id || !isAuthenticated) return;
      if (!options?.force && hasSeenDashboardTour(user.id, role)) return;

      const nextSteps = getDashboardTourSteps(role).filter((step) => {
        if (typeof document === 'undefined') return true;
        const el = document.querySelector(step.target) as HTMLElement | null;
        if (!el) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = el.getBoundingClientRect();
        // Keep off-canvas sidebar targets (mobile); drop truly collapsed/zero-size chrome.
        if (rect.width < 2 && rect.height < 2 && !step.requiresSidebar) return false;
        return true;
      });

      if (nextSteps.length === 0) return;

      setSteps(nextSteps);
      setStepIndex(0);
      setForced(Boolean(options?.force));
      setActive(true);
    },
    [isAuthenticated, role, user?.id],
  );

  // Auto-start on first visit to /dashboard for this role — wait until onboarding is done.
  useEffect(() => {
    if (!mounted || !isAuthenticated || !user?.id) return;
    if (pathname !== '/dashboard') return;
    if (shouldShowDashboardOnboarding(user, role)) return;
    // Onboarding owns the next tour start — do not auto-start in parallel.
    if (hasOnboardingTourHandoff()) return;
    if (hasSeenDashboardTour(user.id, role)) return;

    const timer = window.setTimeout(() => {
      if (hasOnboardingTourHandoff()) return;
      startTour();
    }, 700);

    return () => window.clearTimeout(timer);
  }, [mounted, isAuthenticated, user, role, pathname, startTour]);

  // After first-registration onboarding finishes, start the product tour once.
  useEffect(() => {
    if (!mounted) return;
    const onOnboardingDone = (event: Event) => {
      const detail = (event as CustomEvent<{ startTour?: boolean }>).detail;
      if (detail?.startTour === false) {
        consumeOnboardingTourHandoff();
        return;
      }
      consumeOnboardingTourHandoff();
      window.setTimeout(() => startTour({ force: true }), 350);
    };
    window.addEventListener(DASHBOARD_ONBOARDING_DONE_EVENT, onOnboardingDone);
    return () => window.removeEventListener(DASHBOARD_ONBOARDING_DONE_EVENT, onOnboardingDone);
  }, [mounted, startTour]);

  // Allow replay: window event or ?tour=1
  useEffect(() => {
    if (!mounted) return;

    const onReplay = () => startTour({ force: true });
    window.addEventListener('sajilowork:dashboard-tour', onReplay);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tour') === '1') {
        startTour({ force: true });
      }
    }

    return () => window.removeEventListener('sajilowork:dashboard-tour', onReplay);
  }, [mounted, startTour]);

  const currentStep = steps[stepIndex] ?? null;

  const measure = useCallback(() => {
    if (!currentStep) return;
    const target = document.querySelector(currentStep.target) as HTMLElement | null;
    if (!target) {
      setHighlightRect(null);
      return;
    }

    document.querySelectorAll('.dashboard-tour-highlight').forEach((el) => {
      el.classList.remove('dashboard-tour-highlight');
    });
    target.classList.add('dashboard-tour-highlight');
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    const rect = target.getBoundingClientRect();
    setHighlightRect(rect);

    const tipWidth = Math.min(340, window.innerWidth - 32);
    const tipHeight = 220;
    const margin = 16;
    let left = Math.min(Math.max(16, rect.left), window.innerWidth - tipWidth - 16);
    let top = rect.bottom + margin;
    if (top + tipHeight > window.innerHeight - 12) {
      top = Math.max(16, rect.top - tipHeight - margin);
    }
    setTooltipPos({ top, left });
  }, [currentStep]);

  useLayoutEffect(() => {
    if (!active || !currentStep) return;

    let cancelled = false;

    const prepare = async () => {
      if (currentStep.requiresSidebar && !isDesktopViewport() && !mobileOpen) {
        setMobileOpen(true);
        await new Promise((r) => window.setTimeout(r, 320));
      }
      if (!cancelled) measure();
    };

    void prepare();

    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [active, currentStep, measure, mobileOpen, setMobileOpen]);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  const goNext = () => {
    if (stepIndex >= steps.length - 1) {
      finish();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const goBack = () => {
    if (stepIndex <= 0) return;
    setStepIndex((i) => i - 1);
  };

  if (!mounted || !active || !currentStep) return null;

  const pad = 8;
  const hole = highlightRect
    ? {
        top: Math.max(0, highlightRect.top - pad),
        left: Math.max(0, highlightRect.left - pad),
        width: highlightRect.width + pad * 2,
        height: highlightRect.height + pad * 2,
      }
    : null;

  return createPortal(
    <div className="fixed inset-0 z-[11000]" role="dialog" aria-modal="true" aria-labelledby="dashboard-tour-title">
      {/* Spotlight overlay with cutout */}
      <div className="pointer-events-none absolute inset-0">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="dashboard-tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {hole ? (
                <rect
                  x={hole.left}
                  y={hole.top}
                  width={hole.width}
                  height={hole.height}
                  rx="12"
                  fill="black"
                />
              ) : null}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(15, 23, 42, 0.72)"
            mask="url(#dashboard-tour-mask)"
          />
        </svg>
      </div>

      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default bg-transparent"
        aria-label="Tour backdrop"
        onClick={() => finish()}
      />

      {hole ? (
        <div
          className="pointer-events-none absolute z-[1] rounded-xl ring-4 ring-white ring-offset-2 ring-offset-[#52C47F]"
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
          }}
        />
      ) : null}

      <div
        className="absolute z-[2] w-[min(340px,calc(100vw-2rem))] rounded-2xl border border-neutral-100 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#2f7a52]">
          Step {stepIndex + 1} of {steps.length}
          {forced ? '' : ' · First visit'}
        </p>
        <h4
          id="dashboard-tour-title"
          className="mt-1.5 text-lg font-semibold tracking-tight text-neutral-900 dark:text-stone-100"
        >
          {currentStep.title}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {currentStep.text}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => finish()}
            className="text-sm font-semibold text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-stone-200"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0}
              className={cn(
                'rounded-lg bg-neutral-100 px-3.5 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-200 disabled:invisible dark:bg-neutral-800 dark:text-stone-100 dark:hover:bg-neutral-700',
              )}
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg bg-[#52C47F] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#45a86d]"
            >
              {stepIndex >= steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
