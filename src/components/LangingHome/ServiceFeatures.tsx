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
import { POST_TASK_PATH } from "@/lib/postTaskPath";
import type { Category } from "@/types";
import { landingBody, landingBodyMuted, landingHeadline, landingHeadlineSm } from "./landingTypography";

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
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2
            className={`${landingHeadline} mb-6 text-2xl leading-[1.1] tracking-[-0.03em] text-balance sm:mb-8 sm:text-4xl md:text-5xl lg:text-6xl`}
          >
            Post your first task <br className="hidden md:block" /> in seconds
          </h2>

          <div className="space-y-4 sm:space-y-6">
            {STEPS.map((text, i) => (
              <div key={i} className="flex items-start gap-3 sm:gap-4">
                <div className="mt-0.5 shrink-0 rounded-full bg-brand-emerald/10 p-1 text-brand-emerald sm:mt-1">
                  <CheckCircle2 size={20} />
                </div>
                <p className={`${landingBodyMuted} text-base leading-relaxed sm:text-lg`}>{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10">
            <Link href={POST_TASK_PATH} className="block w-full sm:inline-block sm:w-auto">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${landingBody} flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full bg-brand-emerald px-8 py-4 text-base font-semibold text-white shadow-xl shadow-brand-emerald/25 transition-all hover:bg-brand-dark sm:inline-flex sm:px-10 sm:py-5 sm:text-lg`}
              >
                Post your task
              </motion.span>
            </Link>
          </div>
        </div>

        <div
          className="relative min-h-[360px] overflow-hidden px-1 py-4 sm:min-h-[480px] sm:px-2 sm:py-6 lg:h-[620px] lg:min-h-[560px]"
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
            className="grid grid-cols-2 gap-2.5 py-2 sm:grid-cols-4 sm:gap-4 sm:py-4"
          >
            {[...carouselItems, ...carouselItems].map((cat, i) => (
              <Link
                key={`${cat.name}-${i}`}
                href={cat.name === "More" ? cat.href : postTaskHref(cat.name)}
                className="group/card flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl bg-emerald-50/50 p-4 shadow-sm transition-all hover:bg-brand-emerald hover:text-white sm:min-h-0 sm:gap-3 sm:rounded-2xl sm:p-6"
              >
                <div className="text-gray-400 group-hover/card:text-white transition-colors">
                  {cat.name === "More" ? <Plus size={28} /> : iconForCategory(cat.name)}
                </div>
                <span className={`${landingHeadlineSm} text-center text-xs tracking-tight sm:text-sm`}>{cat.name}</span>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
