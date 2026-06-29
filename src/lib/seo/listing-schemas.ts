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
        employerName: input.record.owner_business_name || input.record.owner_name,
        employerLogo: input.record.owner_logo_url,
        city: input.record.city,
        state: input.record.state,
        country: input.record.country,
        employmentType: input.record.work_type,
        settings: input.settings,
      }),
    );
  } else if (
    input.type === 'service' ||
    input.type === 'task' ||
    input.type === 'project'
  ) {
    const serviceType =
      input.type === 'task' ? 'Task' : input.type === 'project' ? 'Project' : 'Service';
    schemas.push(
      buildServiceSchema({
        title,
        description,
        path,
        image: input.record.primary_image || input.record.image || input.record.image_url,
        serviceType,
        settings: input.settings,
      }),
    );
  }

  return buildSchemaGraph(schemas);
}
