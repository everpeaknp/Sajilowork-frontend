'use client';

import { FileText } from 'lucide-react';
import { getProjectDocumentAttachments, type Project } from './projectListData';

interface ProjectAttachmentsProps {
  project: Project;
}

export default function ProjectAttachments({ project }: ProjectAttachmentsProps) {
  const documents = getProjectDocumentAttachments(project);

  if (documents.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-neutral-200 pt-10 dark:border-neutral-800">
      <h2 className="mb-5 text-xl font-normal tracking-tight text-black sm:text-2xl dark:text-stone-100">
        Attachments
      </h2>
      <div className="flex flex-wrap gap-4">
        {documents.map((attachment, index) => {
          const cardClassName =
            'relative flex h-[88px] w-[148px] flex-col rounded-md bg-[#ebf8f2] px-4 py-4 text-left transition-colors hover:bg-[#dff5ea] sm:h-[92px] sm:w-[156px] dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60';

          if (attachment.url) {
            return (
              <a
                key={`${attachment.name}-${index}`}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClassName}
              >
                <span className="line-clamp-2 text-sm font-normal text-black dark:text-stone-100">{attachment.name}</span>
                <span className="mt-1 text-xs font-normal uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {attachment.fileType}
                </span>
                <FileText
                  className="absolute bottom-3 right-3 h-5 w-5 text-neutral-400/60"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </a>
            );
          }

          return (
            <div
              key={`${attachment.name}-${index}`}
              className={cardClassName}
            >
              <span className="line-clamp-2 text-sm font-normal text-black dark:text-stone-100">{attachment.name}</span>
              <span className="mt-1 text-xs font-normal uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {attachment.fileType}
              </span>
              <FileText
                className="absolute bottom-3 right-3 h-5 w-5 text-neutral-400/60"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
