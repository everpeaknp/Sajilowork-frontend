'use client';

import { ExternalLink, FileText } from 'lucide-react';
import type { PortfolioItem } from '@/types';
import { getMediaUrl } from '@/lib/utils';
import PublicProfileSection from '@/components/users/PublicProfileSection';

type PublicPortfolioGalleryProps = {
  items: PortfolioItem[];
  embedded?: boolean;
};

export default function PublicPortfolioGallery({ items, embedded = false }: PublicPortfolioGalleryProps) {
  if (!items.length) return null;

  const grid = (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {items.map((item) => {
        const fileUrl = getMediaUrl(item.file) || item.file;
        const isImage = item.file_type?.startsWith('image/');
        const isPdf = item.file_type === 'application/pdf';

        return (
          <article
            key={item.id}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
          >
            {isImage && fileUrl ? (
              <img
                src={fileUrl}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
                <div className="rounded-xl bg-white p-3 text-brand-emerald shadow-sm">
                  <FileText className="h-8 w-8" />
                </div>
                <p className="max-w-full truncate text-center text-xs font-semibold text-brand-dark">
                  {item.title}
                </p>
              </div>
            )}

            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="truncate text-sm font-semibold text-white">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-white/75">{item.description}</p>
              ) : null}
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/50">
                {isPdf ? 'PDF' : item.file_type?.split('/')[1] || 'File'}
              </p>
            </div>

            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-2 top-2 rounded-lg bg-white/95 p-1.5 text-brand-emerald shadow opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Open ${item.title}`}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </article>
        );
      })}
    </div>
  );

  if (embedded) return grid;

  return (
    <PublicProfileSection
      id="portfolio"
      eyebrow="Portfolio"
      title="Work showcase"
      description={`${items.length} ${items.length === 1 ? 'item' : 'items'}`}
    >
      {grid}
    </PublicProfileSection>
  );
}
