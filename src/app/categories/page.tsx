import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import CategoriesPageContent from '@/components/marketing/CategoriesPageContent';

export const metadata = {
  title: 'Categories | tasknepal',
  description: 'Browse task categories and post work in cleaning, delivery, handyman, and more.',
};

export default function CategoriesPage() {
  return (
    <MarketingPageLayout
      title="Categories"
      description="See popular services you can book on tasknepal."
      contentClassName="max-w-5xl"
    >
      <CategoriesPageContent />
    </MarketingPageLayout>
  );
}
