'use client';

import DashboardOverview from './DashboardOverview';
import DashboardProposals from './DashboardProposals';
import DashboardSaved from './DashboardSaved';
import DashboardMessages from './DashboardMessages';
import DashboardReviews from './DashboardReviews';
import DashboardInvoice from './DashboardInvoice';
import DashboardPayouts from './DashboardPayouts';
import DashboardStatements from './DashboardStatements';
import DashboardServices from './DashboardServices';
import DashboardJobs from './DashboardJobs';
import DashboardProjects from './DashboardProjects';
import DashboardProfile from './DashboardProfile';
import { useDashboardTab } from './DashboardTabContext';

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  proposals: 'My Proposals',
  saved: 'Saved',
  message: 'Message',
  reviews: 'Reviews',
  invoice: 'Invoice',
  payouts: 'Payouts',
  statements: 'Statements',
  services: 'Manage Services',
  jobs: 'Manage Jobs',
  project: 'Manage Project',
  profile: 'My Profile',
};

export default function DashboardPage() {
  const { activeTab, setActiveTab } = useDashboardTab();

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

  if (activeTab === 'invoice') {
    return <DashboardInvoice />;
  }

  if (activeTab === 'payouts') {
    return <DashboardPayouts />;
  }

  if (activeTab === 'statements') {
    return <DashboardStatements />;
  }

  if (activeTab === 'services') {
    return <DashboardServices />;
  }

  if (activeTab === 'jobs') {
    return <DashboardJobs />;
  }

  if (activeTab === 'project') {
    return <DashboardProjects />;
  }

  if (activeTab === 'profile') {
    return <DashboardProfile />;
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