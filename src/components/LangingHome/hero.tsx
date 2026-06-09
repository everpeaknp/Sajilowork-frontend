"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { IMAGES } from "../constants";
import { landingBody, landingBodyMuted, landingHeadline, landingHeadlineSm } from "./landingTypography";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-[#1e5c48] to-brand-emerald pt-16 pb-8 text-white sm:pb-10 md:pb-12">
      {/* Decorative background visual ambient circles */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-300/40 via-brand-emerald/20 to-transparent opacity-30" />
      <div className="pointer-events-none absolute top-1/4 right-0 hidden h-48 w-48 animate-pulse rounded-full bg-emerald-400 opacity-10 mix-blend-screen blur-3xl filter sm:block sm:h-64 sm:w-64" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-brand-emerald opacity-15 mix-blend-screen blur-3xl filter sm:h-72 sm:w-72" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className={`${landingHeadline} text-[2rem] leading-[1.05] tracking-[-0.04em] text-balance sm:text-5xl md:text-6xl lg:text-7xl`}
            >
              Get Anything Done
            </h1>

            <p className={`${landingBody} mt-4 max-w-xl text-sm leading-relaxed font-medium text-emerald-100/90 sm:mt-5 sm:text-base md:text-lg`}>
              The ultimate marketplace to outsource tasks, find local services, and reclaim your time. From cleaning to coding, we've got you covered.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/85 sm:mt-7 sm:gap-x-6 sm:text-sm">
              <span className={landingHeadlineSm}>1M+ customers</span>
              <span className="h-1 w-1 rounded-full bg-white/35" aria-hidden />
              <span className={landingHeadlineSm}>2.5M+ tasks done</span>
              <span className="h-1 w-1 rounded-full bg-white/35" aria-hidden />
              <span className={landingHeadlineSm}>4M+ reviews</span>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/post-task"
                className={`${landingBody} inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 py-3.5 text-center text-sm font-bold text-brand-dark shadow-xl shadow-black/10 transition-all hover:bg-white/95 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:w-auto sm:px-8 sm:py-4 sm:text-base`}
              >
                Post a task for free
              </Link>
              <Link
                href="/signup?role=tasker"
                className={`${landingBody} inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/25 bg-transparent px-6 py-3.5 text-center text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35 sm:w-auto sm:px-8 sm:py-4 sm:text-base`}
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
            <div className="relative w-full max-w-md sm:max-w-lg">
              <div className="absolute -inset-4 rounded-[2rem] bg-white/10 opacity-60 blur-2xl sm:-inset-6 sm:rounded-[3rem]" aria-hidden />
              <img
                src={IMAGES.HERO_MAIN}
                alt="Professional at work"
                className="relative aspect-[4/3] w-full rounded-2xl border border-white/15 object-cover shadow-2xl sm:aspect-square sm:rounded-[2.5rem]"
              />
              <div className="absolute bottom-3 left-3 rounded-xl bg-white px-3 py-2 shadow-2xl sm:-bottom-6 sm:left-6 sm:rounded-2xl sm:px-4 sm:py-3">
                <p className={`${landingHeadlineSm} text-[10px] text-brand-dark sm:text-xs`}>100% Verified</p>
                <p className={`${landingBodyMuted} mt-0.5 text-[10px] sm:text-[11px]`}>Trust & safety first</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-emerald/10 to-transparent blur-3xl pointer-events-none"></div>
    </section>
  );
}
