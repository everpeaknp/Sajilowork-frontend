'use client';

import type { ReactNode } from 'react';

type PublicProfileSectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function PublicProfileSection({
  id,
  eyebrow,
  title,
  description,
  action,
  children,
  className = '',
}: PublicProfileSectionProps) {
  return (
    <section
      id={id}
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-1 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-emerald">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-xl font-bold tracking-tight text-brand-dark sm:text-2xl">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 pt-2 sm:pt-0">{action}</div> : null}
      </div>
      <div className="px-6 py-6 sm:px-8">{children}</div>
    </section>
  );
}
