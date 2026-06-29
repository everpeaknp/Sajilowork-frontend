import { searchBrowseServices } from '@/lib/listingSearchApi';
import type { Service } from '@/components/services/serviceListData';

import HomeClient from '@/components/home/HomeClient';

export default async function HomePage() {
  let popularServices: Service[] = [];
  let trendingServices: Service[] = [];

  try {
    const [popular, trending] = await Promise.all([
      searchBrowseServices({ page: 1, page_size: 12, sort_by: 'newest' }),
      searchBrowseServices({ page: 1, page_size: 12, sort_by: 'budget_high' }),
    ]);
    popularServices = popular.items;
    trendingServices = trending.items;
  } catch {
    // Client sections will retry after hydration.
  }

  return (
    <HomeClient popularServices={popularServices} trendingServices={trendingServices} />
  );
}

export const revalidate = 300;
