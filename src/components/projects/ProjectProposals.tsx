'use client';

import { Calendar, FileText, Star } from 'lucide-react';
import { buildProjectProposals, type Project } from './projectListData';

interface ProjectProposalsProps {
  project: Project;
}

function MetaDivider() {
  return <span className="h-3.5 w-px shrink-0 bg-neutral-300" aria-hidden />;
}

export default function ProjectProposals({ project }: ProjectProposalsProps) {
  const proposals = buildProjectProposals(project);

  return (
    <section className="border-t border-black pt-10">
      <h2 className="mb-6 text-xl font-normal tracking-tight text-black sm:text-2xl">
        Project Proposals ({proposals.length})
      </h2>

      <div className="space-y-4">
        {proposals.map((proposal) => (
          <article
            key={proposal.id}
            className="rounded-lg border border-neutral-200 bg-white px-5 py-5 sm:px-6 sm:py-6"
          >
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="relative shrink-0">
                <img
                  src={proposal.avatar}
                  alt={proposal.name}
                  className="h-16 w-16 rounded-full border border-neutral-100 bg-neutral-50 object-cover sm:h-[72px] sm:w-[72px]"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#52C47F]" />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-normal text-black sm:text-lg">{proposal.name}</h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-normal text-neutral-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {proposal.rating.toFixed(1)} ({proposal.reviews} reviews)
                    </span>
                    <MetaDivider />
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      {proposal.submittedAt}
                    </span>
                    <MetaDivider />
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-neutral-400" />
                      {proposal.receivedCount} Received
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm font-normal leading-normal text-black sm:text-[15px]">
                    {proposal.message}
                  </p>
                </div>

                <div className="shrink-0 sm:text-right">
                  <p className="text-lg font-normal text-black sm:text-xl">{proposal.rateLabel}</p>
                  <p className="mt-1 text-sm font-normal text-neutral-500">{proposal.hoursLabel}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
