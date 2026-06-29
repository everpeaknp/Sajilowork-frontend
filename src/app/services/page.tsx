import { searchBrowseServices } from '@/lib/listingSearchApi';
import type { Service } from '@/components/services/serviceListData';

import ServicesPageClient from './ServicesPageClient';

export default async function ServicesPage() {
  let initialServices: Service[] = [];
  let initialTotal = 0;

  try {
    const result = await searchBrowseServices({ page: 1, page_size: 6, sort_by: 'newest' });
    initialServices = result.items;
    initialTotal = result.total;
  } catch {
    // Client will retry after hydration.
  }

  return <ServicesPageClient initialServices={initialServices} initialTotal={initialTotal} />;
}

export const revalidate = 300;
