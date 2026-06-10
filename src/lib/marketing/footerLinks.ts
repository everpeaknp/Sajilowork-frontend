export type FooterLink = {
  label: string;
  href: string;
};

export type FooterSection = {
  title: string;
  links: FooterLink[];
};

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Discover',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Categories', href: '/categories' },
      { label: 'Employers', href: '/employers' },
      { label: 'Freelancers', href: '/freelancers' },
      { label: 'Jobs', href: '/jobs' },
      { label: 'Projects', href: '/projects' },
      { label: 'Services', href: '/services' },
      { label: 'Trust & Safety', href: '/trust-and-safety' },
    ],
  },
  {
    title: 'Company',
    links: [{ label: 'About Us', href: '/about' }],
  },
  {
    title: 'Help',
    links: [
      { label: 'Help', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Cancellation policy', href: '/cancellation-policy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
];
