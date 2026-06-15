'use client';

import { useState } from 'react';
import { Building2, UserRound } from 'lucide-react';
import {
  ProposalCollapsiblePanel,
  ProposalDetailPanel,
  ProposalFileLink,
  ProposalHighlightStat,
  ProposalProse,
  ProposalSection,
} from '@/components/proposals/ProposalDetailUi';
import ProposalEmployerProfile from '@/components/proposals/ProposalEmployerProfile';
import ProposalFreelancerProfile from '@/components/proposals/ProposalFreelancerProfile';
import { formatNPR } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import type { Bid, Task } from '@/types';
import UserAvatar from '@/components/common/UserAvatar';

type ProposalApplicantPanelVariant = 'job' | 'offer';

type ProposalApplicantPanelProps = {
  bid: Bid;
  task?: Task | null;
  variant?: ProposalApplicantPanelVariant;
  profileSubject?: 'freelancer' | 'employer';
  showOfferContent?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
};

const PANEL_COPY: Record<
  ProposalApplicantPanelVariant,
  {
    title: string;
    description: string;
    amountLabel: string;
    messageTitle: string;
    messageDescription: string;
    attachmentsTitle: string;
    attachmentsDescription: string;
    loadingMessage: string;
  }
> = {
  job: {
    title: 'Freelancer profile',
    description: 'Public profile, experience, and qualifications from this applicant.',
    amountLabel: 'Expected salary',
    messageTitle: 'Application message',
    messageDescription: 'Submitted with this proposal',
    attachmentsTitle: 'Uploaded CV',
    attachmentsDescription: 'Documents attached to this application',
    loadingMessage: 'Loading applicant profile…',
  },
  offer: {
    title: 'Freelancer profile',
    description: 'Public profile, experience, and qualifications from this tasker.',
    amountLabel: 'Offer amount',
    messageTitle: 'Proposal',
    messageDescription: 'Submitted with this offer',
    attachmentsTitle: 'Attachments',
    attachmentsDescription: 'Documents attached to this offer',
    loadingMessage: 'Loading freelancer profile…',
  },
};

const EMPLOYER_PANEL_COPY = {
  title: 'Employer profile',
  description: 'Public business profile and contact details for this employer.',
  loadingMessage: 'Loading employer profile…',
};

function attachmentLabel(url: string, index: number): string {
  try {
    const name = new URL(url, 'http://localhost').pathname.split('/').pop();
    if (name) return decodeURIComponent(name);
  } catch {
    // ignore
  }
  return `Attachment ${index + 1}`;
}

function taskerDisplayName(bid: Bid): string {
  const tasker = bid.tasker;
  if (!tasker) return 'Applicant';
  const full = [tasker.first_name, tasker.last_name].filter(Boolean).join(' ').trim();
  return full || tasker.username || tasker.email || 'Applicant';
}

export function ProposalOfferSections({
  bid,
  variant = 'job',
}: {
  bid: Bid;
  variant?: ProposalApplicantPanelVariant;
}) {
  const copy = PANEL_COPY[variant];
  const amount = Number(bid.amount) || 0;

  return (
    <>
      {amount > 0 ? (
        <div className="mt-6 border-t border-neutral-100 pt-6">
          <ProposalHighlightStat label={copy.amountLabel} value={formatNPR(amount)} />
        </div>
      ) : null}

      {bid.proposal?.trim() ? (
        <ProposalSection title={copy.messageTitle} description={copy.messageDescription}>
          <ProposalProse>{bid.proposal.trim()}</ProposalProse>
        </ProposalSection>
      ) : null}

      {bid.cover_letter?.trim() ? (
        <ProposalSection title="Cover letter">
          <ProposalProse>{bid.cover_letter.trim()}</ProposalProse>
        </ProposalSection>
      ) : null}

      {bid.attachments && bid.attachments.length > 0 ? (
        <ProposalSection title={copy.attachmentsTitle} description={copy.attachmentsDescription}>
          <ul className="space-y-2">
            {bid.attachments.map((url, index) => (
              <li key={url}>
                <ProposalFileLink
                  href={getMediaUrl(url)}
                  label={attachmentLabel(url, index)}
                />
              </li>
            ))}
          </ul>
        </ProposalSection>
      ) : null}
    </>
  );
}

export default function ProposalApplicantPanel({
  bid,
  task = null,
  variant = 'job',
  profileSubject = 'freelancer',
  showOfferContent = true,
  collapsible = false,
  defaultExpanded = true,
}: ProposalApplicantPanelProps) {
  const copy = PANEL_COPY[variant];
  const employerCopy = EMPLOYER_PANEL_COPY;
  const isEmployerProfile = profileSubject === 'employer';
  const [expanded, setExpanded] = useState(defaultExpanded);

  const profileContent = isEmployerProfile ? (
    <ProposalEmployerProfile bid={bid} task={task} loadingMessage={employerCopy.loadingMessage} />
  ) : (
    <ProposalFreelancerProfile bid={bid} loadingMessage={copy.loadingMessage} />
  );

  const name = isEmployerProfile
    ? bid.task_owner_business_name?.trim() || bid.task_owner_name?.trim() || 'Employer'
    : taskerDisplayName(bid);
  const avatarSrc = isEmployerProfile
    ? bid.task_owner_logo_url?.trim()
      ? getMediaUrl(bid.task_owner_logo_url)
      : undefined
    : bid.tasker?.profile_image
      ? getMediaUrl(bid.tasker.profile_image)
      : undefined;

  const headerTrailing = isEmployerProfile ? (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 ring-2 ring-white">
      {avatarSrc ? (
        <img src={avatarSrc} alt={name} className="h-full w-full object-cover" />
      ) : (
        <Building2 className="h-4 w-4 text-neutral-500" />
      )}
    </div>
  ) : (
    <UserAvatar
      src={avatarSrc}
      name={name}
      alt={name}
      size="sm"
      className="!h-9 !w-9 ring-2 ring-white"
    />
  );

  const panelTitle = isEmployerProfile ? employerCopy.title : copy.title;
  const panelDescription = isEmployerProfile ? employerCopy.description : copy.description;
  const panelIcon = isEmployerProfile ? Building2 : UserRound;

  if (collapsible) {
    return (
      <ProposalCollapsiblePanel
        title={panelTitle}
        description={panelDescription}
        icon={panelIcon}
        isOpen={expanded}
        onToggle={() => setExpanded((open) => !open)}
        trailing={headerTrailing}
      >
        {profileContent}
      </ProposalCollapsiblePanel>
    );
  }

  return (
    <ProposalDetailPanel title={panelTitle} description={panelDescription} icon={panelIcon}>
      {profileContent}
      {showOfferContent ? <ProposalOfferSections bid={bid} variant={variant} /> : null}
    </ProposalDetailPanel>
  );
}
