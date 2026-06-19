'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardTab } from './DashboardTabContext';
import { useAuthStore } from '@/store';
import { isTabAllowedForRole, type DashboardSidebarRole } from './dashboardTabs';
import { useDashboardSidebarRole } from './DashboardRoleSwitchContext';

function TabPanelLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-neutral-500">Loading…</p>
    </div>
  );
}

const DashboardOverview = dynamic(() => import('./DashboardOverview'), {
  loading: () => <TabPanelLoading />,
});
const DashboardProposals = dynamic(() => import('./DashboardProposals'), {
  loading: () => <TabPanelLoading />,
});
const DashboardSaved = dynamic(() => import('./DashboardSaved'), {
  loading: () => <TabPanelLoading />,
});
const DashboardMessages = dynamic(() => import('./DashboardMessages'), {
  loading: () => <TabPanelLoading />,
});
const DashboardReviews = dynamic(() => import('./DashboardReviews'), {
  loading: () => <TabPanelLoading />,
});
const DashboardQuestions = dynamic(() => import('./DashboardQuestions'), {
  loading: () => <TabPanelLoading />,
});
const DashboardWallet = dynamic(() => import('./DashboardWallet'), {
  loading: () => <TabPanelLoading />,
});
const DashboardServices = dynamic(() => import('./DashboardServices'), {
  loading: () => <TabPanelLoading />,
});
const DashboardJobs = dynamic(() => import('./DashboardJobs'), {
  loading: () => <TabPanelLoading />,
});
const DashboardTasks = dynamic(() => import('./DashboardTasks'), {
  loading: () => <TabPanelLoading />,
});
const DashboardProjects = dynamic(() => import('./DashboardProjects'), {
  loading: () => <TabPanelLoading />,
});
const DashboardFreelancerProjects = dynamic(() => import('./DashboardFreelancerProjects'), {
  loading: () => <TabPanelLoading />,
});
const DashboardProfile = dynamic(() => import('./DashboardProfile'), {
  loading: () => <TabPanelLoading />,
});
const DashboardSettings = dynamic(() => import('./DashboardSettings'), {
  loading: () => <TabPanelLoading />,
});
const DashboardContracts = dynamic(() => import('./DashboardContracts'), {
  loading: () => <TabPanelLoading />,
});
const DashboardOrders = dynamic(() => import('./DashboardOrders'), {
  loading: () => <TabPanelLoading />,
});
const DashboardEmployerBids = dynamic(() => import('./DashboardEmployerBids'), {
  loading: () => <TabPanelLoading />,
});
const DashboardEmployerApplications = dynamic(() => import('./DashboardEmployerApplications'), {
  loading: () => <TabPanelLoading />,
});

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  applications: 'Applications',
  bids: 'Bids',
  contracts: 'Contracts',
  saved: 'Saved',
  message: 'Message',
  reviews: 'Reviews',
  questions: 'Questions',
  statements: 'Statements',
  wallet: 'Wallet',
  services: 'Manage Services',
  orders: 'Orders',
  jobs: 'Manage Jobs',
  task: 'Manage Tasks',
  project: 'Manage Project',
  profile: 'My Profile',
  settings: 'Settings',
};

export default function DashboardTabContent() {
  const { activeTab, setActiveTab } = useDashboardTab();
  const userRole = useAuthStore((s) => s.user?.role);
  const sidebarRole = useDashboardSidebarRole();
  const router = useRouter();

  useEffect(() => {
    if (activeTab === 'statements') {
      router.replace('/dashboard/wallet?section=statements');
      return;
    }
    if (sidebarRole === 'customer' && activeTab === 'proposals') {
      router.replace('/dashboard/applications');
      return;
    }
    if (!isTabAllowedForRole(activeTab, sidebarRole as DashboardSidebarRole)) {
      router.replace('/dashboard');
    }
  }, [activeTab, router, sidebarRole]);

  if (activeTab === 'dashboard') {
    return <DashboardOverview onTabChange={setActiveTab} />;
  }

  if (activeTab === 'applications') {
    return <DashboardEmployerApplications />;
  }

  if (activeTab === 'bids') {
    return <DashboardEmployerBids />;
  }

  if (activeTab === 'contracts') {
    return <DashboardContracts />;
  }

  if (activeTab === 'proposals') {
    return <DashboardProposals />;
  }

  if (activeTab === 'saved') {
    return <DashboardSaved />;
  }

  if (activeTab === 'message') {
    return <DashboardMessages />;
  }

  if (activeTab === 'reviews') {
    return <DashboardReviews />;
  }

  if (activeTab === 'questions') {
    return <DashboardQuestions />;
  }

  if (activeTab === 'statements') {
    return null;
  }

  if (activeTab === 'wallet') {
    return <DashboardWallet />;
  }

  if (activeTab === 'services') {
    return <DashboardServices />;
  }

  if (activeTab === 'orders') {
    return <DashboardOrders />;
  }

  if (activeTab === 'jobs') {
    return <DashboardJobs />;
  }

  if (activeTab === 'task') {
    return <DashboardTasks />;
  }

  if (activeTab === 'project') {
    return userRole === 'tasker' ? <DashboardFreelancerProjects /> : <DashboardProjects />;
  }

  if (activeTab === 'profile') {
    return <DashboardProfile />;
  }

  if (activeTab === 'settings') {
    return <DashboardSettings />;
  }

  const title = TAB_LABELS[activeTab] ?? 'Dashboard';

  return (
    <div className="min-w-0">
      <h1 className="text-2xl font-semibold tracking-tight text-[#222222] sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-500 sm:text-base">
        {title} content will appear here.
      </p>
    </div>
  );
}
