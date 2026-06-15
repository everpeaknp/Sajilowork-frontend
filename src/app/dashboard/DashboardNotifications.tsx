'use client';

import Notifications from '@/components/tasker-dashboard/Notifications';
import { DASHBOARD_PAGE_ROOT } from './dashboardResponsive';

export default function DashboardNotifications() {
  return (
    <div className={DASHBOARD_PAGE_ROOT}>
      <Notifications />
    </div>
  );
}
