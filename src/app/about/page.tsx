import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import { MarketingProse, MarketingLead } from '@/components/marketing/MarketingProse';
import MarketingCta from '@/components/marketing/MarketingCta';
import { ABOUT_SECTIONS } from '@/components/marketing/legalContent';

export const metadata = {
  title: 'About Us | tasknepal',
  description: 'Learn about tasknepal — Nepal’s marketplace to get anything done.',
};

export default function AboutPage() {
  return (
    <MarketingPageLayout
      title="About Us"
      description="Connecting people who need tasks done with those who have the skills to do them."
    >
      <MarketingLead>
        tasknepal is a local services marketplace built for Nepal — inspired by the simple,
        trusted model used by global platforms like Airtasker.
      </MarketingLead>
      <MarketingProse sections={[...ABOUT_SECTIONS]} />
      <MarketingCta
        primaryHref="/post-task"
        primaryLabel="Post a task"
        secondaryHref="/signup?role=tasker"
        secondaryLabel="Become a Tasker"
      />
    </MarketingPageLayout>
  );
}
