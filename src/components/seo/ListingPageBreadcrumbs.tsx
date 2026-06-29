import SerpBreadcrumbs from '@/components/seo/SerpBreadcrumbs';
import { cn } from '@/lib/utils';

type ListingPageBreadcrumbsProps = {
  sectionLabel: string;
  sectionPath: string;
  className?: string;
};

export default function ListingPageBreadcrumbs({
  sectionLabel,
  sectionPath,
  className,
}: ListingPageBreadcrumbsProps) {
  return (
    <div className={cn('bg-white', className)}>
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
        <SerpBreadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: sectionLabel, href: sectionPath },
          ]}
        />
      </div>
    </div>
  );
}
