import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import HelpHubContent from '@/components/marketing/HelpHubContent';

export const metadata = {
  title: 'Help',
  description: 'Help centre — FAQ, contact, policies, and safety information.',
};

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
