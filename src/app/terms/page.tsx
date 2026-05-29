import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import { MarketingProse, MarketingLead } from '@/components/marketing/MarketingProse';
import { TERMS_SECTIONS } from '@/components/marketing/legalContent';

export const metadata = {
  title: 'Terms of Service | tasknepal',
  description: 'Terms and conditions for using the tasknepal marketplace.',
};

export default function TermsPage() {
  return (
    <MarketingPageLayout
      title="Terms of Service"
      description="The agreement between you and tasknepal."
      backHref="/help"
      backLabel="Back to help"
    >
      <MarketingLead>
        These terms govern your use of tasknepal as a poster, Tasker, or visitor. Please read them
        carefully before using the platform.
      </MarketingLead>
      <MarketingProse sections={[...TERMS_SECTIONS]} />
    </MarketingPageLayout>
  );
}
