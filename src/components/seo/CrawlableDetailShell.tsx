import { truncateDescription } from '@/lib/seo/constants';

type CrawlableDetailShellProps = {
  title: string;
  description?: string | null;
};

/** Server-rendered semantic content for crawlers and AI systems before client hydration. */
export default function CrawlableDetailShell({
  title,
  description,
}: CrawlableDetailShellProps) {
  const summary = description ? truncateDescription(description, 500) : null;

  return (
    <article className="sr-only" aria-label={title}>
      <h1>{title}</h1>
      {summary ? <p>{summary}</p> : null}
    </article>
  );
}
