import Link from 'next/link';

import type { ListingFeedItem } from '@/lib/seo/listing-feed';

type CrawlableIndexNavProps = {
  title: string;
  description?: string;
  path: string;
  items: ListingFeedItem[];
};

/** Server-rendered link directory for index pages — visible to crawlers before client JS. */
export default function CrawlableIndexNav({
  title,
  description,
  path,
  items,
}: CrawlableIndexNavProps) {
  if (!items.length) return null;

  return (
    <nav aria-label={`${title} directory`} className="sr-only">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      <ul>
        <li>
          <Link href={path}>{title}</Link>
        </li>
        {items.map((item) => (
          <li key={item.path}>
            <Link href={item.path}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
