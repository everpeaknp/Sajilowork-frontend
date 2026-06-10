'use client';

import { CalendarCheck, Clock, MapPin, Receipt } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { discoverBody } from '@/components/LangingHome/landingTypography';
import {
  getJobCityLabel,
  getJobDescriptionParagraphs,
  getJobHoursLabel,
  getJobPostedLabel,
  getJobSalaryLabel,
  type Job,
} from './jobListData';

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FAF0E3]">
        <Icon className="h-5 w-5 text-[#1D3E35]" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-normal text-black">{label}</p>
        <p className="mt-1 text-sm font-light text-neutral-500">{value}</p>
      </div>
    </div>
  );
}

interface JobAboutProps {
  job: Job;
}

export default function JobAbout({ job }: JobAboutProps) {
  const paragraphs = getJobDescriptionParagraphs(job);

  const metaItems: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: CalendarCheck, label: 'Date Posted', value: getJobPostedLabel(job) },
    { icon: MapPin, label: 'Location', value: getJobCityLabel(job) },
    { icon: Clock, label: 'Hours', value: getJobHoursLabel(job) },
    { icon: Receipt, label: 'Salary', value: getJobSalaryLabel(job) },
  ];

  return (
    <div className="mt-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {metaItems.map((item) => (
          <MetaItem key={item.label} icon={item.icon} label={item.label} value={item.value} />
        ))}
      </div>

      <div className="mt-14">
        <h2 className="text-lg font-normal tracking-tight text-black sm:text-xl">Description</h2>
        <div
          className={`${discoverBody} mt-5 space-y-4 text-sm font-light leading-[1.65] text-neutral-600 antialiased sm:text-[15px] [&_p]:font-light [&_p]:text-neutral-600`}
        >
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
