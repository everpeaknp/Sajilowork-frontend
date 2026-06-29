import { fetchPublicServices } from '@/lib/serviceApi';
import type { Service } from '@/components/services/serviceListData';

import HomeClient from '@/components/home/HomeClient';

export default async function HomePage() {
  let popularServices: Service[] = [];
  let trendingServices: Service[] = [];

  try {
    const [popular, trending] = await Promise.all([
      fetchPublicServices({ ordering: '-bids_count', page_size: 12 }),
      fetchPublicServices({ ordering: '-views_count', page_size: 12 }),
    ]);
    popularServices = popular;
    trendingServices = trending;
  } catch {
    // Client sections will retry after hydration.
  }

  return (
    <HomeClient popularServices={popularServices} trendingServices={trendingServices} />
  );
}

export const revalidate = 300;
