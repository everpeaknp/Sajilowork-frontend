'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Briefcase, PlusCircle, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { taskService } from '@/services';
import { cn } from '@/lib/utils';

function navigateAuth(
  router: ReturnType<typeof useRouter>,
  isAuthenticated: boolean,
  href: string
) {
  if (!isAuthenticated) {
    router.push(`/signin?redirect=${encodeURIComponent(href)}`);
    return;
  }
  router.push(href);
}

const HIDDEN_PATH_PREFIXES = [
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/post-task',
];

function isHiddenPath(pathname: string) {
  return HIDDEN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

type NavItem = {
  id: 'browse' | 'post' | 'my-tasks';
  label: string;
  icon: typeof Search;
  href: string;
  match: (pathname: string) => boolean;
  primary?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: 'browse',
    label: 'Browse',
    icon: Search,
    href: '/task',
    match: (pathname) =>
      pathname === '/task' ||
      (pathname.startsWith('/task/') && !pathname.startsWith('/tasker-dashboard')),
  },
  {
    id: 'post',
    label: 'Post',
    icon: PlusCircle,
    href: '/post-task',
    match: (pathname) => pathname === '/post-task' || pathname.startsWith('/post-task/'),
    primary: true,
  },
  {
    id: 'my-tasks',
    label: 'My tasks',
    icon: Briefcase,
    href: '/my-tasks',
    match: (pathname) =>
      pathname === '/my-tasks' || pathname.startsWith('/my-tasks/'),
  },
];

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [myTasksCount, setMyTasksCount] = useState(0);

  const visible = isAuthenticated && !isHiddenPath(pathname);

  const fetchMyTasksCount = useCallback(async () => {
    try {
      const response = await taskService.getMyTasks();
      if (response.success && response.data) {
        setMyTasksCount(response.data.count ?? response.data.results?.length ?? 0);
      }
    } catch {
      setMyTasksCount(0);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchMyTasksCount();
  }, [isAuthenticated, fetchMyTasksCount, pathname]);

  useEffect(() => {
    if (!visible) return;
    document.body.classList.add('has-mobile-bottom-nav');
    return () => {
      document.body.classList.remove('has-mobile-bottom-nav');
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[9990] border-t border-gray-200/80 bg-white/95 backdrop-blur-md md:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-[3.75rem] max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom,0px)]">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          const showBadge = item.id === 'my-tasks' && myTasksCount > 0;

          if (item.primary) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateAuth(router, isAuthenticated, item.href)}
                className="relative -mt-5 flex min-w-[4.5rem] flex-col items-center justify-end gap-0.5"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition active:scale-95',
                    active
                      ? 'bg-[#0047ff] text-white ring-4 ring-[#005fff]/20'
                      : 'bg-[#005fff] text-white'
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={2.25} />
                </span>
                <span
                  className={cn(
                    'text-[10px] font-semibold',
                    active ? 'text-[#005fff]' : 'text-[#3c4a6b]'
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'browse') {
                  router.push(item.href);
                  return;
                }
                navigateAuth(router, isAuthenticated, item.href);
              }}
              className="relative flex min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 py-1"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <span
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-2xl transition',
                  active ? 'bg-[#005fff]/10 text-[#005fff]' : 'text-[#3c4a6b]'
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
                {showBadge && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white ring-2 ring-white">
                    {myTasksCount > 9 ? '9+' : myTasksCount}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  'text-[10px] font-semibold',
                  active ? 'text-[#005fff]' : 'text-[#3c4a6b]'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
