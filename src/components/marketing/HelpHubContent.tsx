import Link from 'next/link';
import {
  ChevronRight,
  HelpCircle,
  Mail,
  FileText,
  Shield,
  MessageCircleQuestion,
  type LucideIcon,
} from 'lucide-react';

export type HelpLinkItem = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const HELP_LINKS: HelpLinkItem[] = [
  {
    href: '/help',
    title: 'Help Center',
    description: 'Guides, policies, and answers for employers and freelancers.',
    icon: HelpCircle,
  },
  {
    href: '/faq',
    title: 'FAQ',
    description: 'Answers to common questions about posting tasks, payments, and accounts.',
    icon: MessageCircleQuestion,
  },
  {
    href: '/contact',
    title: 'Contact Us',
    description: 'Get in touch with our support team for help with your account or a task.',
    icon: Mail,
  },
  {
    href: '/trust-and-safety',
    title: 'Trust & Safety',
    description: 'Learn how we protect payments, verify users, and keep the community safe.',
    icon: Shield,
  },
  {
    href: '/cancellation-policy',
    title: 'Cancellation policy',
    description: 'Fees, refunds, and rules when a task is cancelled.',
    icon: FileText,
  },
  {
    href: '/terms',
    title: 'Terms of Service',
    description: 'The agreement between you and Sajilowork when using the platform.',
    icon: FileText,
  },
  {
    href: '/privacy',
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
    icon: Shield,
  },
];

export default function HelpHubContent() {
  return (
    <div className="min-w-0">
      <p className="mb-8 flex items-start gap-3 rounded-2xl border border-brand-emerald/20 bg-brand-light-bg p-4 text-sm text-[#384179] dark:border-brand-emerald/30 dark:bg-neutral-900 dark:text-neutral-300 sm:mb-10 sm:p-5 sm:text-base">
        <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-emerald" aria-hidden />
        Find guides and policies for posters and Taskers. For urgent payment issues, include your task
        ID when you contact us.
      </p>

      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {HELP_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex h-full min-h-[5.5rem] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-brand-emerald/30 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-emerald/40 dark:hover:shadow-none"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light-bg text-brand-emerald dark:bg-neutral-800">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <ChevronRight
                      className="h-4 w-4 text-gray-300 transition group-hover:text-brand-emerald dark:text-neutral-600"
                      aria-hidden
                    />
                  </div>
                  <h2 className="text-base font-bold text-brand-dark dark:text-stone-100">{item.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#6a719a] dark:text-neutral-400">
                    {item.description}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
