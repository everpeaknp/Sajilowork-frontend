import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import HowItWorksContent from '@/components/marketing/HowItWorksContent';

export const metadata = {
  title: 'How it works | tasknepal',
  description: 'Learn how to post a task, receive offers, and get work done on tasknepal.',
};

export default function HowItWorksPage() {
  return (
    <MarketingPageLayout
      title="How it works"
      description="Post any task. Pick the best person. Get it done."
    >
      <HowItWorksContent />
    </MarketingPageLayout>
  );
}
