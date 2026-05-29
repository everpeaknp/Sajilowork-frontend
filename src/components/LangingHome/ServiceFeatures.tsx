"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useAnimation } from "motion/react";
import {
  CheckCircle2,
  Sparkles,
  Truck,
  Hammer,
  Leaf,
  Monitor,
  Box,
  Palette,
  Plus,
  Wrench,
  Lightbulb,
  ShoppingCart,
  Dog,
  PenTool,
  Camera,
  Music,
  Utensils,
} from "lucide-react";
import { taskService } from "@/services/task.service";
import { browseTasksHref, postTaskHref, topCategoryNames } from "@/lib/landingHome";
import type { Category } from "@/types";
import { landingHeadline } from "./landingTypography";

const ICON_BY_NAME: Record<string, ReactNode> = {
  cleaning: <Sparkles size={28} />,
  delivery: <Truck size={28} />,
  handyman: <Hammer size={28} />,
  gardening: <Leaf size={28} />,
  "it support": <Monitor size={28} />,
  assembly: <Box size={28} />,
  painting: <Palette size={28} />,
  plumbing: <Wrench size={28} />,
  electrical: <Lightbulb size={28} />,
  shopping: <ShoppingCart size={28} />,
  "pet care": <Dog size={28} />,
  writing: <PenTool size={28} />,
  photography: <Camera size={28} />,
  events: <Music size={28} />,
  cooking: <Utensils size={28} />,
};

const FALLBACK_CATEGORIES = [
  "Cleaning",
  "Delivery",
  "Handyman",
  "Gardening",
  "IT Support",
  "Assembly",
  "Painting",
  "Plumbing",
  "Electrical",
  "Shopping",
  "Pet Care",
  "Writing",
  "Photography",
  "Events",
  "Cooking",
];

const STEPS = [
  "Describe what you need done and your budget.",
  "Get offers from trusted local Taskers.",
  "Release payment only when the task is finished.",
];

function iconForCategory(name: string): ReactNode {
  const key = name.toLowerCase();
  return ICON_BY_NAME[key] ?? <Plus size={28} />;
}

const CAROUSEL_TRANSITION = {
  repeat: Infinity,
  duration: 60,
  ease: "linear" as const,
};

export default function ServiceFeatures() {
  const [categories, setCategories] = useState<Category[]>([]);
  const carouselControls = useAnimation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await taskService.getCategories();
        if (!cancelled && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data);
        }
      } catch {
        /* fallback names only */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryNames = useMemo(() => {
    const fromApi = topCategoryNames(categories, 15);
    return fromApi.length > 0 ? fromApi : FALLBACK_CATEGORIES;
  }, [categories]);

  const carouselItems = useMemo(() => {
    const items = categoryNames.map((name) => ({
      name,
      href: browseTasksHref(name),
    }));
    items.push({ name: "More", href: "/discover" });
    return items;
  }, [categoryNames]);

  useEffect(() => {
    carouselControls.start({
      y: ["0%", "-50%"],
      transition: CAROUSEL_TRANSITION,
    });
  }, [carouselControls, carouselItems.length]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2
            className={`${landingHeadline} text-4xl sm:text-5xl md:text-6xl mb-8 leading-[1.08] tracking-[-0.035em]`}
          >
            Post your first task <br className="hidden md:block" /> in seconds
          </h2>

          <div className="space-y-6">
            {STEPS.map((text, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="mt-1 bg-[#1161fe]/10 p-1 rounded-full text-[#1161fe]">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-[#6a719a] font-medium text-lg leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/post-task">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-[#1161fe] hover:bg-blue-600 text-white px-10 py-5 rounded-full font-semibold text-lg transition-all shadow-xl shadow-[#1161fe]/25 cursor-pointer"
              >
                Post your task
              </motion.span>
            </Link>
          </div>
        </div>

        <div
          className="relative min-h-[520px] sm:min-h-[560px] lg:h-[620px] overflow-hidden px-2 py-6"
          onMouseEnter={() => carouselControls.stop()}
          onMouseLeave={() =>
            carouselControls.start({
              y: ["0%", "-50%"],
              transition: CAROUSEL_TRANSITION,
            })
          }
        >
          <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none" />

          <motion.div
            animate={carouselControls}
            initial={{ y: "0%" }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4"
          >
            {[...carouselItems, ...carouselItems].map((cat, i) => (
              <Link
                key={`${cat.name}-${i}`}
                href={cat.name === "More" ? cat.href : postTaskHref(cat.name)}
                className="bg-[#eef4ff]/50 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#1161fe] hover:text-white transition-all group/card shadow-sm"
              >
                <div className="text-gray-400 group-hover/card:text-white transition-colors">
                  {cat.name === "More" ? <Plus size={28} /> : iconForCategory(cat.name)}
                </div>
                <span className="text-xs font-semibold tracking-tight text-center">{cat.name}</span>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
