'use client';

import { Award, CheckCircle2, Droplets, Mail, MapPin, Phone, Zap } from 'lucide-react';
import type { FreelancerCvPreviewData } from '@/app/dashboard/FreelancerCvPreview';
import { TRANSPORT_OPTIONS } from '@/components/freelancers/FreelancerTransport';
import {
  ProposalContactGrid,
  ProposalContactItem,
  ProposalHighlightStat,
  ProposalProfileHero,
  ProposalSection,
  ProposalSkillTags,
  ProposalTimelineItem,
  ProposalTimelineList,
} from '@/components/proposals/ProposalDetailUi';

function isFilledSkill(row: { skill: string; point: string }): boolean {
  return Boolean(row.skill && row.skill !== 'Select' && row.skill !== 'Other…');
}

function isFilledLanguage(row: { language: string; level: string }): boolean {
  return Boolean(row.language && row.language !== 'Select');
}

function licenceBadgeIcon(badgeType: string) {
  switch (badgeType) {
    case 'electrical_licence':
      return <Zap className="h-4 w-4 text-[#52C47F]" strokeWidth={2} />;
    case 'plumbing_licence':
      return <Droplets className="h-4 w-4 text-[#52C47F]" strokeWidth={2} />;
    default:
      return <Award className="h-4 w-4 text-[#52C47F]" strokeWidth={2} />;
  }
}

type FreelancerCvDetailsViewProps = {
  data: FreelancerCvPreviewData;
  expectedSalary?: string;
  offerAmountLabel?: string;
};

export default function FreelancerCvDetailsView({
  data,
  expectedSalary,
  offerAmountLabel = 'Expected salary',
}: FreelancerCvDetailsViewProps) {
  const skills = data.skills.filter(isFilledSkill).map((row) => row.skill);
  const languages = data.languages.filter(isFilledLanguage);
  const transportOptions = TRANSPORT_OPTIONS.filter((option) =>
    data.transport?.includes(option.id),
  );
  const licenceBadges = data.licenceBadges ?? [];
  const subtitle =
    data.tagline.trim() ||
    (data.specialization !== 'Select' ? data.specialization.trim() : '');

  return (
    <div className="min-w-0">
      <div className="rounded-2xl border border-neutral-100 bg-gradient-to-br from-neutral-50/80 via-white to-white p-5 sm:p-6">
        <ProposalProfileHero
          avatar={data.avatar || undefined}
          name={data.fullName.trim() || 'Applicant'}
          subtitle={subtitle || undefined}
        />

        <ProposalContactGrid>
          <ProposalContactItem icon={Mail} label="Email" value={data.email} />
          <ProposalContactItem icon={Phone} label="Phone" value={data.phone} />
          <ProposalContactItem icon={MapPin} label="Location" value={data.location} />
        </ProposalContactGrid>

        {expectedSalary ? (
          <div className="mt-5 border-t border-neutral-100/80 pt-5">
            <ProposalHighlightStat label={offerAmountLabel} value={expectedSalary} />
          </div>
        ) : null}
      </div>

      {data.description.trim() ? (
        <ProposalSection title="Professional summary">
          <p className="whitespace-pre-wrap break-words text-sm leading-[1.75] text-neutral-700 [overflow-wrap:anywhere]">
            {data.description.trim()}
          </p>
        </ProposalSection>
      ) : null}

      {data.education.length > 0 || data.experience.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          {data.education.length > 0 ? (
            <ProposalSection
              title="Education"
              description="Qualifications and training"
              className="mt-0"
            >
              <ProposalTimelineList>
                {data.education.map((entry) => (
                  <ProposalTimelineItem
                    key={entry.id ?? `${entry.degree}-${entry.institution}`}
                    title={entry.degree}
                    subtitle={entry.institution}
                    period={entry.yearRange}
                    description={entry.description || undefined}
                  />
                ))}
              </ProposalTimelineList>
            </ProposalSection>
          ) : null}

          {data.experience.length > 0 ? (
            <ProposalSection
              title="Experience"
              description="Work history and roles"
              className="mt-0"
            >
              <ProposalTimelineList>
                {data.experience.map((entry) => (
                  <ProposalTimelineItem
                    key={entry.id ?? `${entry.title}-${entry.company}`}
                    title={entry.title}
                    subtitle={entry.company}
                    period={entry.yearRange}
                    description={entry.description || undefined}
                  />
                ))}
              </ProposalTimelineList>
            </ProposalSection>
          ) : null}
        </div>
      ) : null}

      {skills.length > 0 ? (
        <ProposalSection title="Skills">
          <ProposalSkillTags skills={skills} />
        </ProposalSection>
      ) : null}

      {transportOptions.length > 0 ? (
        <ProposalSection title="How do you get around?" description="Transport and mobility">
          <div className="flex flex-wrap gap-2.5">
            {transportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <span
                  key={option.id}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#52C47F]/15 bg-[#f4fbf7] px-3.5 py-2.5 text-sm font-medium text-[#1D3E35] shadow-sm"
                >
                  <Icon className="h-4 w-4 text-[#52C47F]" strokeWidth={2} />
                  {option.label}
                </span>
              );
            })}
          </div>
        </ProposalSection>
      ) : null}

      {data.awards.length > 0 || licenceBadges.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          {data.awards.length > 0 ? (
            <ProposalSection
              title="Awards & certifications"
              className="mt-0"
            >
              <ProposalTimelineList>
                {data.awards.map((entry) => (
                  <ProposalTimelineItem
                    key={entry.id ?? `${entry.title}-${entry.issuer}`}
                    title={entry.title}
                    subtitle={entry.issuer}
                    period={entry.yearRange}
                    description={entry.description || undefined}
                  />
                ))}
              </ProposalTimelineList>
            </ProposalSection>
          ) : null}

          {licenceBadges.length > 0 ? (
            <ProposalSection
              title="Licence badges"
              description="Verified trade credentials"
              className="mt-0"
            >
              <ul className="grid grid-cols-1 gap-3">
                {licenceBadges.map((badge) => (
                  <li
                    key={badge.id}
                    className="flex items-start gap-3 rounded-xl border border-emerald-100/80 bg-emerald-50/40 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-emerald-100">
                      {licenceBadgeIcon(badge.badge_type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900">{badge.name}</p>
                      {badge.description?.trim() ? (
                        <p className="mt-1 text-xs leading-relaxed text-neutral-600 [overflow-wrap:anywhere]">
                          {badge.description.trim()}
                        </p>
                      ) : null}
                      <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#52C47F]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </ProposalSection>
          ) : null}
        </div>
      ) : null}

      {languages.length > 0 ? (
        <ProposalSection title="Languages">
          <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-100 bg-white">
            {languages.map((row, index) => (
              <li
                key={`${row.language}-${index}`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="font-medium text-neutral-900">{row.language}</span>
                {row.level !== 'Select' ? (
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                    {row.level}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </ProposalSection>
      ) : null}
    </div>
  );
}
