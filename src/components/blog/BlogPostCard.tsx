import Link from 'next/link';
import { format } from 'date-fns';
import type { BlogPost } from '@/types/blog';
import { getBlogPostHref, isExternalBlogHref } from '@/lib/blog';

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
      className={`bg-white rounded-3xl overflow-hidden border border-gray-100 h-full transition-all hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      {post.image ? (
        <div className="h-48 overflow-hidden">
          <img src={post.image} alt="" className="w-full h-full object-cover" />
        </div>
      ) : null}
      <div className="p-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-black text-[#1161fe] uppercase tracking-[0.2em]">
            {post.category}
          </span>
          {publishedLabel ? (
            <time
              dateTime={post.published_at}
              className="text-[10px] font-semibold text-[#384179]/70"
            >
              {publishedLabel}
            </time>
          ) : null}
        </div>
        <h2 className="font-['Outfit'] font-black text-xl text-[#0b1442] leading-tight">
          {post.title}
        </h2>
        <p className="text-[#384179] text-sm mt-3 opacity-80 line-clamp-3">{post.excerpt}</p>
        <span className="inline-block mt-4 text-sm font-bold text-[#1161fe]">Read article →</span>
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
