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
import { landingHeadline, landingHeadlineSm } from "./landingTypography";

export default function TaskFeed() {
  const [tasks, setTasks] = useState<LandingTaskCard[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await taskService.getTasks({ page_size: 24 });
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
    <section className="bg-white py-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h2 className={`${landingHeadline} text-5xl sm:text-6xl text-[#0b1442] mb-6`}>
          See what others are getting done
        </h2>
        <Link
          href={browseTasksHref(activeCategory ?? undefined)}
          className="inline-block text-sm font-semibold text-[#1161fe] hover:underline mb-10"
        >
          Browse all open tasks →
        </Link>

        <div className="relative border-b border-gray-300 pb-1">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 pb-5">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`text-sm font-bold pb-3 relative transition-colors ${
                activeCategory === null ? "text-[#0b1442]" : "text-[#384179] hover:text-[#1161fe]"
              }`}
            >
              All tasks
              {activeCategory === null && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#1161fe] z-10" />
              )}
            </button>
            {tabCategories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`text-sm font-bold pb-3 relative transition-colors ${
                    active ? "text-[#0b1442]" : "text-[#384179] hover:text-[#1161fe]"
                  }`}
                >
                  {cat}
                  {active && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#1161fe] z-10" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
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
    ? "/task"
    : `/task/${encodeURIComponent(task.slug)}`;

  return (
    <Link
      href={href}
      className="inline-block w-[340px] bg-[#f0f5ff] p-6 rounded-2xl transition-all cursor-pointer whitespace-normal group/card text-left flex flex-col justify-between h-[220px] hover:shadow-lg hover:ring-2 hover:ring-[#1161fe]/20"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[10px] font-semibold tracking-widest text-[#384179] opacity-70 uppercase">
              {task.category}
            </span>
            <h3
              className={`${landingHeadlineSm} text-xl text-[#0b1442] leading-tight line-clamp-2`}
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
          <span className="text-xs font-semibold text-[#0b1442]">
            {task.rating > 0 ? `${task.rating} Stars` : "New"}
          </span>
        </div>
        <span className={`${landingHeadlineSm} text-2xl text-[#0b1442]`}>{task.price}</span>
      </div>
    </Link>
  );
}
