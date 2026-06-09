"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { ARTICLES } from "../constants";
import { blogService } from "@/services/blog.service";
import type { BlogPost } from "@/types/blog";
import { getBlogPostHref, isExternalBlogHref } from "@/lib/blog";
import { landingBody, landingHeadline, landingHeadlineSm } from "./landingTypography";

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
    <section className="bg-[#E7F0FF] py-8 sm:py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <h2
            className={`${landingHeadline} text-2xl uppercase italic text-brand-dark text-balance sm:text-4xl md:text-5xl`}
          >
            Tips and guides for your home
          </h2>
          <Link
            href="/blog"
            className={`${landingBody} inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-emerald px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 sm:w-auto sm:px-8`}
          >
            View all articles <ChevronRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-brand-emerald" aria-label="Loading articles" />
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {articles.map((article) => {
              const inner = (
                <>
                  <div className="h-44 overflow-hidden sm:h-56">
                    <img
                      src={article.img}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-5 sm:p-8">
                    <span className={`${landingHeadlineSm} text-[10px] uppercase tracking-[0.2em] text-brand-emerald`}>
                      {article.cat}
                    </span>
                    <h3
                      className={`${landingHeadlineSm} mt-2 mb-3 text-lg leading-tight text-brand-dark transition-colors group-hover:text-brand-emerald sm:mt-3 sm:mb-4 sm:text-2xl`}
                    >
                      {article.title}
                    </h3>
                    <p className={`${landingBody} text-sm font-medium leading-relaxed text-brand-dark/70 opacity-90`}>
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
