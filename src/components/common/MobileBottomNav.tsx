'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Briefcase, ClipboardList, FolderKanban, UserCircle, Wrench } from 'lucide-react';
import { TASK_BROWSE_PATH, TASK_MAP_PATH } from '@/lib/taskBrowsePath';
import { JOB_BROWSE_PATH, JOB_MAP_PATH } from '@/lib/jobBrowsePath';
import { PROJECT_MAP_PATH } from '@/lib/projectBrowsePath';
import { SERVICE_MAP_PATH } from '@/lib/serviceBrowsePath';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

function navigateAuth(
  router: ReturnType<typeof useRouter>,
  isAuthenticated: boolean,
  href: string,
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
  '/verify-email',
  '/dashboard/task/postnewtask',
];

function isHiddenPath(pathname: string) {
  return HIDDEN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

type NavItem = {
  id: 'task' | 'projects' | 'account' | 'services' | 'jobs';
  label: string;
  icon: typeof ClipboardList;
  href: string;
  requiresAuth?: boolean;
  match: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: 'task',
    label: 'Task',
    icon: ClipboardList,
    href: TASK_BROWSE_PATH,
    match: (pathname) =>
      pathname === TASK_BROWSE_PATH ||
      pathname === TASK_MAP_PATH ||
      (pathname.startsWith('/task/') && !pathname.startsWith('/tasker-dashboard')),
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderKanban,
    href: '/projects',
    match: (pathname) =>
      pathname === '/projects' ||
      pathname === PROJECT_MAP_PATH ||
      pathname.startsWith('/projects/'),
  },
  {
    id: 'account',
    label: 'My Account',
    icon: UserCircle,
    href: '/dashboard',
    requiresAuth: true,
    match: (pathname) =>
      pathname === '/dashboard' || pathname.startsWith('/dashboard/'),
  },
  {
    id: 'services',
    label: 'Services',
    icon: Wrench,
    href: '/services',
    match: (pathname) =>
      pathname === '/services' ||
      pathname === SERVICE_MAP_PATH ||
      pathname.startsWith('/services/'),
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: Briefcase,
    href: JOB_BROWSE_PATH,
    match: (pathname) =>
      pathname === JOB_BROWSE_PATH ||
      pathname === JOB_MAP_PATH ||
      pathname.startsWith('/jobs/'),
  },
];

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const visible = !isHiddenPath(pathname);

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
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-[9990] border-t border-gray-200/80 bg-white/95 backdrop-blur-md md:hidden dark:border-neutral-800 dark:bg-neutral-950/95"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-[3.75rem] max-w-lg items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom,0px)]">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.requiresAuth) {
                  navigateAuth(router, isAuthenticated, item.href);
                  return;
                }
                router.push(item.href);
              }}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition',
                  active ? 'bg-brand-emerald/10 text-brand-emerald' : 'text-neutral-600',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
              </span>
              <span
                className={cn(
                  'max-w-full truncate text-center text-[9px] font-semibold leading-tight sm:text-[10px]',
                  active ? 'text-brand-emerald' : 'text-neutral-600',
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
