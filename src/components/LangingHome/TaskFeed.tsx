"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { taskService } from "@/services/task.service";
import {
  browseTasksHref,
  ensureLandingTaskCards,
  isMockLandingTask,
  LANDING_TASK_FEED_MIN,
  mapTasksFromResponse,
  type LandingTaskCard,
} from "@/lib/landingHome";
import { landingBody, landingHeadline, landingHeadlineSm } from "./landingTypography";

export default function TaskFeed() {
  const [tasks, setTasks] = useState<LandingTaskCard[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await taskService.getTasks({ page_size: 24, listing_kind: 'task' });
        if (cancelled || !res.success) return;
        const mapped = mapTasksFromResponse(res.data);
        if (mapped.length > 0) setTasks(mapped);
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const apiTasks = tasks;

  const displayTasks = useMemo(
    () => ensureLandingTaskCards(apiTasks, LANDING_TASK_FEED_MIN),
    [apiTasks]
  );

  const tabCategories = useMemo(() => {
    const fromTasks = [...new Set(displayTasks.map((t) => t.category))].slice(0, 5);
    if (fromTasks.length >= 3) return fromTasks;
    return ["CLEANING", "DELIVERY", "HANDYMAN", "GARDENING", "GENERAL"];
  }, [displayTasks]);

  const filtered = useMemo(() => {
    if (!activeCategory) return displayTasks;
    const realForCategory = apiTasks.filter(
      (t) => t.category.toUpperCase() === activeCategory.toUpperCase()
    );
    return ensureLandingTaskCards(
      realForCategory,
      LANDING_TASK_FEED_MIN,
      activeCategory
    );
  }, [apiTasks, activeCategory, displayTasks]);

  const marqueeSource = filtered.length > 0 ? filtered : displayTasks;
  const row1 = [...marqueeSource.slice(0, 4), ...marqueeSource.slice(0, 4)];
  const row2 = [...marqueeSource.slice(4, 8), ...marqueeSource.slice(4, 8)];

  return (
    <section className="overflow-x-hidden bg-white py-8 sm:py-10 md:py-12">
      <div className="mx-auto mb-6 max-w-7xl px-4 text-center sm:mb-8 sm:px-6 lg:px-8">
        <h2 className={`${landingHeadline} mb-3 text-2xl text-brand-dark text-balance sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl`}>
          See what others are getting done
        </h2>
        <Link
          href={browseTasksHref(activeCategory ?? undefined)}
          className={`${landingBody} mb-4 inline-block text-sm font-semibold text-brand-emerald hover:underline sm:mb-6`}
        >
          Browse all open tasks →
        </Link>

        <div className="relative border-b border-gray-300 pb-1">
          <div className="-mx-4 flex items-center justify-start gap-6 overflow-x-auto px-4 pb-5 no-scrollbar sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-8 sm:overflow-visible sm:px-0 md:gap-12">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`${landingBody} relative shrink-0 pb-3 text-sm font-bold transition-colors ${
                activeCategory === null ? "text-brand-dark" : "text-brand-dark/70 hover:text-brand-emerald"
              }`}
            >
              All tasks
              {activeCategory === null && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-emerald z-10" />
              )}
            </button>
            {tabCategories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`${landingBody} relative shrink-0 pb-3 text-sm font-bold transition-colors ${
                    active ? "text-brand-dark" : "text-brand-dark/70 hover:text-brand-emerald"
                  }`}
                >
                  {cat}
                  {active && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-emerald z-10" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <MarqueeRow items={row1} direction="left" speed={90} />
        <MarqueeRow items={row2.length ? row2 : row1} direction="right" speed={100} />
      </div>
    </section>
  );
}

function MarqueeRow({
  items,
  direction,
  speed,
}: {
  items: LandingTaskCard[];
  direction: "left" | "right";
  speed: number;
}) {
  return (
    <div className="flex overflow-x-hidden overflow-y-visible py-2 group">
      <div
        className="flex gap-6 px-4 group-hover:[animation-play-state:paused]"
        style={{
          display: "flex",
          animation: `marquee-${direction} ${speed}s linear infinite`,
        }}
      >
        {items.map((task, i) => (
          <TaskCard key={`${task.id}-${i}`} task={task} />
        ))}
      </div>
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
}

function TaskCard({ task }: { task: LandingTaskCard }) {
  const href = isMockLandingTask(task)
    ? browseTasksHref()
    : `/task/${encodeURIComponent(task.slug)}`;

  return (
    <Link
      href={href}
      className="group/card inline-flex h-[200px] w-[min(85vw,300px)] shrink-0 cursor-pointer flex-col justify-between whitespace-normal rounded-2xl bg-emerald-50 p-5 text-left transition-all hover:shadow-lg hover:ring-2 hover:ring-brand-emerald/20 sm:h-[220px] sm:w-[340px] sm:p-6"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1 min-w-0 pr-2">
            <span className={`${landingHeadlineSm} text-[10px] tracking-widest text-brand-dark/70 uppercase opacity-70`}>
              {task.category}
            </span>
            <h3
              className={`${landingHeadlineSm} text-xl text-brand-dark leading-tight line-clamp-2`}
            >
              {task.task}
            </h3>
          </div>
          <img
            src={task.avatar}
            alt={task.user}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div className="bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-gray-100">
          <Star size={14} className="text-orange-500 fill-orange-500" />
          <span className={`${landingBody} text-xs font-semibold text-brand-dark`}>
            {task.rating > 0 ? `${task.rating} Stars` : "New"}
          </span>
        </div>
        <span className={`${landingHeadlineSm} text-2xl text-brand-dark`}>{task.price}</span>
      </div>
    </Link>
  );
}
