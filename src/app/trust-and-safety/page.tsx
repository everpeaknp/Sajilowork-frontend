import Link from 'next/link';
import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import { MarketingProse, MarketingLead } from '@/components/marketing/MarketingProse';
import MarketingCta from '@/components/marketing/MarketingCta';
import { POST_TASK_PATH } from '@/lib/postTaskPath';
import { TRUST_SAFETY_SECTIONS } from '@/components/marketing/legalContent';

export const metadata = {
  title: 'Trust & Safety',
  description: 'Secure payments, verified profiles, and safety features for posters and Taskers.',
};

export default function TrustAndSafetyPage() {
  return (
    <MarketingPageLayout
      title="Trust & Safety"
      description="Features designed to protect posters and Taskers on every job."
    >
      <MarketingLead>
        Your safety matters. tasknepal uses secure payments, community reviews, and platform
        policies so you can hire and work with more confidence.
      </MarketingLead>
      <MarketingProse sections={[...TRUST_SAFETY_SECTIONS]} />
      <p className="mt-8 text-sm text-[#6a719a]">
        Read our{' '}
        <Link href="/cancellation-policy" className="font-semibold text-brand-emerald hover:underline">
          cancellation policy
        </Link>{' '}
        for refunds and dispute guidance.
      </p>
      <MarketingCta
        primaryHref={POST_TASK_PATH}
        primaryLabel="Post your task for free"
        secondaryHref="/help"
        secondaryLabel="Visit help centre"
      />
    </MarketingPageLayout>
  );
}
