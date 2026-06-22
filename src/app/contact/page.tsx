import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import ContactContent from '@/components/marketing/ContactContent';
import FaqContent from '@/components/marketing/FaqContent';

export const metadata = {
  title: 'Contact Us',
  description:
    'Contact Sajilowork support for help with tasks, payments, account access, and marketplace safety.',
};

export default function ContactPage() {
  return (
    <MarketingPageLayout
      title="Contact Us"
      description="We are here to help with your account, tasks, and payments."
      backHref=""
      hideHero
      contentClassName="w-full max-w-none px-0 py-0"
    >
      <h1 className="sr-only">Contact Us</h1>
      <ContactContent />
      <section className="mx-auto mt-16 max-w-6xl border-t border-neutral-100 px-4 pt-12 sm:mt-20 sm:px-6 sm:pt-14">
        <h2 className="mb-6 text-2xl font-normal tracking-tight text-black sm:mb-8 sm:text-3xl">
          Frequently asked questions
        </h2>
        <FaqContent sharpBlack />
      </section>
    </MarketingPageLayout>
  );
}
