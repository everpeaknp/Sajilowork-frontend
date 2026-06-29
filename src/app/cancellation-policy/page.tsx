import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import CancellationPolicyContent from '@/components/legal/CancellationPolicyContent';

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
