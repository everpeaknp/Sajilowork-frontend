'use client';

import { useRef } from 'react';
import { Download } from 'lucide-react';
import FreelancerCvDocument from '@/components/proposals/FreelancerCvDocument';
import { downloadElementAsHtml, printHtmlElement } from '@/lib/printDocument';
import type { UserBadge } from '@/types';

type CvSkill = { skill: string; point: string };
type CvLanguage = { language: string; level: string };
type CvEducation = {
  id?: string;
  yearRange: string;
  degree: string;
  institution: string;
  description: string;
};
type CvExperience = {
  id?: string;
  yearRange: string;
  title: string;
  company: string;
  description: string;
};
type CvAward = {
  id?: string;
  yearRange: string;
  title: string;
  issuer: string;
  description: string;
};

export type FreelancerCvPreviewData = {
  fullName: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  description: string;
  hourlyRate: string;
  specialization: string;
  profileType: string;
  skills: CvSkill[];
  languages: CvLanguage[];
  education: CvEducation[];
  experience: CvExperience[];
  awards: CvAward[];
  transport?: string[];
  licenceBadges?: UserBadge[];
};

type FreelancerCvPreviewProps = {
  data: FreelancerCvPreviewData;
};

function isFilledSkill(row: CvSkill): boolean {
  return Boolean(row.skill && row.skill !== 'Select' && row.skill !== 'Other…');
}

export default function FreelancerCvPreview({ data }: FreelancerCvPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const skills = data.skills.filter(isFilledSkill).map((row) => row.skill);
  const displayName = data.fullName.trim() || 'Your name';
  const subtitle =
    data.tagline.trim() ||
    (data.specialization !== 'Select' ? data.specialization.trim() : '');

  const hasContent =
    displayName !== 'Your name' ||
    Boolean(subtitle) ||
    Boolean(data.description.trim()) ||
    skills.length > 0 ||
    data.experience.length > 0 ||
    data.education.length > 0;

  const handleDownload = () => {
    const root = printRef.current;
    if (!root) return;

    const fileSlug =
      displayName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'cv';

    const printed = printHtmlElement(root, `${displayName} — CV`);
    if (!printed) {
      downloadElementAsHtml(root, `${fileSlug}-cv.html`, `${displayName} — CV`);
    }
  };

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-stone-100">Your CV</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Generated from your profile. Print or save as PDF to share with employers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!hasContent}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#52C47F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#43b06c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download / Print CV
        </button>
      </div>

      <div className="sr-only" aria-hidden="true">
        <FreelancerCvDocument data={data} innerRef={printRef} />
      </div>
    </section>
  );
}
