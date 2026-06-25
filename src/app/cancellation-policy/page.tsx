import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import CancellationPolicyContent from '@/components/legal/CancellationPolicyContent';

export const metadata = {
  title: 'Cancellation policy',
  description: 'How task cancellations, fees, escrow refunds, and moderation work on sajilowork.',
};

export default function CancellationPolicyPage() {
  return (
    <MarketingPageLayout
      title="Cancellation policy"
      description="Fees, refunds, and rules when a task is cancelled."
      backHref="/help"
      backLabel="Back to help"
    >
      <CancellationPolicyContent />
    </MarketingPageLayout>
  );
}
