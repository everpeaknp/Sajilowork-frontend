import CrawlableIndexNav from '@/components/seo/CrawlableIndexNav';
import JsonLd from '@/components/seo/JsonLd';
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildItemListSchema,
  buildSchemaGraph,
  buildWebPageSchema,
} from '@/lib/seo/jsonld';
import {
  fetchListingFeedItems,
  type ListingFeedConfig,
} from '@/lib/seo/listing-feed';
import { fetchSiteSettings } from '@/lib/siteSettings';

type ListingIndexJsonLdProps = {
  title: string;
  description?: string;
  path: string;
  breadcrumbLabel: string;
  feed?: ListingFeedConfig;
};

export default async function ListingIndexJsonLd({
  title,
  description,
  path,
  breadcrumbLabel,
  feed,
}: ListingIndexJsonLdProps) {
  const [settings, items] = await Promise.all([
    fetchSiteSettings(),
    feed ? fetchListingFeedItems(feed, 12) : Promise.resolve([]),
  ]);

  const schemas: Array<Record<string, unknown>> = [
    buildBreadcrumbSchema(
      [
        { name: 'Home', path: '/' },
        { name: breadcrumbLabel, path },
      ],
      settings,
    ),
    buildWebPageSchema({ title, description, path, settings }),
    buildCollectionPageSchema({ name: title, description, path, settings }),
  ];

  if (items.length) {
    schemas.push(
      buildItemListSchema({
        name: title,
        path,
        items,
        settings,
      }),
    );
  }

  return (
    <>
      <JsonLd data={buildSchemaGraph(schemas)} />
      {items.length ? (
        <CrawlableIndexNav
          title={title}
          description={description}
          path={path}
          items={items}
        />
      ) : null}
    </>
  );
}
