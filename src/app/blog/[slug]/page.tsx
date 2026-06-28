'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import BlogPostBody from '@/components/blog/BlogPostBody';
import { landingHeadline } from '@/components/LangingHome/landingTypography';
import { blogService } from '@/services/blog.service';
import type { BlogPostDetail } from '@/types/blog';

export default function BlogPostPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await blogService.getPostBySlug(slug);
        if (cancelled) return;
        if (res.success && res.data) {
          setPost(res.data);
        } else {
          setPost(null);
          setError(res.message || 'Article not found');
        }
      } catch {
        if (!cancelled) {
          setPost(null);
          setError('Could not load this article');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const publishedLabel =
    post?.published_at && format(new Date(post.published_at), 'dd MMMM yyyy');

  return (
    <MarketingPageLayout
      title={post?.title ?? 'Article'}
      hideHero
      backHref="/blog"
      backLabel="All articles"
      contentClassName="max-w-4xl"
    >
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2
            className="h-10 w-10 animate-spin text-brand-emerald"
            aria-label="Loading"
          />
        </div>
      ) : error || !post ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-14 text-center shadow-sm">
          <p className="font-body text-base font-medium text-muted-foreground">
            {error || 'Article not found'}
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-block text-sm font-semibold text-brand-emerald transition-colors hover:text-brand-dark"
          >
            Browse all articles
          </Link>
        </div>
      ) : (
        <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {post.image ? (
            <div className="aspect-[21/9] max-h-[420px] overflow-hidden bg-surface-container">
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          <div className="p-8 md:p-12">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-brand-light-bg px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-emerald">
                {post.category}
              </span>
              {publishedLabel ? (
                <time
                  dateTime={post.published_at}
                  className="text-sm font-medium text-muted-foreground"
                >
                  {publishedLabel}
                </time>
              ) : null}
            </div>
            <h1
              className={`${landingHeadline} mb-8 text-3xl leading-tight text-brand-dark md:text-4xl`}
            >
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mb-10 border-l-4 border-brand-emerald pl-4 text-lg font-medium leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
            ) : null}
            <BlogPostBody html={post.content} />
          </div>
        </article>
      )}
    </MarketingPageLayout>
  );
}
