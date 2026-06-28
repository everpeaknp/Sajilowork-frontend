'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { blogService } from '@/services/blog.service';
import type { BlogPost } from '@/types/blog';

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await blogService.listPosts({ page_size: 50 });
        if (!cancelled && res.success && res.data?.results) {
          setPosts(res.data.results);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MarketingPageLayout
      title="Tips and guides"
      description="Practical advice for cleaning, repairs, gardening, and getting the most from local taskers."
      backHref="/"
      backLabel="Back to home"
      contentClassName="max-w-7xl"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2
            className="h-10 w-10 animate-spin text-brand-emerald"
            aria-label="Loading"
          />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-brand-light-bg px-6 py-14 text-center">
          <p className="font-body text-base font-medium text-muted-foreground">
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
