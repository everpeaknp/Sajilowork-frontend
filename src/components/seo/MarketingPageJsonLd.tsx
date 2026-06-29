import JsonLd from '@/components/seo/JsonLd';
import {
  buildBreadcrumbSchema,
  buildSchemaGraph,
  buildWebPageSchema,
} from '@/lib/seo/jsonld';
import { fetchSiteSettings } from '@/lib/siteSettings';

type MarketingPageJsonLdProps = {
  title: string;
  description?: string;
  path: string;
};

export default async function MarketingPageJsonLd({
  title,
  description,
  path,
}: MarketingPageJsonLdProps) {
  const settings = await fetchSiteSettings();
  const schema = buildSchemaGraph([
    buildBreadcrumbSchema(
      [
        { name: 'Home', path: '/' },
        { name: title, path },
      ],
      settings,
    ),
    buildWebPageSchema({ title, description, path, settings }),
  ]);

  return <JsonLd data={schema} />;
}
