'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Home,
  FileText,
  Heart,
  MessageSquareMore,
  MessageSquare,
  Receipt,
  CircleDollarSign,
  TrendingUp,
  Monitor,
  Briefcase,
  ClipboardList,
  CircleUser,
  Settings,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { getDashboardHref, type DashboardTab } from './dashboardTabs';

export type { DashboardTab };

interface NavigationItem {
  id: DashboardTab;
  label: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'proposals', label: 'My Proposals', icon: FileText },
  { id: 'message', label: 'Message', icon: MessageSquareMore },
  { id: 'services', label: 'Manage Services', icon: Monitor },
  { id: 'jobs', label: 'Manage Jobs', icon: Briefcase },
  { id: 'project', label: 'Manage Project', icon: ClipboardList },
  { id: 'statements', label: 'Statements', icon: TrendingUp },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'invoice', label: 'Invoice', icon: Receipt },
  { id: 'payouts', label: 'Payouts', icon: CircleDollarSign },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'saved', label: 'Saved', icon: Heart },
];

export default function DashboardSidebar({
  activeTab,
  onTabChange,
  onClose,
}: DashboardSidebarProps) {
  const renderItem = (item: NavigationItem) => {
    const isActive = activeTab === item.id;
    const Icon = item.icon;

    return (
      <Link
        key={item.id}
        href={getDashboardHref(item.id)}
        onClick={() => {
          onTabChange(item.id);
          onClose?.();
        }}
        className={`group flex w-full cursor-pointer items-center gap-[18px] rounded-lg px-4 py-3.5 text-[15px] font-medium transition-all duration-150 ${
          isActive
            ? 'bg-[#222222] font-semibold text-white shadow-sm'
            : 'text-black hover:bg-neutral-50'
        }`}
      >
        <Icon
          className={`h-[22px] w-[22px] shrink-0 ${
            isActive ? 'text-[#52C47F]' : 'text-black'
          }`}
          strokeWidth={1.8}
        />
        <span className="truncate tracking-wide">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="flex h-full w-full flex-col bg-white">
      <div className="scrollbar-none flex-1 select-none overflow-y-auto px-4 py-6 md:py-8">
        <div className="space-y-1">{NAV_ITEMS.map((item) => renderItem(item))}</div>
      </div>

      <div className="p-4 pt-0">
        <div className="space-y-1">
          <div
            className={`group flex w-full items-center rounded-lg transition-all duration-150 ${
              activeTab === 'profile' || activeTab === 'settings'
                ? 'bg-[#222222] shadow-sm'
                : 'hover:bg-neutral-50'
            }`}
          >
            <Link
              href={getDashboardHref('profile')}
              onClick={() => {
                onTabChange('profile');
                onClose?.();
              }}
              className={`flex min-w-0 flex-1 cursor-pointer items-center gap-[18px] rounded-lg px-4 py-3 text-[15px] font-medium transition-all duration-150 ${
                activeTab === 'profile'
                  ? 'font-semibold text-white'
                  : activeTab === 'settings'
                    ? 'text-neutral-300 hover:text-white'
                    : 'text-black'
              }`}
            >
              <CircleUser
                className={`h-[22px] w-[22px] shrink-0 ${
                  activeTab === 'profile'
                    ? 'text-[#52C47F]'
                    : activeTab === 'settings'
                      ? 'text-neutral-400'
                      : 'text-black'
                }`}
                strokeWidth={1.8}
              />
              <span className="truncate tracking-wide">My Profile</span>
            </Link>

            <Link
              href={getDashboardHref('settings')}
              onClick={() => {
                onTabChange('settings');
                onClose?.();
              }}
              aria-label="Settings"
              title="Settings"
              className={`mr-2 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'text-[#52C47F]'
                  : activeTab === 'profile'
                    ? 'text-neutral-400 hover:bg-white/10 hover:text-white'
                    : 'text-black hover:bg-neutral-100'
              }`}
            >
              <Settings className="h-[20px] w-[20px]" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
