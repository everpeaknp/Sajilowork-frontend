'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
}

function RoleModeToggle({
  currentRole,
  switching,
  onPickRole,
  containerClassName,
  optionClassName,
  activeClassName,
  inactiveClassName,
}: {
  currentRole: DashboardSidebarRole;
  switching: boolean;
  onPickRole: (role: DashboardSidebarRole) => void;
  containerClassName?: string;
  optionClassName: string;
  activeClassName: string;
  inactiveClassName: string;
}) {
  return (
    <div
      className={cn('grid grid-cols-2 gap-1 rounded-lg border p-1', containerClassName)}
      role="group"
      aria-label="Role mode"
    >
      {DASHBOARD_ROLE_OPTIONS.map((option) => {
        const isActive = option.value === currentRole;
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
        <div className="w-full">
          {switching ? (
            <span className="flex h-9 w-full items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-700" />
            </span>
          ) : (
            <RoleModeToggle
              currentRole={currentRole}
              switching={switching}
              onPickRole={requestRole}
              containerClassName="border-neutral-200 bg-white"
              optionClassName="rounded-md px-2 py-3 text-[13px] font-medium tracking-wide transition-colors disabled:opacity-50"
              activeClassName="bg-[#52C47F] text-white"
              inactiveClassName="text-neutral-700 hover:bg-neutral-50"
            />
          )}
        </div>
        {roleConfirmModal}
      </>
    );
  }

  return (
    <>
      <div className="mt-3 border-t border-gray-100 pt-3">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Dashboard
        </p>
        {switching ? (
          <div className="flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          </div>
        ) : (
          <RoleModeToggle
            currentRole={currentRole}
            switching={switching}
            onPickRole={requestRole}
            optionClassName="rounded-md px-2 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
            activeClassName="bg-[#52C47F] text-white"
            inactiveClassName="text-gray-600 hover:bg-gray-100"
          />
        )}
        <p className="mt-1.5 text-[11px] text-gray-500">
          {navigateToDashboard
            ? `Tap a mode to open your ${getDashboardRoleLabel(currentRole)} dashboard`
            : `Currently in ${getDashboardRoleLabel(currentRole)} mode`}
        </p>
      </div>
      {roleConfirmModal}
    </>
  );
}
