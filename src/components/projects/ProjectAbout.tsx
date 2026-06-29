'use client';

import {
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Languages,
  Sun,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { discoverBody } from '@/components/LangingHome/landingTypography';
import {
  formatProjectScheduleNeedLabel,
  formatProjectTimeOfDayLabel,
  getProjectDescriptionParagraphs,
  getProjectDetailMeta,
  getProjectSchedule,
  type Project,
} from './projectListData';

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
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FAF0E3]">
        <Icon className="h-5 w-5 text-[#1D3E35]" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-xs font-normal text-neutral-500">{label}</p>
        <p className="mt-0.5 text-sm font-normal text-black sm:text-[15px]">{value}</p>
      </div>
    </div>
  );
}

interface ProjectAboutProps {
  project: Project;
}

export default function ProjectAbout({ project }: ProjectAboutProps) {
  const detail = getProjectDetailMeta(project);
  const paragraphs = getProjectDescriptionParagraphs(project);

  const schedule = getProjectSchedule(project);

  const metaItems: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Building2, label: 'Seller Type', value: detail.sellerType },
    { icon: DollarSign, label: 'Project type', value: project.type },
    { icon: Clock, label: 'Project Duration', value: detail.durationLabel },
    { icon: Languages, label: 'Languages', value: detail.languagesLabel },
  ];

  if (schedule) {
    metaItems.push(
      {
        icon: Calendar,
        label: 'When do you need this done?',
        value: formatProjectScheduleNeedLabel(schedule),
      },
      {
        icon: Sun,
        label: 'I need a certain time of day',
        value: formatProjectTimeOfDayLabel(schedule),
      },
    );
  }

  return (
    <div className="min-w-0">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {metaItems.map((item) => (
            <MetaItem key={item.label} icon={item.icon} label={item.label} value={item.value} />
          ))}
        </div>

        <div className="mt-12 min-w-0 overflow-hidden border-t border-neutral-200 pt-10">
          <h2 className="mb-4 text-base font-normal tracking-tight text-black sm:text-lg">Description</h2>
          <div
            className={`${discoverBody} max-w-3xl min-w-0 space-y-3 text-[13px] font-light leading-[1.6] text-black antialiased sm:text-sm [&_p]:font-light [&_p]:text-black`}
          >
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="font-light text-black whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
    </div>
  );
}
