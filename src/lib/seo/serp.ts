/**
 * Central SERP (Search Engine Results Page) copy — titles 50–60 chars with brand,
 * descriptions 140–160 chars, keyword-first, unique per route.
 */

export type SerpPageConfig = {
  /** Primary title segment (brand appended by metadata layer). */
  title: string;
  description: string;
  /** Visible breadcrumb label (last segment). */
  breadcrumb: string;
  h1?: string;
};

/** Max primary title length before brand suffix (` | Sajilowork` ≈ 14 chars). */
const MAX_PRIMARY_TITLE = 46;
const SERP_DESC_MIN = 140;
const SERP_DESC_MAX = 160;

export function optimizeSerpTitle(primary: string, maxLength = MAX_PRIMARY_TITLE): string {
  const cleaned = primary.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Sajilowork';
  if (cleaned.length <= maxLength) return cleaned;
  const slice = cleaned.slice(0, maxLength - 1);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trim()}…`;
}

export function optimizeSerpDescription(
  text: string | null | undefined,
  fallback: string,
): string {
  const value = (text || fallback).replace(/\s+/g, ' ').trim();
  if (value.length >= SERP_DESC_MIN && value.length <= SERP_DESC_MAX) return value;
  if (value.length < SERP_DESC_MIN) return value;
  const slice = value.slice(0, SERP_DESC_MAX - 1);
  const lastSpace = slice.lastIndexOf(' ');
  return `${(lastSpace > SERP_DESC_MIN ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

export function buildDetailSerpTitle(
  name: string,
  context: string,
): string {
  const combined = `${name} — ${context}`;
  return optimizeSerpTitle(combined, 52);
}

export const STATIC_PAGE_SERP = {
  home: {
    title: 'Hire Taskers & Freelancers in Nepal',
    description:
      'Post tasks, hire verified taskers, and find freelance jobs across Nepal. Secure payments, trusted reviews, and local services on Sajilowork.',
    breadcrumb: 'Home',
    h1: 'Hire skilled taskers and get things done',
  },
  discover: {
    title: 'Browse Tasks, Jobs & Services in Nepal',
    description:
      'Explore trending services, categories, and top-rated taskers. Find freelance work or hire help fast across Kathmandu, Pokhara, and Nepal.',
    breadcrumb: 'Discover',
    h1: 'Discover tasks, jobs, and services',
  },
  jobs: {
    title: 'Freelance Jobs in Nepal — Open Roles',
    description:
      'Browse remote, contract, and full-time jobs in Nepal. Apply to freelance gigs and career opportunities posted by verified employers on Sajilowork.',
    breadcrumb: 'Jobs',
    h1: 'Jobs in Nepal',
  },
  tasks: {
    title: 'Post & Browse Local Tasks in Nepal',
    description:
      'Find cleaning, delivery, repairs, moving, and handyman tasks near you. Post a task free and get offers from trusted local taskers in minutes.',
    breadcrumb: 'Tasks',
    h1: 'Tasks near you',
  },
  services: {
    title: 'Book Local Home Services in Nepal',
    description:
      'Hire verified pros for cleaning, plumbing, electrical work, moving, and home maintenance. Compare ratings, prices, and book services securely.',
    breadcrumb: 'Services',
    h1: 'Home and local services',
  },
  projects: {
    title: 'Hire for Projects & Freelance Work',
    description:
      'Discover project-based work in design, development, marketing, and more. Hire specialists or find freelance project opportunities across Nepal.',
    breadcrumb: 'Projects',
    h1: 'Projects',
  },
  freelancers: {
    title: 'Find Freelancers & Taskers in Nepal',
    description:
      'Browse verified freelancers by skill, rating, and location. Hire designers, developers, cleaners, and handymen with secure escrow payments.',
    breadcrumb: 'Freelancers',
    h1: 'Freelancers in Nepal',
  },
  employers: {
    title: 'Top Employers & Companies in Nepal',
    description:
      'Explore companies hiring on Sajilowork. View open jobs, employer ratings, and project briefs from verified businesses across Nepal.',
    breadcrumb: 'Employers',
    h1: 'Employers and companies',
  },
  blog: {
    title: 'Freelance & Task Tips for Nepal',
    description:
      'Expert guides on hiring taskers, pricing services, home maintenance, and growing your freelance career in Nepal. Updated tips from Sajilowork.',
    breadcrumb: 'Blog',
    h1: 'Blog & Tips',
  },
  categories: {
    title: 'Browse Service Categories in Nepal',
    description:
      'Explore categories for cleaning, delivery, handyman, design, development, and more. Find tasks, jobs, and services by skill on Sajilowork.',
    breadcrumb: 'Categories',
    h1: 'Browse categories',
  },
  about: {
    title: 'About Sajilowork — Nepal Task Marketplace',
    description:
      'Sajilowork connects people who need help with skilled taskers and freelancers across Nepal. Learn our mission, team, and how we keep hiring secure.',
    breadcrumb: 'About',
    h1: 'About Us',
  },
  contact: {
    title: 'Contact Sajilowork — Support & Help',
    description:
      'Get in touch with the Sajilowork team for support, partnerships, or press enquiries. We respond to messages from taskers, clients, and businesses in Nepal.',
    breadcrumb: 'Contact',
    h1: 'Contact us',
  },
  faq: {
    title: 'FAQ — Tasks, Jobs, Payments & Safety',
    description:
      'Get answers about posting tasks, hiring freelancers, secure payments, cancellations, and account safety on Sajilowork in Nepal.',
    breadcrumb: 'FAQ',
    h1: 'Frequently asked questions',
  },
  help: {
    title: 'Help Centre — Using Sajilowork',
    description:
      'Step-by-step help for posting tasks, making payments, managing bookings, and resolving issues on Sajilowork. Guides for clients and taskers in Nepal.',
    breadcrumb: 'Help',
    h1: 'Help centre',
  },
  howItWorks: {
    title: 'How Sajilowork Works — Hire in 3 Steps',
    description:
      'Post a task, compare offers from verified taskers, and pay securely when the job is done. See how hiring freelancers and local services works in Nepal.',
    breadcrumb: 'How it works',
    h1: 'How it works',
  },
  terms: {
    title: 'Terms of Service — Sajilowork Nepal',
    description:
      'Read the terms governing use of Sajilowork for posting tasks, hiring freelancers, payments, disputes, and marketplace conduct in Nepal.',
    breadcrumb: 'Terms',
    h1: 'Terms of service',
  },
  privacy: {
    title: 'Privacy Policy — Sajilowork Nepal',
    description:
      'Learn how Sajilowork collects, uses, and protects your personal data when you post tasks, hire freelancers, or use our marketplace in Nepal.',
    breadcrumb: 'Privacy',
    h1: 'Privacy policy',
  },
  trustAndSafety: {
    title: 'Trust & Safety on Sajilowork',
    description:
      'Identity checks, secure escrow payments, reviews, and dispute support help keep hiring safe on Sajilowork. Learn how we protect clients and taskers.',
    breadcrumb: 'Trust & Safety',
    h1: 'Trust and safety',
  },
  cancellationPolicy: {
    title: 'Cancellation Policy — Sajilowork',
    description:
      'Understand cancellation rules for tasks, services, and bookings on Sajilowork. Fair policies for clients and taskers across Nepal.',
    breadcrumb: 'Cancellation',
    h1: 'Cancellation policy',
  },
} as const satisfies Record<string, SerpPageConfig>;

export type StaticSerpPageKey = keyof typeof STATIC_PAGE_SERP;

export function getStaticPageSerp(key: StaticSerpPageKey): SerpPageConfig {
  const page = STATIC_PAGE_SERP[key];
  return {
    ...page,
    title: optimizeSerpTitle(page.title),
    description: optimizeSerpDescription(page.description, page.description),
  };
}
