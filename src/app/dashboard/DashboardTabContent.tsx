'use client';

import DashboardOverview from './DashboardOverview';
import DashboardProposals from './DashboardProposals';
import DashboardSaved from './DashboardSaved';
import DashboardMessages from './DashboardMessages';
import DashboardReviews from './DashboardReviews';
import DashboardStatements from './DashboardStatements';
import DashboardWallet from './DashboardWallet';
import DashboardServices from './DashboardServices';
import DashboardJobs from './DashboardJobs';
import DashboardProjects from './DashboardProjects';
import DashboardFreelancerProjects from './DashboardFreelancerProjects';
import DashboardProfile from './DashboardProfile';
import DashboardSettings from './DashboardSettings';
import { useDashboardTab } from './DashboardTabContext';
import { useAuthStore } from '@/store';

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  proposals: 'My Proposals',
  saved: 'Saved',
  message: 'Message',
  reviews: 'Reviews',
  statements: 'Statements',
  wallet: 'Wallet',
  services: 'Manage Services',
  jobs: 'Manage Jobs',
  project: 'Manage Project',
  profile: 'My Profile',
  settings: 'Settings',
};

export default function DashboardTabContent() {
  const { activeTab, setActiveTab } = useDashboardTab();
  const userRole = useAuthStore((s) => s.user?.role);

  if (activeTab === 'dashboard') {
    return <DashboardOverview onTabChange={setActiveTab} />;
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

  if (activeTab === 'statements') {
    return <DashboardStatements />;
  }

  if (activeTab === 'wallet') {
    return <DashboardWallet />;
  }

  if (activeTab === 'services') {
    return <DashboardServices />;
  }

  if (activeTab === 'jobs') {
    return <DashboardJobs />;
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
