import Link from 'next/link';
import { format } from 'date-fns';
import type { BlogPost } from '@/types/blog';
import { getBlogPostHref, isExternalBlogHref } from '@/lib/blog';
import { landingHeadlineSm } from '@/components/LangingHome/landingTypography';

type BlogPostCardProps = {
  post: BlogPost;
  className?: string;
};

export default function BlogPostCard({ post, className = '' }: BlogPostCardProps) {
  const href = getBlogPostHref(post);
  const external = isExternalBlogHref(href);
  const publishedLabel = post.published_at
    ? format(new Date(post.published_at), 'dd MMM yyyy')
    : null;

  const card = (
    <article
      className={`group h-full overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:border-brand-emerald/40 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
    >
      {post.image ? (
        <div className="h-48 overflow-hidden bg-surface-container dark:bg-neutral-800">
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <div className="h-2 bg-gradient-to-r from-brand-emerald via-primary to-brand-dark" />
      )}
      <div className="p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-brand-light-bg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-emerald dark:bg-neutral-800">
            {post.category}
          </span>
          {publishedLabel ? (
            <time
              dateTime={post.published_at}
              className="text-[10px] font-semibold text-muted-foreground dark:text-neutral-400"
            >
              {publishedLabel}
            </time>
          ) : null}
        </div>
        <h2 className={`${landingHeadlineSm} text-xl leading-tight text-brand-dark dark:text-stone-100`}>
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-3 font-body text-sm leading-relaxed text-muted-foreground dark:text-neutral-400">
          {post.excerpt}
        </p>
        <span className="mt-4 inline-block text-sm font-semibold text-brand-emerald transition-colors group-hover:text-brand-dark dark:group-hover:text-stone-100">
          Read article →
        </span>
      </div>
    </article>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {card}
      </a>
    );
  }

  return (
    <Link href={href} className="block">
      {card}
    </Link>
  );
}
