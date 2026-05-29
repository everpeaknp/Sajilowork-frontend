import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import FaqContent from '@/components/marketing/FaqContent';

export const metadata = {
  title: 'FAQ | tasknepal',
  description: 'Frequently asked questions about posting tasks, payments, and using tasknepal.',
};

export default function FaqPage() {
  return (
    <MarketingPageLayout
      title="FAQ"
      description="Common questions from posters and Taskers."
      backHref="/help"
      backLabel="Back to help"
    >
      <FaqContent />
    </MarketingPageLayout>
  );
}
