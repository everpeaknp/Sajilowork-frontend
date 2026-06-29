import CrawlableIndexNav from '@/components/seo/CrawlableIndexNav';
import JsonLd from '@/components/seo/JsonLd';
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
  buildSchemaGraph,
  buildWebPageSchema,
} from '@/lib/seo/jsonld';
import { fetchListingFeedItems, LISTING_FEEDS } from '@/lib/seo/listing-feed';
import { fetchSiteSettings } from '@/lib/siteSettings';

const HOME_TITLE = 'Hire skilled taskers and get things done';
const HOME_DESCRIPTION =
  'Post tasks, hire local taskers, find freelance jobs, and book services across Nepal. Secure payments and trusted marketplace on Sajilowork.';

export default async function HomePageJsonLd() {
  const [settings, jobs, tasks, services] = await Promise.all([
    fetchSiteSettings(),
    fetchListingFeedItems(LISTING_FEEDS.jobs, 6),
    fetchListingFeedItems(LISTING_FEEDS.tasks, 6),
    fetchListingFeedItems(LISTING_FEEDS.services, 6),
  ]);

  const featuredItems = [...jobs, ...tasks, ...services].slice(0, 12);

  const schemas: Array<Record<string, unknown>> = [
    buildBreadcrumbSchema([{ name: 'Home', path: '/' }], settings),
    buildWebPageSchema({
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      path: '/',
      settings,
    }),
  ];

  if (featuredItems.length) {
    schemas.push(
      buildItemListSchema({
        name: 'Featured listings on Sajilowork',
        path: '/',
        items: featuredItems,
        settings,
      }),
    );
  }

  return (
    <>
      <JsonLd data={buildSchemaGraph(schemas)} />
      {featuredItems.length ? (
        <CrawlableIndexNav
          title={HOME_TITLE}
          description={HOME_DESCRIPTION}
          path="/"
          items={featuredItems}
        />
      ) : null}
    </>
  );
}
