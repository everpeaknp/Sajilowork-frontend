import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import CategoriesPageContent from '@/components/marketing/CategoriesPageContent';

export default function CategoriesPage() {
  return (
    <MarketingPageLayout
      title="Categories"
      description="See popular services you can book on Sajilowork."
      contentClassName="max-w-5xl"
    >
      <CategoriesPageContent />
    </MarketingPageLayout>
  );
}
