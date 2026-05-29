"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Home, SearchX } from "lucide-react";

import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="rounded-3xl border border-outline-variant shadow-2xl bg-white p-8 sm:p-10">
            <div className="flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F3F3F7] ring-1 ring-black/5 flex items-center justify-center">
                <SearchX className="w-7 h-7 text-[#000d45]" />
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#005fff]">
                404
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#03113c]">
                Page not found
              </h1>
              <p className="mt-3 text-sm sm:text-[15px] text-on-surface-variant max-w-xl mx-auto leading-relaxed">
                The page you’re trying to open doesn’t exist or may have been moved.
                Use the buttons below to get back on track.
              </p>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/discover"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white px-6 py-3 font-bold shadow-lg hover:bg-primary/90 transition-all"
              >
                Go to Discover
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F3F3F7] text-[#03113c] px-6 py-3 font-bold ring-1 ring-black/5 hover:bg-[#EAEAEF] transition-all"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 sm:mt-8">
        <Footer />
      </div>
    </div>
  );
}

