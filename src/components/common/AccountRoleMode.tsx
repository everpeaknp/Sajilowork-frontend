'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Briefcase, Loader2, UserRound } from 'lucide-react';
import DeleteConfirmModal from '@/app/dashboard/DeleteConfirmModal';
import {
  DASHBOARD_ROLE_OPTIONS,
  getDashboardHref,
  getDashboardRoleLabel,
  isTabAllowedForRole,
  resolveDashboardSidebarRole,
  tabFromPathname,
  type DashboardSidebarRole,
} from '@/app/dashboard/dashboardTabs';
import { useAuthStore } from '@/store/auth.store';
import { userService } from '@/services';
import { normalizeUserFromApi, notifyUserProfileUpdated } from '@/lib/userProfileSync';
import { cn } from '@/lib/utils';

interface AccountRoleModeProps {
  /** Navbar dropdown vs dashboard sidebar styling */
  variant?: 'navbar' | 'sidebar';
  /** Called after a successful role switch (e.g. close navbar profile menu). */
  onSwitched?: () => void;
  /** Navbar: open /dashboard when a role is selected (including the active role). */
  navigateToDashboard?: boolean;
  className?: string;
}

const ROLE_ICONS: Record<DashboardSidebarRole, typeof Briefcase> = {
  customer: Briefcase,
  tasker: UserRound,
};

function RoleModeToggle({
  currentRole,
  switching,
  onPickRole,
  containerClassName,
  optionClassName,
  activeClassName,
  inactiveClassName,
  showIcons = false,
}: {
  currentRole: DashboardSidebarRole;
  switching: boolean;
  onPickRole: (role: DashboardSidebarRole) => void;
  containerClassName?: string;
  optionClassName: string;
  activeClassName: string;
  inactiveClassName: string;
  showIcons?: boolean;
}) {
  return (
    <div
      className={cn('grid grid-cols-2 gap-1 rounded-lg border p-1', containerClassName)}
      role="group"
      aria-label="Role mode"
    >
      {DASHBOARD_ROLE_OPTIONS.map((option) => {
        const isActive = option.value === currentRole;
        const Icon = ROLE_ICONS[option.value];
        return (
          <button
            key={option.value}
            type="button"
            disabled={switching}
            onClick={() => onPickRole(option.value)}
            aria-pressed={isActive}
            className={cn(
              optionClassName,
              isActive ? activeClassName : inactiveClassName,
            )}
          >
            {showIcons ? <Icon className="h-3.5 w-3.5" strokeWidth={2.25} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function AccountRoleMode({
  variant = 'navbar',
  onSwitched,
  navigateToDashboard = false,
  className,
}: AccountRoleModeProps) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const pathname = usePathname();
  const [switching, setSwitching] = useState(false);
  const [pendingRole, setPendingRole] = useState<DashboardSidebarRole | null>(null);

  const currentRole = resolveDashboardSidebarRole(user?.role);
  const pendingRoleLabel = pendingRole ? getDashboardRoleLabel(pendingRole) : '';

  const goToDashboard = useCallback(() => {
    router.push(getDashboardHref('dashboard'));
    onSwitched?.();
  }, [onSwitched, router]);

  const handleSwitch = useCallback(
    async (nextRole: DashboardSidebarRole) => {
      if (switching || !user) return;

      const isSameRole = currentRole === nextRole;

      if (isSameRole) {
        if (navigateToDashboard) goToDashboard();
        return;
      }

      setSwitching(true);
      try {
        const response = await userService.updateProfile({ role: nextRole });
        if (response.success && response.data) {
          setUser(normalizeUserFromApi(response.data as unknown as Record<string, unknown>));
          notifyUserProfileUpdated();

          if (navigateToDashboard) {
            goToDashboard();
          } else if (pathname.startsWith('/dashboard')) {
            const activeTab = tabFromPathname(pathname);
            if (!isTabAllowedForRole(activeTab, nextRole)) {
              router.push(getDashboardHref('dashboard'));
            }
          }

          if (!navigateToDashboard) onSwitched?.();
        }
      } catch (error) {
        console.error('Failed to switch account role', error);
      } finally {
        setSwitching(false);
        setPendingRole(null);
      }
    },
    [currentRole, goToDashboard, navigateToDashboard, onSwitched, pathname, router, setUser, switching, user],
  );

  const closeRoleConfirm = useCallback(() => {
    if (switching) return;
    setPendingRole(null);
  }, [switching]);

  const confirmRoleSwitch = useCallback(() => {
    if (!pendingRole) return;
    void handleSwitch(pendingRole);
  }, [handleSwitch, pendingRole]);

  const requestRole = useCallback(
    (nextRole: DashboardSidebarRole) => {
      if (switching) return;
      if (nextRole === currentRole) {
        if (navigateToDashboard) goToDashboard();
        return;
      }
      setPendingRole(nextRole);
    },
    [currentRole, goToDashboard, navigateToDashboard, switching],
  );

  useEffect(() => {
    if (!pendingRole) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [pendingRole]);

  if (!user) return null;

  const roleConfirmModal = (
    <DeleteConfirmModal
      open={pendingRole !== null}
      onClose={closeRoleConfirm}
      onConfirm={confirmRoleSwitch}
      title={`Switch to ${pendingRoleLabel}?`}
      description={
        navigateToDashboard
          ? `Switch to ${pendingRoleLabel} mode and open your dashboard?`
          : `Do you want to switch your dashboard to ${pendingRoleLabel} mode? Your sidebar menu will update for this account type.`
      }
      confirmLabel="Yes"
      cancelLabel="No"
      confirmTone="brand"
    />
  );

  if (variant === 'sidebar') {
    return (
      <>
        <div className={cn('w-full', className)}>
          {switching ? (
            <span className="flex h-9 w-full items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-700 dark:text-neutral-300" />
            </span>
          ) : (
            <RoleModeToggle
              currentRole={currentRole}
              switching={switching}
              onPickRole={requestRole}
              containerClassName="border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
              optionClassName="rounded-md px-2 py-3 text-[13px] font-medium tracking-wide transition-colors disabled:opacity-50"
              activeClassName="bg-[#52C47F] text-white"
              inactiveClassName="text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
            />
          )}
        </div>
        {roleConfirmModal}
      </>
    );
  }

  return (
    <>
      <div className={cn('px-3 py-2', className)}>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          Dashboard
        </p>
        {switching ? (
          <div className="flex h-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800/80">
            <Loader2 className="h-4 w-4 animate-spin text-neutral-500 dark:text-neutral-400" />
          </div>
        ) : (
          <RoleModeToggle
            currentRole={currentRole}
            switching={switching}
            onPickRole={requestRole}
            showIcons
            containerClassName="rounded-xl border-0 bg-neutral-100 p-1 dark:bg-neutral-800/80"
            optionClassName="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition disabled:opacity-50"
            activeClassName="bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
            inactiveClassName="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          />
        )}
      </div>
      {roleConfirmModal}
    </>
  );
}
