'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { userService } from '@/services';
import { normalizeUserFromApi, notifyUserProfileUpdated } from '@/lib/userProfileSync';
import DeleteConfirmModal from './DeleteConfirmModal';
import {
  getDashboardHref,
  isTabAllowedForRole,
  tabFromPathname,
  type DashboardSidebarRole,
  resolveDashboardSidebarRole,
  getDashboardRoleLabel,
} from './dashboardTabs';

type DashboardRoleSwitchContextValue = {
  requestRoleSwitch: (nextRole: DashboardSidebarRole) => void;
  switching: boolean;
};

const DashboardRoleSwitchContext = createContext<DashboardRoleSwitchContextValue | null>(null);

export function DashboardRoleSwitchProvider({ children }: { children: ReactNode }) {
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

          const activeTab = tabFromPathname(pathname);
          if (!isTabAllowedForRole(activeTab, nextRole)) {
            router.push(getDashboardHref('dashboard'));
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

  const requestRoleSwitch = useCallback(
    (nextRole: DashboardSidebarRole) => {
      if (switching || !user || nextRole === currentRole) return;
      setPendingRole(nextRole);
    },
    [currentRole, switching, user],
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

  const value = useMemo(
    () => ({
      requestRoleSwitch,
      switching,
    }),
    [requestRoleSwitch, switching],
  );

  return (
    <DashboardRoleSwitchContext.Provider value={value}>
      {children}
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
    </DashboardRoleSwitchContext.Provider>
  );
}

export function useDashboardRoleSwitch() {
  const context = useContext(DashboardRoleSwitchContext);
  if (!context) {
    throw new Error('useDashboardRoleSwitch must be used within DashboardRoleSwitchProvider');
  }
  return context;
}

export function useDashboardSidebarRole(): DashboardSidebarRole {
  const user = useAuthStore((s) => s.user);
  return resolveDashboardSidebarRole(user?.role);
}
