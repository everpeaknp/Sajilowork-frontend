'use client';

import type { ReactNode } from 'react';
import { ChevronDown, FileText, type LucideIcon } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-200/80',
  accepted: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
  rejected: 'bg-red-50 text-red-700 ring-red-200/80',
  withdrawn: 'bg-neutral-100 text-neutral-600 ring-neutral-200/80',
};

type ProposalDetailPanelProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
};

export function ProposalDetailPanel({
  title,
  description,
  icon: Icon,
  children,
  className = '',
}: ProposalDetailPanelProps) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="border-b border-neutral-100 bg-gradient-to-r from-[#f8faf9] via-white to-white px-6 py-5 sm:px-8">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF6F0] text-[#2d6b4f] ring-1 ring-[#52C47F]/15">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#52C47F]">
              Review
            </p>
            <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="px-6 py-6 sm:px-8 sm:py-7">{children}</div>
    </section>
  );
}

type ProposalCollapsiblePanelProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
  trailing?: ReactNode;
};

export function ProposalCollapsiblePanel({
  title,
  description,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  className = '',
  trailing,
}: ProposalCollapsiblePanelProps) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] ${className}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-4 border-b border-neutral-100 bg-gradient-to-r from-[#f8faf9] via-white to-white px-6 py-5 text-left transition-colors hover:bg-neutral-50/80 sm:px-8"
      >
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors ${
                isOpen
                  ? 'bg-[#52C47F] text-white ring-[#52C47F]/20'
                  : 'bg-[#EAF6F0] text-[#2d6b4f] ring-[#52C47F]/15'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#52C47F]">
              Profile
            </p>
            <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 pt-1">
          {trailing}
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-600">
            {isOpen ? 'Hide' : 'Show'}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </span>
        </div>
      </button>
      {isOpen ? (
        <div className="px-6 py-6 sm:px-8 sm:py-7">{children}</div>
      ) : null}
    </section>
  );
}

export function ProposalStatusPill({ status }: { status: string }) {
  const normalized = status.trim().toLowerCase();
  const style =
    STATUS_STYLES[normalized] ?? 'bg-neutral-100 text-neutral-700 ring-neutral-200/80';

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${style}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

type ProposalMetaCardProps = {
  label: string;
  value: string;
  mono?: boolean;
  title?: string;
  highlight?: boolean;
};

export function ProposalMetaCard({
  label,
  value,
  mono = false,
  title,
  highlight = false,
}: ProposalMetaCardProps) {
  if (!value.trim() || value === '—') return null;

  return (
    <div
      className={`rounded-xl border px-4 py-3.5 ${
        highlight
          ? 'border-[#52C47F]/25 bg-[#f4fbf7]'
          : 'border-neutral-100 bg-neutral-50/60'
      }`}
    >
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
        {label}
      </dt>
      <dd
        className={`mt-1.5 min-w-0 break-words text-sm font-medium text-neutral-900 [overflow-wrap:anywhere] ${
          mono ? 'font-mono text-[13px] tracking-wide text-neutral-800' : ''
        }`}
        title={title}
      >
        {value}
      </dd>
    </div>
  );
}

export function ProposalMetaGrid({ children }: { children: ReactNode }) {
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</dl>
  );
}

type ProposalSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function ProposalSection({
  title,
  description,
  children,
  className = '',
}: ProposalSectionProps) {
  return (
    <div className={`mt-8 first:mt-0 ${className}`}>
      <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-neutral-100 pb-3">
        <div>
          <h4 className="text-sm font-semibold tracking-tight text-neutral-900">{title}</h4>
          {description ? (
            <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}

export function ProposalProse({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 px-4 py-4 sm:px-5 sm:py-5">
      <div className="whitespace-pre-wrap break-words text-sm leading-[1.7] text-neutral-700 [overflow-wrap:anywhere]">
        {children}
      </div>
    </div>
  );
}

type ProposalHighlightStatProps = {
  label: string;
  value: string;
};

export function ProposalHighlightStat({ label, value }: ProposalHighlightStatProps) {
  return (
    <div className="rounded-xl border border-[#52C47F]/20 bg-gradient-to-br from-[#f4fbf7] to-white px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3d8f63]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">{value}</p>
    </div>
  );
}

type ProposalProfileHeroProps = {
  avatar?: string;
  name: string;
  subtitle?: string;
};

export function ProposalProfileHero({ avatar, name, subtitle }: ProposalProfileHeroProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-white shadow-md shadow-neutral-200/60"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 text-lg font-semibold text-neutral-500 ring-2 ring-white"
          aria-hidden
        >
          {name.trim().charAt(0).toUpperCase() || '?'}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
          {name.trim() || 'Applicant'}
        </p>
        {subtitle ? (
          <p className="mt-1 text-sm leading-relaxed text-neutral-500">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

type ProposalContactItemProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function ProposalContactGrid({ children }: { children: ReactNode }) {
  return <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">{children}</div>;
}

export function ProposalContactItem({ icon: Icon, label, value }: ProposalContactItemProps) {
  if (!value.trim()) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3.5 shadow-sm shadow-neutral-100/80">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium text-neutral-800 [overflow-wrap:anywhere]">
          {value}
        </p>
      </div>
    </div>
  );
}

type ProposalTimelineItemProps = {
  title: string;
  subtitle: string;
  period?: string;
  description?: string;
};

export function ProposalTimelineList({ children }: { children: ReactNode }) {
  return <ul className="space-y-0">{children}</ul>;
}

export function ProposalTimelineItem({
  title,
  subtitle,
  period,
  description,
}: ProposalTimelineItemProps) {
  return (
    <li className="relative border-l-2 border-[#52C47F]/25 py-4 pl-5 first:pt-1 last:pb-0">
      <span className="absolute -left-[5px] top-[1.125rem] h-2 w-2 rounded-full bg-[#52C47F] ring-2 ring-white" />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-neutral-900">{title}</p>
        {period ? (
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            {period}
          </p>
        ) : null}
      </div>
      <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>
      {description ? (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 [overflow-wrap:anywhere]">
          {description}
        </p>
      ) : null}
    </li>
  );
}

export function ProposalSkillTags({ skills }: { skills: string[] }) {
  if (!skills.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

type ProposalFileLinkProps = {
  href: string;
  label: string;
};

export function ProposalFileLink({ href, label }: ProposalFileLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 transition-colors hover:border-[#52C47F]/30 hover:bg-[#f8fcf9]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500 transition-colors group-hover:bg-[#EAF6F0] group-hover:text-[#52C47F]">
        <FileText className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <span className="min-w-0 break-all text-sm font-medium text-neutral-800 group-hover:text-neutral-900">
        {label}
      </span>
    </a>
  );
}

export function ProposalLoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 py-16 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#52C47F]" />
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}
