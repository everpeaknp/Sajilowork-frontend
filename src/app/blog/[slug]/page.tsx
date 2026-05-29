'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import BlogPostBody from '@/components/blog/BlogPostBody';
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
    <div className="min-h-screen bg-[#E7F0FF] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 pb-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[#1161fe] font-bold mb-8 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          All articles
        </Link>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-[#1161fe]" aria-label="Loading" />
          </div>
        ) : error || !post ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center">
            <p className="text-[#384179] font-medium">{error || 'Article not found'}</p>
            <Link
              href="/blog"
              className="inline-block mt-6 text-[#1161fe] font-bold hover:underline"
            >
              Browse all articles
            </Link>
          </div>
        ) : (
          <article className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            {post.image ? (
              <div className="aspect-[21/9] max-h-[420px] overflow-hidden bg-gray-100">
                <img
                  src={post.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
            <div className="p-8 md:p-12">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-[10px] font-black text-[#1161fe] uppercase tracking-[0.2em]">
                  {post.category}
                </span>
                {publishedLabel ? (
                  <time
                    dateTime={post.published_at}
                    className="text-sm font-semibold text-[#384179]/70"
                  >
                    {publishedLabel}
                  </time>
                ) : null}
              </div>
              <h1 className="font-['Outfit'] font-black text-3xl md:text-4xl text-[#0b1442] leading-tight mb-8">
                {post.title}
              </h1>
              {post.excerpt ? (
                <p className="text-lg text-[#384179] font-medium mb-10 border-l-4 border-[#1161fe] pl-4">
                  {post.excerpt}
                </p>
              ) : null}
              <BlogPostBody html={post.content} />
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
