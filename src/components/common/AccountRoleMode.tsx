'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Loader2 } from 'lucide-react';
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

interface AccountRoleModeProps {
  /** Navbar dropdown vs dashboard sidebar styling */
  variant?: 'navbar' | 'sidebar';
  isProfileActive?: boolean;
}

export default function AccountRoleMode({
  variant = 'navbar',
  isProfileActive = false,
}: AccountRoleModeProps) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const pathname = usePathname();
  const [switching, setSwitching] = useState(false);
  const [pendingRole, setPendingRole] = useState<DashboardSidebarRole | null>(null);

  const currentRole = resolveDashboardSidebarRole(user?.role);
  const pendingRoleLabel = pendingRole ? getDashboardRoleLabel(pendingRole) : '';

  const handleSwitch = useCallback(
    async (nextRole: DashboardSidebarRole) => {
      if (switching || !user || currentRole === nextRole) return;

      setSwitching(true);
      try {
        const response = await userService.updateProfile({ role: nextRole });
        if (response.success && response.data) {
          setUser(normalizeUserFromApi(response.data as unknown as Record<string, unknown>));
          notifyUserProfileUpdated();

          if (pathname.startsWith('/dashboard')) {
            const activeTab = tabFromPathname(pathname);
            if (!isTabAllowedForRole(activeTab, nextRole)) {
              router.push(getDashboardHref('dashboard'));
            }
          }
        }
      } catch (error) {
        console.error('Failed to switch account role', error);
      } finally {
        setSwitching(false);
        setPendingRole(null);
      }
    },
    [currentRole, pathname, router, setUser, switching, user],
  );

  const closeRoleConfirm = useCallback(() => {
    if (switching) return;
    setPendingRole(null);
  }, [switching]);

  const confirmRoleSwitch = useCallback(() => {
    if (!pendingRole) return;
    void handleSwitch(pendingRole);
  }, [handleSwitch, pendingRole]);

  useEffect(() => {
    if (!pendingRole) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [pendingRole]);

  if (!user) return null;

  if (variant === 'sidebar') {
    const shellClass = isProfileActive
      ? 'border-white/20 bg-white/10 text-white'
      : 'border-neutral-200 bg-white text-neutral-900';

    return (
      <>
        <div className="relative mr-2 shrink-0">
          {switching ? (
            <span className="flex h-8 w-[6.5rem] items-center justify-center">
              <Loader2
                className={`h-4 w-4 animate-spin ${isProfileActive ? 'text-white' : 'text-neutral-700'}`}
              />
            </span>
          ) : (
            <>
              <select
                value={currentRole}
                onChange={(event) => {
                  const nextRole = event.target.value as DashboardSidebarRole;
                  if (nextRole === currentRole) return;
                  setPendingRole(nextRole);
                }}
                disabled={switching}
                aria-label="Account type"
                className={`h-8 w-[6.5rem] cursor-pointer appearance-none rounded-md border py-1 pl-2 pr-7 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-[#52C47F]/40 ${shellClass}`}
              >
                {DASHBOARD_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${isProfileActive ? 'text-white/80' : 'text-neutral-500'}`}
                aria-hidden
              />
            </>
          )}
        </div>
        <DeleteConfirmModal
          open={pendingRole !== null}
          onClose={closeRoleConfirm}
          onConfirm={confirmRoleSwitch}
          title={`Switch to ${pendingRoleLabel}?`}
          description={`Do you want to switch your dashboard to ${pendingRoleLabel} mode? Your sidebar menu will update for this account type.`}
          confirmLabel="Yes"
          cancelLabel="No"
          confirmTone="brand"
        />
      </>
    );
  }

  return (
    <>
      <div className="mt-3 border-t border-gray-100 pt-3">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Role mode
        </p>
        <div className="relative">
          {switching ? (
            <div className="flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              <select
                value={currentRole}
                onChange={(event) => {
                  const nextRole = event.target.value as DashboardSidebarRole;
                  if (nextRole === currentRole) return;
                  setPendingRole(nextRole);
                }}
                disabled={switching}
                aria-label="Role mode"
                className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-9 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#52C47F]/40"
              >
                {DASHBOARD_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                aria-hidden
              />
            </>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-gray-500">
          Currently in {getDashboardRoleLabel(currentRole)} mode
        </p>
      </div>
      <DeleteConfirmModal
        open={pendingRole !== null}
        onClose={closeRoleConfirm}
        onConfirm={confirmRoleSwitch}
        title={`Switch to ${pendingRoleLabel}?`}
        description={`Do you want to switch your dashboard to ${pendingRoleLabel} mode? Your sidebar menu will update for this account type.`}
        confirmLabel="Yes"
        cancelLabel="No"
        confirmTone="brand"
      />
    </>
  );
}
