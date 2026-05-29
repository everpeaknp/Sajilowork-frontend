'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
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
    <div className="min-h-screen bg-[#E7F0FF] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#1161fe] font-bold mb-8 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to home
        </Link>
        <h1 className="font-['Outfit'] font-black text-4xl md:text-5xl text-[#0b1442] italic uppercase mb-4">
          Tips and guides
        </h1>
        <p className="text-[#384179] font-medium max-w-2xl mb-12">
          Practical advice for cleaning, repairs, gardening, and getting the most from local taskers.
        </p>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#1161fe]" aria-label="Loading" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-[#384179] font-medium">No articles published yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
