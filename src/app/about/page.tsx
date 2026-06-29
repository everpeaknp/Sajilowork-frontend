import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import { MarketingProse, MarketingLead } from '@/components/marketing/MarketingProse';
import MarketingCta from '@/components/marketing/MarketingCta';
import { POST_TASK_PATH } from '@/lib/postTaskPath';
import { ABOUT_SECTIONS } from '@/components/marketing/legalContent';

export default function AboutPage() {
  return (
    <MarketingPageLayout
      title="About Us"
      description="Connecting people who need tasks done with those who have the skills to do them."
    >
      <MarketingLead>
        Sajilowork is a local services marketplace built for Nepal — inspired by the simple,
        trusted model used by global platforms.
      </MarketingLead>
      <MarketingProse sections={[...ABOUT_SECTIONS]} />
      <MarketingCta
        primaryHref={POST_TASK_PATH}
        primaryLabel="Post a task"
        secondaryHref="/signup?role=tasker"
        secondaryLabel="Become a Tasker"
      />
    </MarketingPageLayout>
  );
}
