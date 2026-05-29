"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { ARTICLES } from "../constants";
import { blogService } from "@/services/blog.service";
import type { BlogPost } from "@/types/blog";
import { getBlogPostHref, isExternalBlogHref } from "@/lib/blog";
import { landingHeadline, landingHeadlineSm } from "./landingTypography";

type ArticleCard = {
  id: string;
  slug: string;
  cat: string;
  title: string;
  img: string;
  desc: string;
  href: string;
  external: boolean;
};

function mapPost(post: BlogPost): ArticleCard {
  const href = getBlogPostHref(post);
  return {
    id: post.id,
    slug: post.slug,
    cat: post.category,
    title: post.title,
    img: post.image,
    desc: post.excerpt,
    href,
    external: isExternalBlogHref(href),
  };
}

const FALLBACK_SLUGS = [
  "spotless-move-out-clean",
  "furniture-assembly-hacks",
  "spring-gardening-plant-now",
];

function mapFallback(article: (typeof ARTICLES)[number], index: number): ArticleCard {
  const slug = FALLBACK_SLUGS[index] || `article-${index}`;
  return {
    id: `fallback-${index}`,
    slug,
    cat: article.cat,
    title: article.title,
    img: article.img,
    desc: article.desc,
    href: `/blog/${encodeURIComponent(slug)}`,
    external: false,
  };
}

const BLOG_CARD_MIN = 3;

function ensureBlogArticles(real: ArticleCard[], minCount = BLOG_CARD_MIN): ArticleCard[] {
  if (real.length >= minCount) return real;

  const fallbacks = ARTICLES.map(mapFallback);
  const merged: ArticleCard[] = [...real];
  let poolIndex = 0;

  while (merged.length < minCount) {
    const mock = fallbacks[poolIndex % fallbacks.length];
    poolIndex += 1;
    if (merged.some((a) => a.slug === mock.slug)) continue;
    merged.push({
      ...mock,
      id: `fallback-pad-${merged.length}`,
      slug: `${mock.slug}-pad-${merged.length}`,
    });
  }
  return merged;
}

export default function BlogSection() {
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await blogService.getFeaturedPosts(3);
        if (!cancelled && res.success && res.data?.length) {
          setArticles(ensureBlogArticles(res.data.map(mapPost)));
        } else if (!cancelled) {
          setArticles(ARTICLES.map(mapFallback));
        }
      } catch {
        if (!cancelled) {
          setArticles(ARTICLES.map(mapFallback));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cardClassName =
    "bg-white rounded-3xl overflow-hidden border border-gray-100 transition-all group cursor-pointer block";

  return (
    <section className="bg-[#E7F0FF] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <h2
            className={`${landingHeadline} text-4xl sm:text-5xl text-[#0b1442] italic uppercase`}
          >
            Tips and guides for your home
          </h2>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-2 bg-[#1161fe] text-white px-8 py-3 rounded-full font-semibold text-sm hover:scale-105 transition-all"
          >
            View all articles <ChevronRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-[#1161fe]" aria-label="Loading articles" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article) => {
              const inner = (
                <>
                  <div className="h-56 overflow-hidden">
                    <img
                      src={article.img}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-8">
                    <span className="text-[10px] font-semibold text-[#1161fe] uppercase tracking-[0.2em]">
                      {article.cat}
                    </span>
                    <h3
                      className={`${landingHeadlineSm} text-2xl mt-3 mb-4 group-hover:text-[#1161fe] transition-colors leading-tight text-[#0b1442]`}
                    >
                      {article.title}
                    </h3>
                    <p className="text-[#384179] font-medium leading-relaxed text-sm opacity-90">
                      {article.desc}
                    </p>
                  </div>
                </>
              );

              if (article.external) {
                return (
                  <motion.a
                    key={article.id}
                    href={article.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -8 }}
                    className={cardClassName}
                  >
                    {inner}
                  </motion.a>
                );
              }

              return (
                <motion.div key={article.id} whileHover={{ y: -8 }}>
                  <Link href={article.href} className={cardClassName}>
                    {inner}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
