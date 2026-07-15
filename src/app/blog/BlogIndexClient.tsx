'use client';

import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import BlogPostCard from '@/components/blog/BlogPostCard';
import type { BlogPost } from '@/types/blog';

type BlogIndexClientProps = {
  posts: BlogPost[];
};

export default function BlogIndexClient({ posts }: BlogIndexClientProps) {
  return (
    <MarketingPageLayout
      title="Tips and guides"
      description="Practical advice for cleaning, repairs, gardening, and getting the most from local taskers."
      backHref="/"
      backLabel="Back to home"
      breadcrumbItems={[
        { label: 'Home', href: '/' },
        { label: 'Blog' },
      ]}
      contentClassName="max-w-7xl"
    >
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-brand-light-bg px-6 py-14 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <p className="font-body text-base font-medium text-muted-foreground dark:text-neutral-400">
            No articles published yet. Check back soon for tips and guides.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </MarketingPageLayout>
  );
}
