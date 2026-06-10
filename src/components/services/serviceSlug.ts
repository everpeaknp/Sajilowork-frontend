import { FREELANCERS_DATA } from '@/components/freelancers/freelancerData';
import { getFreelancerProfilePath } from '@/components/freelancers/freelancerSlug';
import { ALL_SERVICES, type Service } from './serviceListData';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** URL slug from service title + id, e.g. `i-will-design-website-ui-ux-in-adobe-xd-or-figma-av-1` */
export function getServiceSlug(service: Service): string {
  const suffix = service.id.replace(/^av-/, '');
  return `${slugify(service.title)}-${suffix}`;
}

export function findServiceBySlug(
  slug: string,
  services: Service[] = ALL_SERVICES,
): Service | undefined {
  const normalized = slug.trim().toLowerCase();
  return services.find((service) => getServiceSlug(service).toLowerCase() === normalized);
}

export function getServiceDetailPath(service: Service): string {
  return `/services/${getServiceSlug(service)}`;
}

export function getServiceAuthorProfilePath(service: Service): string {
  const byName = FREELANCERS_DATA.find(
    (freelancer) => freelancer.name.toLowerCase() === service.author.name.toLowerCase(),
  );
  if (byName) return getFreelancerProfilePath(byName);

  const index = parseInt(service.id.replace(/^av-/, ''), 10);
  const fallbackIndex = Number.isFinite(index) ? (index - 1) % FREELANCERS_DATA.length : 0;
  return getFreelancerProfilePath(FREELANCERS_DATA[fallbackIndex]);
}
