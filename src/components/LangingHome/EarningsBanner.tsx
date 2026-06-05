"use client";

import { useEffect, useState, useRef, type ReactNode, type MouseEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Star, ShieldCheck, CreditCard, Smartphone } from "lucide-react";
import { IMAGES } from "../constants";
import { searchService } from "@/services/search.service";
import {
  buildMockLandingTaskerCards,
  ensureLandingTaskers,
  LANDING_TASKER_MIN,
  mapUserToLandingTasker,
  type LandingTaskerCard,
} from "@/lib/landingHome";
import { formatNPR } from "@/lib/nepalLocale";
import { landingHeadline, landingHeadlineSm } from "./landingTypography";

const FALLBACK_TASKERS = buildMockLandingTaskerCards();

export default function EarningsBanner() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [taskers, setTaskers] = useState<LandingTaskerCard[]>(FALLBACK_TASKERS);
  const [featured, setFeatured] = useState<LandingTaskerCard | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await searchService.searchTaskers('', { page_size: 6 });
        if (cancelled || !data?.results) return;
        const results = Array.isArray(data.results) ? data.results : [];
        const list = results.map((t) =>
          mapUserToLandingTasker({
            id: t.id,
            first_name: t.first_name,
            last_name: t.last_name,
            bio: t.bio,
            average_rating: t.average_rating,
            total_reviews: t.total_reviews,
            is_verified_tasker: t.is_verified_tasker,
          } as import('@/types').User)
        );
        if (list.length > 0) {
          const filled = ensureLandingTaskers(list, LANDING_TASKER_MIN);
          setTaskers(filled);
          setFeatured(list[0]);
        }
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const spotlight = featured ?? taskers[0] ?? FALLBACK_TASKERS[0];
  const weeklyEarnings = formatNPR(
    Math.max(15000, (spotlight.totalRatings || 1) * 1200 + spotlight.completionRate * 100)
  );

  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="bg-white px-2 py-8 sm:px-4 sm:py-12">
      <div className="relative overflow-hidden rounded-t-[2rem] bg-[#1161fe] py-12 text-white sm:rounded-t-[3rem] sm:py-16 md:py-24 lg:rounded-t-[4rem]">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid items-center gap-10 lg:mb-24 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2
                className={`${landingHeadline} mb-6 text-3xl uppercase italic leading-tight sm:mb-8 sm:text-5xl md:text-6xl`}
              >
                Be your own boss
              </h2>
              <div className="mb-8 space-y-3 sm:mb-10 sm:space-y-4">
                {[
                  "Keep 100% of your tips.",
                  "Choose when and where you work.",
                  "Build your local reputation.",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-white sm:h-6 sm:w-6" />
                    <span className="text-base font-semibold tracking-tight sm:text-xl">{text}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/signup?role=tasker"
                className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full bg-white px-8 py-4 text-center text-base font-semibold text-[#1161fe] shadow-2xl shadow-black/20 transition-all hover:scale-105 active:scale-95 sm:w-auto sm:px-12 sm:py-5 sm:text-xl"
              >
                Become a Tasker
              </Link>
            </div>

            <Link
              href={spotlight.profileHref}
              className="block rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md transition-colors hover:bg-white/15 sm:rounded-[2rem] sm:p-8 md:rounded-[3rem] md:p-10"
            >
              <div className="mb-6 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={spotlight.avatar || IMAGES.TASKER_MARK}
                    alt={spotlight.name}
                    className="h-14 w-14 rounded-full border-4 border-white object-cover shadow-xl sm:h-20 sm:w-20"
                  />
                  <div className="min-w-0">
                    <p className={`${landingHeadlineSm} line-clamp-1 text-xl sm:text-3xl`}>
                      {spotlight.name}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70 sm:text-xs">
                      {spotlight.type}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 sm:text-right">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-tighter opacity-70 sm:text-xs">
                    Weekly Earnings
                  </p>
                  <p className={`${landingHeadline} text-2xl sm:text-5xl`}>{weeklyEarnings}</p>
                </div>
              </div>

              <div className="flex h-28 items-end gap-2 sm:h-40 sm:gap-3">
                {[40, 60, 50, 80, 100, 70, 90].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-2xl transition-all duration-1000 ${
                      i === 4 ? "bg-white" : "bg-white/30"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </Link>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-4 overflow-x-auto px-4 pb-8 no-scrollbar sm:gap-8 sm:px-8 sm:pb-10 ${
              isDragging ? "" : "snap-x snap-mandatory"
            } ${isDragging ? "cursor-grabbing" : "cursor-grab select-none"}`}
            style={{ scrollBehavior: isDragging ? "auto" : "smooth" }}
          >
            {taskers.map((tasker) => (
              <Link
                key={tasker.id}
                href={tasker.profileHref}
                className="flex min-w-[min(100%,340px)] snap-center flex-col gap-6 rounded-2xl bg-white p-5 text-[#0b1442] transition-shadow hover:ring-2 hover:ring-white/40 sm:min-w-[85%] sm:gap-8 sm:rounded-[2rem] sm:p-8 md:min-w-[850px] md:flex-row md:gap-10 md:rounded-[2.5rem] md:p-10"
              >
                <div className="mx-auto w-full max-w-[200px] shrink-0 sm:max-w-none md:w-[320px]">
                  <img
                    src={tasker.avatar}
                    alt={tasker.name}
                    className="aspect-[4/5] w-full rounded-2xl object-cover sm:rounded-3xl"
                  />
                </div>

                <div className="flex flex-1 flex-col pt-0 sm:pt-2">
                  <h3 className={`${landingHeadline} mb-4 text-2xl italic text-[#0b1442] sm:mb-6 sm:text-4xl md:text-5xl`}>
                    {tasker.name}
                  </h3>

                  <div className="mb-6 flex flex-wrap items-center gap-4 sm:mb-8 sm:gap-8">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={`${landingHeadlineSm} text-xl text-[#0b1442] sm:text-3xl`}>
                        {tasker.rating}
                      </span>
                      <Star className="text-orange-500 fill-orange-500" size={24} />
                      <div className="text-[10px] leading-tight text-gray-400 font-medium">
                        OVERALL RATING
                        <br />
                        {tasker.totalRatings} ratings
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={`${landingHeadlineSm} text-xl text-[#0b1442] sm:text-3xl`}>
                        {tasker.completionRate}%
                      </span>
                      <div className="text-[10px] leading-tight text-gray-400 font-medium">
                        COMPLETION RATE
                        <br />
                        on TaskNepal
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] bg-gray-100 w-full mb-8" />

                  <div className="mb-6">
                    <p className="text-sm font-semibold text-[#0b1442] mb-3">
                      Specialities:{" "}
                      <span className="font-bold text-gray-600">
                        {tasker.specialities.join(", ")}
                      </span>
                    </p>
                    <p className="text-sm font-medium text-gray-500 leading-relaxed line-clamp-4">
                      {tasker.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-8">
                    <Badge icon={<ShieldCheck size={16} />} label="Digital ID" />
                    <Badge icon={<CreditCard size={16} />} label="Payment Method" />
                    <Badge icon={<Smartphone size={16} />} label="Mobile" />
                  </div>

                  {tasker.topReview && (
                    <>
                      <div className="h-[1px] bg-gray-100 w-full mb-8" />
                      <div>
                        <p className="text-[10px] font-semibold text-[#0b1442] uppercase tracking-widest mb-4">
                          What the reviews say
                        </p>
                        <p className="text-sm font-medium text-[#384179] mb-4 italic leading-relaxed">
                          &ldquo;{tasker.topReview.text}&rdquo;
                        </p>
                        <p className="text-xs font-medium text-gray-400">
                          — {tasker.topReview.author}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    </section>
  );
}

function Badge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-[#f0f5ff] px-4 py-2 rounded-full">
      <div className="text-[#384179]">{icon}</div>
      <span className="text-xs font-semibold text-[#384179] tracking-tight">{label}</span>
    </div>
  );
}
