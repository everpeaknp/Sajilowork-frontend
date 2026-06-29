import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import HowItWorksContent from '@/components/marketing/HowItWorksContent';

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
