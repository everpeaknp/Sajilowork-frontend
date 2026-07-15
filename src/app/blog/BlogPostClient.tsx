'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import BlogPostBody from '@/components/blog/BlogPostBody';
import OptimizedImage from '@/components/ui/optimized-image';
import { landingHeadline } from '@/components/LangingHome/landingTypography';
import type { BlogPostDetail } from '@/types/blog';

type BlogPostClientProps = {
  post: BlogPostDetail;
};

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const publishedLabel =
    post.published_at && format(new Date(post.published_at), 'dd MMMM yyyy');

  return (
    <MarketingPageLayout
      title={post.title}
      hideHero
      backHref="/blog"
      backLabel="All articles"
      breadcrumbItems={[
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: post.title },
      ]}
      contentClassName="max-w-4xl"
    >
      <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {post.image ? (
          <div className="relative aspect-[21/9] max-h-[420px] overflow-hidden bg-surface-container dark:bg-neutral-800">
            <OptimizedImage
              src={post.image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="p-8 md:p-12">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-brand-light-bg px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-emerald dark:bg-neutral-800">
              {post.category}
            </span>
            {publishedLabel ? (
              <time
                dateTime={post.published_at}
                className="text-sm font-medium text-muted-foreground dark:text-neutral-400"
              >
                {publishedLabel}
              </time>
            ) : null}
          </div>
          <h1
            className={`${landingHeadline} mb-8 text-3xl leading-tight text-brand-dark dark:text-stone-100 md:text-4xl`}
          >
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mb-10 border-l-4 border-brand-emerald pl-4 text-lg font-medium leading-relaxed text-muted-foreground dark:text-neutral-400">
              {post.excerpt}
            </p>
          ) : null}
          <BlogPostBody html={post.content} />
        </div>
      </article>
    </MarketingPageLayout>
  );
}

export function BlogPostNotFound() {
  return (
    <MarketingPageLayout
      title="Article"
      hideHero
      backHref="/blog"
      backLabel="All articles"
      contentClassName="max-w-4xl"
    >
      <div className="rounded-2xl border border-border bg-surface px-6 py-14 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <p className="font-body text-base font-medium text-muted-foreground dark:text-neutral-400">
          Article not found
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-block text-sm font-semibold text-brand-emerald transition-colors hover:text-brand-dark dark:hover:text-stone-100"
        >
          Browse all articles
        </Link>
      </div>
    </MarketingPageLayout>
  );
}
