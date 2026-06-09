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
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

export type DashboardTab =
  | 'dashboard'
  | 'proposals'
  | 'saved'
  | 'message'
  | 'reviews'
  | 'invoice'
  | 'payouts'
  | 'statements'
  | 'services'
  | 'jobs'
  | 'project'
  | 'profile';

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

const PRIMARY_NAV_ITEMS: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'proposals', label: 'My Proposals', icon: FileText },
  { id: 'saved', label: 'Saved', icon: Heart },
  { id: 'message', label: 'Message', icon: MessageSquareMore },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'invoice', label: 'Invoice', icon: Receipt },
  { id: 'payouts', label: 'Payouts', icon: CircleDollarSign },
  { id: 'statements', label: 'Statements', icon: TrendingUp },
];

const SECONDARY_NAV_ITEMS: NavigationItem[] = [
  { id: 'services', label: 'Manage Services', icon: Monitor },
  { id: 'jobs', label: 'Manage Jobs', icon: Briefcase },
  { id: 'project', label: 'Manage Project', icon: ClipboardList },
];

export default function DashboardSidebar({
  activeTab,
  onTabChange,
  onClose,
}: DashboardSidebarProps) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      onClose?.();
      router.push('/');
    } catch {
      toast.error('Failed to logout');
      router.push('/');
    }
  };

  const renderItem = (item: NavigationItem) => {
    const isActive = activeTab === item.id;
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          onTabChange(item.id);
          onClose?.();
        }}
        className={`group flex w-full cursor-pointer items-center gap-[18px] rounded-lg px-4 py-3.5 text-[15px] font-medium transition-all duration-150 ${
          isActive
            ? 'bg-[#222222] font-semibold text-white shadow-sm'
            : 'text-[#555555] hover:bg-neutral-50 hover:text-neutral-900'
        }`}
      >
        <Icon
          className={`h-[22px] w-[22px] shrink-0 ${
            isActive ? 'text-[#52C47F]' : 'text-neutral-400 group-hover:text-neutral-600'
          }`}
          strokeWidth={1.8}
        />
        <span className="truncate tracking-wide">{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="flex h-full w-full flex-col bg-white">
      <div className="scrollbar-none flex-1 select-none overflow-y-auto px-4 py-6 md:py-8">
        <div className="mb-8 space-y-1">{PRIMARY_NAV_ITEMS.map((item) => renderItem(item))}</div>

        <div className="mb-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Organize and Manage
        </div>

        <div className="space-y-1">{SECONDARY_NAV_ITEMS.map((item) => renderItem(item))}</div>
      </div>

      <div className="p-4 pt-0">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              onTabChange('profile');
              onClose?.();
            }}
            className={`group flex w-full cursor-pointer items-center gap-[18px] rounded-lg px-4 py-3 text-[15px] font-medium transition-all duration-150 ${
              activeTab === 'profile'
                ? 'bg-[#222222] font-semibold text-white shadow-sm'
                : 'text-[#555555] hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <CircleUser
              className={`h-[22px] w-[22px] shrink-0 ${
                activeTab === 'profile'
                  ? 'text-[#52C47F]'
                  : 'text-neutral-400 group-hover:text-neutral-600'
              }`}
              strokeWidth={1.8}
            />
            <span className="truncate tracking-wide">My Account</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full cursor-pointer items-center gap-[18px] rounded-lg px-4 py-3 text-[15px] font-medium text-[#555555] transition-all duration-150 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut
              className="h-[22px] w-[22px] shrink-0 text-neutral-400 group-hover:text-red-500"
              strokeWidth={1.8}
            />
            <span className="truncate tracking-wide">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
