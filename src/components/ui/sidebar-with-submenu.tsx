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
  AlertCircle,
} from "lucide-react";
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/common/UserAvatar';
import { useAuthStore } from '@/store';
import { useTaskerStats } from '@/context/TaskerStatsContext';
import { toast } from 'sonner';
import { landingBody } from '@/components/LangingHome/landingTypography';

const navText = 'text-brand-dark';
const navLabel = landingBody;
const navItemBase =
  'flex items-center gap-x-3 rounded-lg p-3 transition-all duration-150';
const navItemIdle = `${navText} font-medium hover:bg-brand-emerald/10 hover:text-brand-emerald`;
const navItemActive = 'bg-brand-emerald/10 font-semibold text-brand-emerald';
const subNavItemBase =
  'flex items-center gap-x-3 rounded-lg p-2.5 transition-colors duration-150';
const subNavItemIdle = `${navText} font-medium hover:bg-brand-emerald/10 hover:text-brand-emerald`;
const subNavItemActive = 'bg-brand-emerald/10 font-semibold text-brand-emerald';
const menuParentBase =
  'flex w-full items-center justify-between rounded-lg p-3 transition-all duration-150';
const menuParentIdle = `${navText} font-medium hover:bg-brand-emerald/10 hover:text-brand-emerald`;
const menuParentActive = 'bg-brand-emerald/10 font-semibold text-brand-emerald';

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
          menuParentBase,
          navLabel,
          'text-sm',
          isOpened || isAnyItemActive ? menuParentActive : menuParentIdle,
        )}
        onClick={() => setIsOpened((v) => !v)}
        aria-expanded={isOpened}
      >
        <div className="flex items-center gap-x-3">
          <div
            className={cn(
              'transition-colors',
              isOpened || isAnyItemActive ? 'text-brand-emerald' : navText,
            )}
          >
            {activeIcon}
          </div>
          {children}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 duration-150',
            isOpened || isAnyItemActive ? 'text-brand-emerald' : navText,
            isOpened && 'rotate-180',
          )}
        />
      </button>
      {isOpened && (
        <ul
          id="submenu"
          className={cn(landingBody, 'mx-4 mt-1 space-y-1 border-l-2 border-brand-emerald/10 px-2 py-1 text-sm')}
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
                    subNavItemBase,
                    navLabel,
                    'text-xs',
                    isActive ? subNavItemActive : subNavItemIdle,
                  )}
                >
                  {item.icon ? (
                    <div className={cn('transition-colors', isActive ? 'text-brand-emerald' : navText)}>
                      {item.icon}
                    </div>
                  ) : null}
                  <span>{item.name}</span>
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
  const { stats: taskerStats } = useTaskerStats();
  const tierLabel = taskerStats?.tier?.current?.name
    ? `${taskerStats.tier.current.name} Tier`
    : 'Bronze Tier';

  return (
    <nav
      className={cn(
        landingBody,
        'fixed top-14 left-0 z-50 h-[calc(100dvh-3.5rem)] w-full max-w-full border-r border-outline-variant bg-white overflow-y-auto overscroll-contain shadow-xl transition-transform duration-300 ease-out lg:z-40 lg:w-80 lg:max-w-80 lg:bg-surface-low lg:translate-x-0 lg:shadow-none',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      <div className="flex flex-col h-full px-4 pt-4 pb-2">
        {/* User Profile Header */}
        <div className="h-24 flex items-center px-2 mb-4 bg-brand-emerald rounded-2xl shadow-lg shadow-brand-emerald/20">
          <div className="w-full flex items-center gap-x-3 px-2">
            <UserAvatar
              src={user?.profile_image}
              name={userDisplayName}
              size="lg"
              verified={user?.is_verified_tasker}
              className="border-2 border-white shadow-sm"
            />
            <div className="flex-1 overflow-hidden">
              <span className={cn(navLabel, 'block truncate text-sm font-medium text-white')}>
                {userDisplayName}
              </span>
              <span className={cn(landingBody, 'mt-px block text-xs font-medium text-emerald-100')}>
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
                  className="absolute z-10 top-12 right-0 w-64 rounded-xl border border-outline-variant bg-white p-2 shadow-xl animate-in fade-in zoom-in duration-200"
                >
                  <div className="p-1 space-y-1">
                    <div className="mb-1 px-3 py-2">
                      <p
                        className={cn(
                          navLabel,
                          'text-[10px] font-medium uppercase tracking-[0.2em] text-brand-dark/60',
                        )}
                      >
                        Logged in as
                      </p>
                      <p className={cn(navLabel, 'truncate text-sm font-medium text-brand-dark')}>
                        {userEmail}
                      </p>
                    </div>
                    <Link
                      href="/tasker-dashboard/profile"
                      className={cn(
                        navLabel,
                        'flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-sm font-medium text-brand-dark transition-colors hover:bg-brand-emerald/10 hover:text-brand-emerald',
                      )}
                      role="menuitem"
                      onClick={() => {
                        setIsProfileActive(false);
                        closeMobileNav();
                      }}
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </Link>
                    <div className="mx-2 my-1 h-px bg-outline-variant" />
                    <button
                      onClick={handleLogout}
                      className={cn(
                        navLabel,
                        'flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50',
                      )}
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
          <ul className="flex-1 space-y-1">
            {navigation.slice(0, 1).map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <li key={idx}>
                  <Link
                    href={item.href}
                    onClick={closeMobileNav}
                    className={cn(
                      navItemBase,
                      navLabel,
                      'text-sm',
                      isActive ? navItemActive : navItemIdle,
                    )}
                  >
                    <div
                      className={cn(
                        'transition-colors',
                        isActive ? 'text-brand-emerald' : navText,
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
                      navItemBase,
                      navLabel,
                      'text-sm',
                      isActive ? navItemActive : navItemIdle,
                    )}
                  >
                    <div
                      className={cn(
                        'transition-colors',
                        isActive ? 'text-brand-emerald' : navText,
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
            <ul className="space-y-1">
              {navsFooter.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      onClick={closeMobileNav}
                      className={cn(
                        navItemBase,
                        navLabel,
                        'text-sm',
                        isActive ? navItemActive : navItemIdle,
                      )}
                    >
                      <div
                        className={cn(
                          'transition-colors',
                          isActive ? 'text-brand-emerald' : navText,
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
          <button
            className={cn(
              navLabel,
              'flex w-full items-center justify-center gap-2 rounded-lg bg-brand-emerald py-4 text-sm font-medium text-white shadow-lg shadow-brand-emerald/10 transition-all hover:opacity-90 active:scale-[0.98]',
            )}
          >
            <HelpCircle className="h-5 w-5" />
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
