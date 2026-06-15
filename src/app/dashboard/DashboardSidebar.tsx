'use client';

import { useMemo, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Home,
  FileText,
  Heart,
  MessageSquareMore,
  MessageSquare,
  TrendingUp,
  Monitor,
  Briefcase,
  ClipboardList,
  ListTodo,
  CircleUser,
  Settings,
  Wallet,
  Plus,
  CircleHelp,
  UserCheck,
  ScrollText,
  HandCoins,
  PanelLeft,
  PanelLeftClose,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import UserAvatar from '@/components/common/UserAvatar';
import {
  getDashboardHref,
  getDashboardCreateHref,
  getNavTabsForRole,
  getNavLabelForRole,
  type DashboardCreateTab,
  type DashboardSidebarRole,
  type DashboardTab,
} from './dashboardTabs';
import AccountRoleMode from '@/components/common/AccountRoleMode';
import { useDashboardSidebarRole } from './DashboardRoleSwitchContext';

export type { DashboardTab };

interface NavigationItem {
  id: DashboardTab;
  label: string;
  icon: LucideIcon;
  href: string;
}

function isCreateTab(tab: DashboardTab): tab is DashboardCreateTab {
  return tab === 'services' || tab === 'jobs' || tab === 'project' || tab === 'task';
}

function createLabelForTab(tab: DashboardCreateTab): string {
  switch (tab) {
    case 'services':
      return 'service';
    case 'jobs':
      return 'job';
    case 'project':
      return 'project';
    case 'task':
      return 'task';
  }
}
function resolveNavItem(tabId: DashboardTab, role: DashboardSidebarRole): NavigationItem {
  const base = NAV_ITEM_LOOKUP[tabId];
  return {
    ...base,
    label: getNavLabelForRole(tabId, role),
    href: getDashboardHref(tabId),
  };
}

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function DashboardRoleDropdown({
  isProfileActive,
}: {
  isProfileActive: boolean;
}) {
  return <AccountRoleMode variant="sidebar" isProfileActive={isProfileActive} />;
}

const SIDEBAR_MOTION = 'duration-300 ease-in-out';

function SidebarReveal({
  collapsed,
  children,
  className = '',
  maxWidth = '11rem',
}: {
  collapsed: boolean;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <span
      className={`min-w-0 shrink overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] ${SIDEBAR_MOTION} ${className} ${
        collapsed
          ? 'pointer-events-none max-w-0 opacity-0 -translate-x-1'
          : 'max-w-[var(--sidebar-reveal-max)] opacity-100 translate-x-0'
      }`}
      style={{ ['--sidebar-reveal-max' as string]: maxWidth }}
    >
      {children}
    </span>
  );
}

const NAV_ITEM_LOOKUP: Record<DashboardTab, NavigationItem> = {
  dashboard: { id: 'dashboard', label: 'Dashboard', icon: Home },
  proposals: { id: 'proposals', label: 'My Proposals', icon: FileText },
  applications: { id: 'applications', label: 'Applications', icon: UserCheck },
  bids: { id: 'bids', label: 'Bids', icon: HandCoins },
  contracts: { id: 'contracts', label: 'Contracts', icon: ScrollText },
  message: { id: 'message', label: 'Messages', icon: MessageSquareMore },
  services: { id: 'services', label: 'My Services', icon: Monitor },
  orders: { id: 'orders', label: 'Orders', icon: ShoppingBag, href: getDashboardHref('orders') },
  jobs: { id: 'jobs', label: 'My Jobs', icon: Briefcase, href: getDashboardHref('jobs') },
  task: { id: 'task', label: 'My Tasks', icon: ListTodo, href: getDashboardHref('task') },
  project: { id: 'project', label: 'My Projects', icon: ClipboardList, href: getDashboardHref('project') },
  statements: { id: 'statements', label: 'Statements', icon: TrendingUp },
  wallet: { id: 'wallet', label: 'Wallet', icon: Wallet },
  reviews: { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  questions: { id: 'questions', label: 'Questions', icon: CircleHelp },
  saved: { id: 'saved', label: 'Saved', icon: Heart },
  settings: { id: 'settings', label: 'Settings', icon: Settings },
  profile: { id: 'profile', label: 'My Profile', icon: CircleUser },
};

export default function DashboardSidebar({
  activeTab,
  onTabChange,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const user = useAuthStore((s) => s.user);
  const sidebarRole = useDashboardSidebarRole();

  const navItems = useMemo(
    () => getNavTabsForRole(sidebarRole).map((tabId) => resolveNavItem(tabId, sidebarRole)),
    [sidebarRole],
  );

  const renderItem = (item: NavigationItem) => {
    const isActive = activeTab === item.id;
    const Icon = item.icon;
    const hasCreate = isCreateTab(item.id);

    if (!hasCreate || collapsed) {
      return (
        <Link
          key={item.id}
          href={item.href}
          title={collapsed ? item.label : undefined}
          onClick={() => {
            onTabChange(item.id);
            onClose?.();
          }}
          className={`group flex w-full min-w-0 cursor-pointer items-center rounded-lg py-3.5 text-[15px] font-medium transition-[padding,background-color,color,box-shadow,gap] ${SIDEBAR_MOTION} ${
            collapsed ? 'justify-center px-2' : 'gap-[18px] px-4'
          } ${
            isActive
              ? 'bg-[#222222] font-semibold text-white shadow-sm'
              : 'text-black hover:bg-neutral-50'
          }`}
        >
          <Icon
            className={`h-[22px] w-[22px] shrink-0 transition-transform ${SIDEBAR_MOTION} ${
              isActive ? 'text-[#52C47F]' : 'text-black'
            }`}
            strokeWidth={1.8}
          />
          {!collapsed ? (
            <SidebarReveal collapsed={false} className="truncate tracking-wide">
              {item.label}
            </SidebarReveal>
          ) : null}
        </Link>
      );
    }

    return (
      <div
        key={item.id}
        className={`group flex w-full min-w-0 items-center rounded-lg transition-[background-color,box-shadow,padding] ${SIDEBAR_MOTION} ${
          isActive ? 'bg-[#222222] shadow-sm' : 'hover:bg-neutral-50'
        }`}
      >
        <Link
          href={item.href}
          onClick={() => {
            onTabChange(item.id);
            onClose?.();
          }}
          className={`flex min-w-0 flex-1 cursor-pointer items-center gap-[18px] rounded-lg px-4 py-3.5 text-[15px] font-medium transition-[padding,background-color,color,gap] ${SIDEBAR_MOTION} ${
            isActive ? 'font-semibold text-white' : 'text-black'
          }`}
        >
          <Icon
            className={`h-[22px] w-[22px] shrink-0 transition-transform ${SIDEBAR_MOTION} ${
              isActive ? 'text-[#52C47F]' : 'text-black'
            }`}
            strokeWidth={1.8}
          />
          <SidebarReveal collapsed={false} className="truncate tracking-wide">
            {item.label}
          </SidebarReveal>
        </Link>

        <Link
          href={getDashboardCreateHref(item.id)}
          onClick={() => onClose?.()}
          aria-label={`Post new ${createLabelForTab(item.id)}`}
          title={`Post new ${createLabelForTab(item.id)}`}
          className={`mr-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${SIDEBAR_MOTION} ${
            isActive
              ? 'text-white/80 hover:bg-white/10 hover:text-[#52C47F]'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
          }`}
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
        </Link>
      </div>
    );
  };

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden bg-white">
      <div
        className={`hidden shrink-0 items-center border-b border-neutral-100 py-2 transition-[padding] lg:flex ${SIDEBAR_MOTION} ${
          collapsed ? 'justify-center px-2' : 'justify-between px-3'
        }`}
      >
        {!collapsed ? (
          <span className="px-1 text-sm font-semibold tracking-wide text-neutral-800">Menu</span>
        ) : null}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`relative inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black ${SIDEBAR_MOTION}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeftClose
            className={`absolute h-5 w-5 transition-all ${SIDEBAR_MOTION} ${
              collapsed ? 'scale-75 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
            }`}
            strokeWidth={1.8}
          />
          <PanelLeft
            className={`h-5 w-5 transition-all ${SIDEBAR_MOTION} ${
              collapsed ? 'scale-100 rotate-0 opacity-100' : 'scale-75 -rotate-90 opacity-0'
            }`}
            strokeWidth={1.8}
          />
        </button>
      </div>

      <div
        className={`scrollbar-none flex-1 select-none overflow-y-auto overflow-x-hidden pb-6 transition-[padding] ${SIDEBAR_MOTION} ${
          collapsed ? 'px-1.5 pt-2' : 'px-4 pt-3'
        }`}
      >
        <div className="space-y-1">{navItems.map((item) => renderItem(item))}</div>
      </div>

      <div
        className={`pt-0 transition-[padding] ${SIDEBAR_MOTION} ${collapsed ? 'p-1.5' : 'p-4'}`}
      >
        <div className="space-y-1">
          <div
            className={`group flex w-full min-w-0 items-center rounded-lg transition-[background-color,box-shadow] ${SIDEBAR_MOTION} ${
              activeTab === 'profile' ? 'bg-[#222222] shadow-sm' : 'hover:bg-neutral-50'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <Link
              href={getDashboardHref('profile')}
              title={collapsed ? 'My Profile' : undefined}
              onClick={() => {
                onTabChange('profile');
                onClose?.();
              }}
              className={`flex cursor-pointer items-center rounded-lg py-3.5 text-[15px] font-medium transition-[padding,background-color,color,gap] ${SIDEBAR_MOTION} ${
                collapsed
                  ? 'w-full justify-center px-2'
                  : 'min-w-0 flex-1 gap-[18px] px-4'
              } ${activeTab === 'profile' ? 'font-semibold text-white' : 'text-black'}`}
            >
              <UserAvatar
                src={user?.profile_image}
                name={user ? `${user.first_name} ${user.last_name}` : 'My Profile'}
                size="xs"
                className="!h-[22px] !w-[22px] shrink-0"
              />
              {!collapsed ? (
                <SidebarReveal collapsed={false} className="truncate tracking-wide">
                  My Profile
                </SidebarReveal>
              ) : null}
            </Link>

            {!collapsed ? (
              <DashboardRoleDropdown isProfileActive={activeTab === 'profile'} />
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
