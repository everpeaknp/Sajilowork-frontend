export const SEO_LOCATION_PAGES = [
  {
    slug: 'kathmandu',
    name: 'Kathmandu',
    description:
      'Hire freelancers and book local services in Kathmandu. Find jobs, post tasks, and get work done on Sajilowork.',
  },
  {
    slug: 'pokhara',
    name: 'Pokhara',
    description:
      'Discover taskers, jobs, and services in Pokhara. Connect with trusted freelancers across Nepal on Sajilowork.',
  },
  {
    slug: 'lalitpur',
    name: 'Lalitpur',
    description:
      'Hire skilled taskers and find freelance work in Lalitpur. Post tasks and book services securely on Sajilowork.',
  },
  {
    slug: 'bhaktapur',
    name: 'Bhaktapur',
    description:
      'Browse local services and freelance talent in Bhaktapur. Get tasks done quickly on Sajilowork.',
  },
] as const;

export type SeoLocationSlug = (typeof SEO_LOCATION_PAGES)[number]['slug'];

export function getSeoLocationPage(slug: string) {
  return SEO_LOCATION_PAGES.find((page) => page.slug === slug.toLowerCase());
}
