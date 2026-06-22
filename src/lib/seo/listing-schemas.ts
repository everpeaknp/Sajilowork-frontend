import type { SiteSettings } from '@/lib/siteSettings';

import type { ListingSeoRecord } from './api';
import {
  buildBreadcrumbSchema,
  buildJobPostingSchema,
  buildSchemaGraph,
  buildServiceSchema,
  buildWebPageSchema,
} from './jsonld';
import { truncateDescription } from './constants';

type ListingSchemaType = 'job' | 'service' | 'task' | 'project';

const BREADCRUMB_ROOT: Record<ListingSchemaType, { name: string; path: string }> = {
  job: { name: 'Jobs', path: '/jobs' },
  service: { name: 'Services', path: '/services' },
  task: { name: 'Tasks', path: '/task' },
  project: { name: 'Projects', path: '/projects' },
};

export function buildListingDetailSchemaGraph(input: {
  type: ListingSchemaType;
  slug: string;
  record: ListingSeoRecord;
  settings: SiteSettings;
}) {
  const root = BREADCRUMB_ROOT[input.type];
  const path = `${root.path}/${input.slug}`;
  const title = input.record.title?.trim();
  if (!title) return null;

  const description = truncateDescription(
    input.record.description || input.record.excerpt,
    5000,
  );

  const breadcrumbs = buildBreadcrumbSchema(
    [
      { name: 'Home', path: '/' },
      root,
      { name: title, path },
    ],
    input.settings,
  );

  const webPage = buildWebPageSchema({
    title,
    description,
    path,
    settings: input.settings,
  });

  const schemas: Array<Record<string, unknown>> = [breadcrumbs, webPage];

  if (input.type === 'job') {
    schemas.push(
      buildJobPostingSchema({
        title,
        description,
        path,
        datePosted: input.record.published_at || input.record.created_at,
        settings: input.settings,
      }),
    );
  } else if (input.type === 'service') {
    schemas.push(
      buildServiceSchema({
        title,
        description,
        path,
        image: input.record.primary_image || input.record.image || input.record.image_url,
        settings: input.settings,
      }),
    );
  }

  return buildSchemaGraph(schemas);
}
