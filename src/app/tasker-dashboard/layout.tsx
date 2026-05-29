import DashboardLayout from '@/components/tasker-dashboard/DashboardLayout';

export default function TaskerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
