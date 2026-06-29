import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import HelpHubContent from '@/components/marketing/HelpHubContent';

export default function HelpPage() {
  return (
    <MarketingPageLayout
      title="Help"
      description="Support, policies, and answers for posters and Taskers."
      contentClassName="max-w-4xl"
    >
      <HelpHubContent />
    </MarketingPageLayout>
  );
}
