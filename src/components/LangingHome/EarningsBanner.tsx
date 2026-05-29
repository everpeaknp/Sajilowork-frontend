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
  unwrapList,
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
        const res = await searchService.searchTaskers({
          is_verified: true,
          page_size: 6,
          min_rating: 4,
        });
        if (cancelled || !res.success) return;
        const list = unwrapList(res.data).map(mapUserToLandingTasker);
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
    <section className="bg-white py-12 px-2 md:px-4">
      <div className="bg-[#1161fe] text-white py-24 overflow-hidden relative rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-24">
            <div>
              <h2
                className={`${landingHeadline} text-5xl sm:text-6xl mb-8 leading-tight italic uppercase`}
              >
                Be your own boss
              </h2>
              <div className="space-y-4 mb-10">
                {[
                  "Keep 100% of your tips.",
                  "Choose when and where you work.",
                  "Build your local reputation.",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={24} className="text-white" />
                    <span className="text-xl font-semibold tracking-tight">{text}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/signup?role=tasker"
                className="inline-block bg-white text-[#1161fe] px-12 py-5 rounded-full font-semibold text-xl shadow-2xl shadow-black/20 hover:scale-105 transition-all active:scale-95 cursor-pointer"
              >
                Become a Tasker
              </Link>
            </div>

            <Link
              href={spotlight.profileHref}
              className="bg-white/10 backdrop-blur-md rounded-[3rem] p-10 border border-white/20 block hover:bg-white/15 transition-colors"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <img
                    src={spotlight.avatar || IMAGES.TASKER_MARK}
                    alt={spotlight.name}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                  <div>
                    <p className={`${landingHeadlineSm} text-3xl line-clamp-1`}>
                      {spotlight.name}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
                      {spotlight.type}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-tighter">
                    Weekly Earnings
                  </p>
                  <p className={`${landingHeadline} text-4xl sm:text-5xl`}>{weeklyEarnings}</p>
                </div>
              </div>

              <div className="flex items-end gap-3 h-40">
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
            className={`flex gap-8 px-8 pb-10 overflow-x-auto no-scrollbar ${
              isDragging ? "" : "snap-x"
            } ${isDragging ? "cursor-grabbing" : "cursor-grab select-none"}`}
            style={{ scrollBehavior: isDragging ? "auto" : "smooth" }}
          >
            {taskers.map((tasker) => (
              <Link
                key={tasker.id}
                href={tasker.profileHref}
                className="min-w-[90%] md:min-w-[850px] bg-white rounded-[2.5rem] p-8 md:p-10 text-[#0b1442] flex flex-col md:flex-row gap-10 snap-center hover:ring-2 hover:ring-white/40 transition-shadow"
              >
                <div className="md:w-[320px] shrink-0">
                  <img
                    src={tasker.avatar}
                    alt={tasker.name}
                    className="w-full aspect-[4/5] object-cover rounded-3xl"
                  />
                </div>

                <div className="flex-1 flex flex-col pt-2">
                  <h3 className={`${landingHeadline} text-5xl mb-6 text-[#0b1442] italic`}>
                    {tasker.name}
                  </h3>

                  <div className="flex items-center gap-8 mb-8 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className={`${landingHeadlineSm} text-3xl text-[#0b1442]`}>
                        {tasker.rating}
                      </span>
                      <Star className="text-orange-500 fill-orange-500" size={24} />
                      <div className="text-[10px] leading-tight text-gray-400 font-medium">
                        OVERALL RATING
                        <br />
                        {tasker.totalRatings} ratings
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`${landingHeadlineSm} text-3xl text-[#0b1442]`}>
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
