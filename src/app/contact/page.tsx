import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import ContactContent from '@/components/marketing/ContactContent';

export const metadata = {
  title: 'Contact Us | tasknepal',
  description: 'Contact tasknepal support for help with tasks, payments, and your account.',
};

export default function ContactPage() {
  return (
    <MarketingPageLayout
      title="Contact Us"
      description="We are here to help with your account, tasks, and payments."
      backHref="/help"
      backLabel="Back to help"
    >
      <ContactContent />
    </MarketingPageLayout>
  );
}
