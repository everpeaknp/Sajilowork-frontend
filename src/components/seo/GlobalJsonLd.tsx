import { fetchSiteSettings } from '@/lib/siteSettings';
import { buildOrganizationSchema, buildSoftwareApplicationSchema, buildWebsiteSchema } from '@/lib/seo/jsonld';
import JsonLd from './JsonLd';

export default async function GlobalJsonLd() {
  const settings = await fetchSiteSettings();
  const schemas = [
    buildOrganizationSchema(settings),
    buildWebsiteSchema(settings),
    buildSoftwareApplicationSchema(settings),
  ];
  return <JsonLd data={schemas} />;
}
