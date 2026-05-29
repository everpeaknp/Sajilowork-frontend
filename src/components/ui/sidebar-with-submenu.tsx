"use client";
import React, { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  History,
  CreditCard,
  Bell,
  User,
  Award,
  Briefcase,
  Image as ImageIcon,
  Settings as SettingsIcon,
  ChevronDown,
  HelpCircle,
  LogOut,
  Wallet,
  Smartphone,
  Mail,
  UserCheck,
  Lock,
  AlertCircle
} from "lucide-react";
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { useTaskerStats } from '@/context/TaskerStatsContext';
import { toast } from 'sonner';

type MenuItem = {
  name: string;
  href: string;
  icon?: React.ReactNode;
};

const Menu = ({
  children,
  items,
  activeIcon,
  onNavigate,
}: {
  children: React.ReactNode;
  items: MenuItem[];
  activeIcon?: React.ReactNode;
  onNavigate?: () => void;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if any submenu item is active (including query params)
  const isAnyItemActive = items.some(item => {
    const [itemPath, itemQuery] = item.href.split('?');
    const pathMatches = pathname === itemPath;
    
    if (!pathMatches) return false;
    if (!itemQuery) return true;
    
    // Check if query params match
    const itemParams = new URLSearchParams(itemQuery);
    const currentTab = searchParams.get('tab');
    const itemTab = itemParams.get('tab');
    
    return currentTab === itemTab;
  });

  const [isOpened, setIsOpened] = useState(isAnyItemActive);

  useEffect(() => {
    if (isAnyItemActive) setIsOpened(true);
  }, [isAnyItemActive]);

  return (
    <div>
      <button
        className={cn(
          "w-full flex items-center justify-between p-3 rounded-xl duration-150 font-bold transition-all",
          isOpened || isAnyItemActive
            ? "bg-white text-blue-950 shadow-sm"
            : "text-gray-500 hover:bg-white hover:text-blue-950 hover:shadow-sm"
        )}
        onClick={() => setIsOpened((v) => !v)}
        aria-expanded={isOpened}
      >
        <div className="flex items-center gap-x-3">
          <div className="text-gray-400 group-hover:text-blue-500">
            {activeIcon}
          </div>
          {children}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 duration-150 text-gray-400",
            isOpened && "rotate-180"
          )}
        />
      </button>
      {isOpened && (
        <ul
          id="submenu"
          className="mx-4 px-2 border-l-2 border-gray-100 text-sm font-medium mt-1 space-y-1 py-1"
        >
          {items.map((item, idx) => {
            const [itemPath, itemQuery] = item.href.split('?');
            const pathMatches = pathname === itemPath;
            
            let isActive = false;
            if (pathMatches) {
              if (!itemQuery) {
                isActive = true;
              } else {
                const itemParams = new URLSearchParams(itemQuery);
                const currentTab = searchParams.get('tab');
                const itemTab = itemParams.get('tab');
                isActive = currentTab === itemTab;
              }
            }
            
            return (
              <li key={idx}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-x-3 p-2.5 rounded-xl hover:bg-white hover:text-blue-950 duration-150 transition-colors",
                    isActive
                      ? "bg-white text-blue-950 shadow-sm font-bold"
                      : "text-gray-500"
                  )}
                >
                  {item.icon ? (
                    <div className={cn("transition-colors", isActive ? "text-blue-950" : "text-gray-400")}>{item.icon}</div>
                  ) : null}
                  <span className="text-xs">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export type TaskerDashboardSidebarProps = {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
};

const Sidebar = ({ mobileOpen = false, onMobileOpenChange }: TaskerDashboardSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const closeMobileNav = () => onMobileOpenChange?.(false);

  const navigation = [
    {
      href: "/tasker-dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      href: "/tasker-dashboard/notifications",
      name: "Notifications",
      icon: <Bell className="w-5 h-5" />
    },
    {
      href: "/tasker-dashboard/portfolio",
      name: "Portfolio",
      icon: <ImageIcon className="w-5 h-5" />
    }
  ];

  const paymentNav: MenuItem[] = [
    {
      name: "History",
      href: "/tasker-dashboard/payments",
      icon: <History className="w-4 h-4" />
    },
    {
      name: "Methods",
      href: "/tasker-dashboard/methods",
      icon: <CreditCard className="w-4 h-4" />
    }
  ];

  const settingsNav: MenuItem[] = [
    {
      name: "Mobile",
      href: "/tasker-dashboard/settings?tab=mobile",
      icon: <Smartphone className="w-3.5 h-3.5" />
    },
    {
      name: "Email",
      href: "/tasker-dashboard/settings?tab=email",
      icon: <Mail className="w-3.5 h-3.5" />
    },
    {
      name: "Verify Account",
      href: "/tasker-dashboard/settings?tab=verify",
      icon: <UserCheck className="w-3.5 h-3.5" />
    },
    {
      name: "Change Password",
      href: "/tasker-dashboard/settings?tab=password",
      icon: <Lock className="w-3.5 h-3.5" />
    },
    {
      name: "Notification Settings",
      href: "/tasker-dashboard/settings?tab=notifications",
      icon: <Bell className="w-3.5 h-3.5" />
    },
    {
      name: "Task Alerts",
      href: "/tasker-dashboard/settings?tab=alerts",
      icon: <AlertCircle className="w-3.5 h-3.5" />
    }
  ];

  const navsFooter = [
    {
      href: "/tasker-dashboard/badges",
      name: "Badges",
      icon: <Award className="w-5 h-5" />
    },
    {
      href: "/tasker-dashboard/skills",
      name: "Skills",
      icon: <Briefcase className="w-5 h-5" />
    }
  ];

  const profileRef = useRef<HTMLButtonElement | null>(null);
  const [isProfileActive, setIsProfileActive] = useState(false);

  useEffect(() => {
    const handleProfile = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileActive(false);
      }
    };
    document.addEventListener("click", handleProfile);
    return () => document.removeEventListener("click", handleProfile);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Get user display info
  const userDisplayName = user ? `${user.first_name} ${user.last_name}`.trim() || 'User' : 'User';
  const userEmail = user?.email || '';
  const userAvatar = user?.profile_image || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100';
  const userInitials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : 'U';
  const { stats: taskerStats } = useTaskerStats();
  const tierLabel = taskerStats?.tier?.current?.name
    ? `${taskerStats.tier.current.name} Tier`
    : 'Bronze Tier';

  return (
    <nav
      className={cn(
        'fixed top-14 left-0 z-50 h-[calc(100dvh-3.5rem)] w-full max-w-full border-r border-outline-variant bg-white overflow-y-auto overscroll-contain shadow-xl transition-transform duration-300 ease-out lg:z-40 lg:w-80 lg:max-w-80 lg:bg-surface-low lg:translate-x-0 lg:shadow-none',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="flex flex-col h-full px-4 pt-4 pb-2">
        {/* User Profile Header */}
        <div className="h-24 flex items-center px-2 mb-4 bg-primary rounded-2xl shadow-lg shadow-blue-500/20">
          <div className="w-full flex items-center gap-x-3 px-2">
            {user?.profile_image ? (
              <img
                src={userAvatar}
                className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm"
                alt="User avatar"
              />
            ) : (
              <div className="w-12 h-12 rounded-full border-2 border-white bg-white flex items-center justify-center text-primary font-bold text-sm shadow-sm">
                {userInitials}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <span className="block text-white text-sm font-bold truncate tracking-tight">
                {userDisplayName}
              </span>
              <span className="block mt-px text-blue-100 text-xs font-semibold">
                {tierLabel}
              </span>
            </div>
            <div className="relative">
              <button
                ref={profileRef}
                className="p-2 rounded-xl text-white hover:bg-white/10 transition-all active:scale-95"
                onClick={() => setIsProfileActive((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isProfileActive}
                aria-controls="profile-menu"
              >
                <ChevronDown
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isProfileActive && "rotate-180"
                  )}
                />
              </button>
              {isProfileActive && (
                <div
                  id="profile-menu"
                  role="menu"
                  className="absolute z-10 top-12 right-0 w-64 rounded-2xl bg-white shadow-xl border border-gray-100 p-2 animate-in fade-in zoom-in duration-200"
                >
                  <div className="p-1 space-y-1">
                    <div className="px-3 py-2 mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Logged in as
                      </p>
                      <p className="text-sm font-bold text-blue-950 truncate">
                        {userEmail}
                      </p>
                    </div>
                    <Link
                      href="/tasker-dashboard/profile"
                      className="flex items-center gap-3 w-full p-2.5 text-left rounded-xl hover:bg-blue-50 hover:text-primary font-bold text-sm text-gray-600 transition-colors"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileActive(false);
                        closeMobileNav();
                      }}
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </Link>
                    <div className="h-px bg-gray-50 my-1 mx-2" />
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full p-2.5 text-left rounded-xl hover:bg-red-50 text-red-500 font-bold text-sm transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-auto pr-1 -mr-1 flex-1">
          <ul className="text-base font-bold flex-1 space-y-1">
            {navigation.slice(0, 1).map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <li key={idx}>
                  <Link
                    href={item.href}
                    onClick={closeMobileNav}
                    className={cn(
                      "flex items-center gap-x-3 text-gray-500 p-3 rounded-xl hover:bg-white hover:text-blue-950 hover:shadow-sm duration-150 transition-all",
                      isActive && "bg-white text-blue-950 shadow-sm"
                    )}
                  >
                    <div
                      className={cn(
                        "transition-colors",
                        item.icon
                          ? "text-gray-400 group-hover:text-primary"
                          : ""
                      )}
                    >
                      {item.icon}
                    </div>
                    {item.name}
                  </Link>
                </li>
              );
            })}
            <li>
              <Menu
                items={paymentNav}
                activeIcon={<Wallet className="w-5 h-5" />}
                onNavigate={closeMobileNav}
              >
                Payments
              </Menu>
            </li>
            {navigation.slice(1).map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <li key={`nav-${idx}`}>
                  <Link
                    href={item.href}
                    onClick={closeMobileNav}
                    className={cn(
                      "flex items-center gap-x-3 text-gray-500 p-3 rounded-xl hover:bg-white hover:text-blue-950 hover:shadow-sm duration-150 transition-all",
                      isActive && "bg-white text-blue-950 shadow-sm"
                    )}
                  >
                    <div
                      className={cn(
                        "transition-colors",
                        item.icon
                          ? "text-gray-400 group-hover:text-primary"
                          : ""
                      )}
                    >
                      {item.icon}
                    </div>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div>
            <ul className="text-base font-bold space-y-1">
              {navsFooter.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      onClick={closeMobileNav}
                      className={cn(
                        "flex items-center gap-x-3 text-gray-500 p-3 rounded-xl hover:bg-white hover:text-blue-950 hover:shadow-sm duration-150 transition-all",
                        isActive && "bg-white text-blue-950 shadow-sm"
                      )}
                    >
                      <div className="text-gray-400">{item.icon}</div>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Menu
                  items={settingsNav}
                  activeIcon={<SettingsIcon className="w-5 h-5" />}
                  onNavigate={closeMobileNav}
                >
                  Settings
                </Menu>
              </li>
            </ul>
          </div>
        </div>

        {/* Support Section at Bottom */}
        <div className="mt-auto px-2">
          <button className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-blue-500/10 hover:opacity-90 transition-all active:scale-[0.98]">
            <HelpCircle className="w-5 h-5" />
            <span>Support Help</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default function SidebarWrapper(props: TaskerDashboardSidebarProps) {
  return (
    <Suspense
      fallback={
        <div className="fixed top-14 left-0 z-50 h-[calc(100dvh-3.5rem)] w-full max-w-full border-r border-outline-variant bg-white lg:z-40 lg:w-80 lg:max-w-80 lg:bg-surface-low" />
      }
    >
      <Sidebar {...props} />
    </Suspense>
  );
}
