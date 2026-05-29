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
