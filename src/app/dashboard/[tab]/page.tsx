'use client';

import { useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import DashboardTabContent from '../DashboardTabContent';
import { isDashboardTab } from '../dashboardTabs';

const WALLET_SECTION_REDIRECTS: Record<string, string> = {
  payouts: 'payouts',
  recharges: 'recharges',
};

const LEGACY_TAB_REDIRECTS: Record<string, string> = {
  invoice: '/dashboard/statements',
};

export default function DashboardTabPage() {
  const params = useParams();
  const router = useRouter();
  const tab = typeof params.tab === 'string' ? params.tab : '';

  const walletSection = WALLET_SECTION_REDIRECTS[tab];
  const legacyRedirect = LEGACY_TAB_REDIRECTS[tab];

  useEffect(() => {
    if (walletSection) {
      router.replace(`/dashboard/wallet?section=${walletSection}`);
      return;
    }
    if (legacyRedirect) {
      router.replace(legacyRedirect);
    }
  }, [walletSection, legacyRedirect, router]);

  if (walletSection || legacyRedirect) {
    return null;
  }

  if (!isDashboardTab(tab) || tab === 'dashboard') {
    notFound();
  }

  return <DashboardTabContent />;
}
