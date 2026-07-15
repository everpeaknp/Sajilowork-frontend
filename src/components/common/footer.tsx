'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import SiteBrand from '@/components/common/SiteBrand';
import { useSiteSettings } from '@/providers';
import { FOOTER_SECTIONS } from '@/lib/marketing/footerLinks';
import { cn } from '@/lib/utils';

const SOCIAL_LINKS = [
  { label: 'Facebook', Icon: FacebookIcon },
  { label: 'X (Twitter)', Icon: TwitterIcon },
  { label: 'Instagram', Icon: InstagramIcon },
  { label: 'LinkedIn', Icon: LinkedinIcon },
] as const;

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

type FooterProps = {
  outerClassName?: string;
};

export default function Footer({ outerClassName = 'bg-white dark:bg-neutral-950' }: FooterProps) {
  const { display_name: displayName, logo_url: logoUrl } = useSiteSettings();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Discover: true,
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <footer
      className={cn(
        'min-w-0 overflow-x-clip border-t border-neutral-200 dark:border-neutral-800',
        outerClassName,
      )}
    >
      <div className="bg-white text-brand-dark dark:bg-neutral-950 dark:text-stone-100">
        <div className="mx-auto max-w-7xl px-4 py-12 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-16 md:py-20 lg:px-8">
          <div className="mb-12 grid gap-10 sm:mb-16 sm:gap-12 lg:mb-20 lg:grid-cols-5 lg:gap-16">
            <div className="min-w-0 lg:col-span-2">
              <SiteBrand
                displayName={displayName}
                logoUrl={logoUrl}
                href="/"
                size="footer"
                className="mb-6 lg:mb-8"
              />
              <p className="max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base">
                Connecting people who need tasks done with those who have the skills to do them.
                Nepal&apos;s marketplace for hiring taskers and finding freelance work.
              </p>
            </div>

            {/* Mobile: collapsible sections */}
            <div className="space-y-3 sm:hidden">
              {FOOTER_SECTIONS.map((section) => {
                const isOpen = openSections[section.title] ?? false;
                return (
                  <div
                    key={section.title}
                    className="overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title)}
                      className="flex min-h-12 w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-neutral-100/50 dark:hover:bg-neutral-800/60"
                      aria-expanded={isOpen}
                    >
                      <span className="text-[15px] font-semibold text-brand-dark dark:text-stone-100">
                        {section.title}
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 dark:text-neutral-500',
                          isOpen && 'rotate-180 text-brand-emerald dark:text-brand-emerald',
                        )}
                      />
                    </button>
                    {isOpen ? (
                      <div className="border-t border-neutral-100 px-5 pb-4 pt-2 dark:border-neutral-800">
                        <ul className="space-y-2">
                          {section.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="inline-flex min-h-10 w-full items-center text-[15px] text-neutral-500 transition-colors hover:text-brand-emerald dark:text-neutral-400 dark:hover:text-brand-emerald"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Tablet+ */}
            <div className="hidden min-w-0 grid-cols-2 gap-x-6 gap-y-10 sm:grid sm:gap-x-8 sm:gap-y-12 lg:col-span-3 lg:grid-cols-3">
              {FOOTER_SECTIONS.map((section) => (
                <div key={section.title} className="min-w-0">
                  <h4 className="mb-5 text-sm font-bold text-brand-dark dark:text-stone-100 sm:text-base md:mb-6">
                    {section.title}
                  </h4>
                  <ul className="space-y-3 md:space-y-4">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="inline-flex items-center text-[15px] text-neutral-500 transition-colors hover:text-brand-emerald dark:text-neutral-400 dark:hover:text-brand-emerald"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 border-t border-neutral-200 pt-8 dark:border-neutral-800 sm:flex-row sm:justify-between sm:gap-8 sm:pt-10">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
              <div className="flex items-center gap-3.5 rounded-full bg-neutral-50 px-5 py-2.5 ring-1 ring-neutral-200/60 dark:bg-neutral-900 dark:ring-neutral-700">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Powered by
                </span>
                <img
                  src="/Everacy_logo_bg.jpeg"
                  alt="Everacy Tech Logo"
                  className="h-8 w-auto rounded-md object-cover transition-transform hover:scale-105"
                />
              </div>
              <div className="hidden h-6 w-px bg-neutral-200 dark:bg-neutral-700 sm:block" />
              <div className="flex flex-wrap items-center justify-center gap-2">
                {SOCIAL_LINKS.map(({ label, Icon }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-50 text-neutral-500 ring-1 ring-neutral-200/60 transition-all hover:bg-brand-emerald hover:text-white hover:ring-transparent active:scale-95 dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700 dark:hover:bg-brand-emerald dark:hover:text-white"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
            </div>

            <p className="w-full text-center text-[13px] leading-relaxed text-neutral-400 dark:text-neutral-500 sm:w-auto sm:text-right">
              © {new Date().getFullYear()} {displayName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
