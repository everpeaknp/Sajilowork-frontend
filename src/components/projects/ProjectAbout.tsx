'use client';

import {
  Building2,
  Clock,
  DollarSign,
  Copy,
  Languages,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { discoverBody } from '@/components/LangingHome/landingTypography';
import {
  PROJECT_ATTACHMENTS,
  getProjectDescriptionParagraphs,
  getProjectDetailMeta,
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

  const metaItems: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Building2, label: 'Seller Type', value: detail.sellerType },
    { icon: DollarSign, label: 'Project type', value: project.type },
    { icon: Clock, label: 'Project Duration', value: detail.durationLabel },
    { icon: Sparkles, label: 'Project Level', value: project.expenseLevel },
    { icon: Languages, label: 'Languages', value: String(detail.languages) },
    { icon: GraduationCap, label: 'English Level', value: detail.englishLevel },
  ];

  return (
    <div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {metaItems.map((item) => (
            <MetaItem key={item.label} icon={item.icon} label={item.label} value={item.value} />
          ))}
        </div>

        <div className="mt-12 border-t border-black pt-10">
          <h2 className="mb-4 text-base font-normal tracking-tight text-black sm:text-lg">Description</h2>
          <div
            className={`${discoverBody} max-w-3xl space-y-3 text-[13px] font-light leading-[1.6] text-black antialiased sm:text-sm [&_p]:font-light [&_p]:text-black`}
          >
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="font-light text-black">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-black pt-10">
          <h2 className="mb-5 text-xl font-normal tracking-tight text-black sm:text-2xl">
            Attachments
          </h2>
          <div className="flex flex-wrap gap-4">
            {PROJECT_ATTACHMENTS.map((attachment, index) => (
              <button
                key={`${attachment.name}-${index}`}
                type="button"
                className="relative flex h-[88px] w-[148px] flex-col rounded-md bg-[#ebf8f2] px-4 py-4 text-left transition-colors hover:bg-[#dff5ea] sm:h-[92px] sm:w-[156px]"
              >
                <span className="text-sm font-normal text-black">{attachment.name}</span>
                <span className="mt-1 text-xs font-normal uppercase tracking-wide text-neutral-500">
                  {attachment.fileType}
                </span>
                <Copy
                  className="absolute bottom-3 right-3 h-5 w-5 text-neutral-400/60"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </div>
    </div>
  );
}
