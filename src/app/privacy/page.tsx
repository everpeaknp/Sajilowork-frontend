import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import { MarketingProse, MarketingLead } from '@/components/marketing/MarketingProse';
import { PRIVACY_SECTIONS } from '@/components/marketing/legalContent';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How tasknepal collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <MarketingPageLayout
      title="Privacy Policy"
      description="How we handle your personal information."
      backHref="/help"
      backLabel="Back to help"
    >
      <MarketingLead>
        This policy describes what information we collect when you use tasknepal, why we collect
        it, and the choices you have.
      </MarketingLead>
      <MarketingProse sections={[...PRIVACY_SECTIONS]} />
    </MarketingPageLayout>
  );
}
