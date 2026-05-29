"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { IMAGES } from "../constants";
import { landingHeadline, landingHeadlineSm } from "./landingTypography";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#005fff] via-[#0047ff] to-[#03113c] text-white pt-20 pb-24 sm:pb-28">
      {/* Decorative background visual ambient circles and polygons (match Discover hero) */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-400 via-indigo-500 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 right-1/12 h-64 w-64 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 pointer-events-none animate-pulse" />
      <div className="absolute -bottom-10 -left-10 h-72 w-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className={`${landingHeadline} text-5xl sm:text-6xl md:text-7xl leading-[1.02] tracking-[-0.045em]`}
            >
              Get Anything Done
            </h1>

            <p className="mt-5 text-base sm:text-lg text-blue-100/90 max-w-xl leading-relaxed font-medium">
              The ultimate marketplace to outsource tasks, find local services, and reclaim your time. From cleaning to coding, we've got you covered.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85">
              <span className={`${landingHeadlineSm} text-sm`}>1M+ customers</span>
              <span className="h-1 w-1 rounded-full bg-white/35" aria-hidden />
              <span className={`${landingHeadlineSm} text-sm`}>2.5M+ tasks done</span>
              <span className="h-1 w-1 rounded-full bg-white/35" aria-hidden />
              <span className={`${landingHeadlineSm} text-sm`}>4M+ reviews</span>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/post-task"
                className="mt-10 rounded-full bg-white px-8 py-4 font-bold text-base text-[#061257] transition-all shadow-xl shadow-black/10 hover:bg-white/95 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                Post a task for free
              </Link>
              <Link
                href="/signup?role=tasker"
                className="mt-10 rounded-full border border-white/25 bg-transparent px-8 py-4 font-bold text-base text-white transition-all hover:bg-white/10 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              >
                Earn money
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="relative w-full max-w-lg">
              <div className="absolute -inset-6 rounded-[3rem] bg-white/10 blur-2xl opacity-60" aria-hidden />
              <img
                src={IMAGES.HERO_MAIN}
                alt="Professional at work"
                className="relative w-full rounded-[2.5rem] shadow-2xl border border-white/15 aspect-square object-cover"
              />
              <div className="absolute -bottom-6 left-6 rounded-2xl bg-white px-4 py-3 shadow-2xl">
                <p className={`${landingHeadlineSm} text-xs text-[#061257]`}>100% Verified</p>
                <p className="text-[11px] font-medium text-[#6a719a] mt-0.5">Trust & safety first</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#1161fe]/10 to-transparent blur-3xl pointer-events-none"></div>
    </section>
  );
}
