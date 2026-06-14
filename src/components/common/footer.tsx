'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
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

function FooterLinkList({ sectionTitle }: { sectionTitle: string }) {
  const section = FOOTER_SECTIONS.find((item) => item.title === sectionTitle);
  if (!section) return null;

  return (
    <ul className="space-y-1 sm:space-y-2.5 md:space-y-4">
      {section.links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="inline-flex min-h-10 w-full items-center py-1.5 text-sm text-white transition-colors hover:text-white/80 sm:min-h-0 sm:w-auto sm:py-0.5 sm:text-[15px]"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

type FooterProps = {
  outerClassName?: string;
};

export default function Footer({ outerClassName = 'bg-white' }: FooterProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Discover: true,
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <footer className={cn('min-w-0 overflow-x-clip px-2 pt-3 sm:px-4 sm:pt-4', outerClassName)}>
      <div className="overflow-hidden rounded-t-[1.25rem] bg-brand-dark text-white sm:rounded-t-[2.5rem] md:rounded-t-[3.5rem]">
        <div className="mx-auto max-w-7xl px-4 py-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-14 md:py-16 lg:px-8 lg:py-20">
          <div className="mb-8 grid gap-8 sm:mb-14 sm:gap-12 lg:mb-20 lg:grid-cols-5 lg:gap-16">
            <div className="min-w-0 lg:col-span-2">
              <Link href="/" className="mb-4 flex items-center gap-2 sm:mb-6 lg:mb-8">
                <div
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 sm:h-10 sm:w-10"
                >
                  <span className="font-['Outfit'] text-lg font-extrabold tracking-tighter text-white sm:text-xl">
                    t
                  </span>
                </div>
                <span className="font-['Outfit'] text-xl font-extrabold tracking-tighter sm:text-2xl">
                  tasknepal
                </span>
              </Link>
              <p className="max-w-sm text-sm leading-relaxed text-white/90 sm:text-base">
                Connecting people who need tasks done with those who have the skills to do them.
                Trusted by millions worldwide.
              </p>
            </div>

            {/* Mobile: collapsible sections */}
            <div className="space-y-2 sm:hidden">
              {FOOTER_SECTIONS.map((section) => {
                const isOpen = openSections[section.title] ?? false;
                return (
                  <div
                    key={section.title}
                    className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title)}
                      className="flex min-h-11 w-full items-center justify-between px-4 py-3 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm font-semibold text-white">{section.title}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 text-white/70 transition-transform duration-200',
                          isOpen && 'rotate-180',
                        )}
                      />
                    </button>
                    {isOpen ? (
                      <div className="border-t border-white/10 px-4 pb-3 pt-1">
                        <FooterLinkList sectionTitle={section.title} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Tablet+ */}
            <div className="hidden min-w-0 grid-cols-2 gap-x-6 gap-y-8 sm:grid sm:gap-x-8 sm:gap-y-10 lg:col-span-3 lg:grid-cols-3">
              {FOOTER_SECTIONS.map((section) => (
                <div key={section.title} className="min-w-0">
                  <h4 className="mb-3 text-sm font-semibold text-white sm:mb-4 sm:text-base md:mb-6 md:text-lg">
                    {section.title}
                  </h4>
                  <FooterLinkList sectionTitle={section.title} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 border-t border-white/10 pt-6 sm:flex-row sm:justify-between sm:gap-8 sm:pt-10">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3">
              {SOCIAL_LINKS.map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 hover:text-white/80 active:bg-white/15 sm:h-10 sm:w-10"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="w-full text-center text-xs leading-relaxed text-white/80 sm:w-auto sm:text-right sm:text-sm">
              © {new Date().getFullYear()} tasknepal Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
