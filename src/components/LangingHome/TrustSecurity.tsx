"use client";

import Link from "next/link";
import { BadgeCheck, CheckCircle, Headset, Lock } from "lucide-react";
import { IMAGES } from "../constants";
import { motion } from "motion/react";
import { landingHeadline, landingHeadlineSm } from "./landingTypography";

const FEATURES = [
  {
    title: "Secure Payments",
    desc: "We hold your funds in a secure account until the task is completed and you're happy with the result.",
    icon: <Lock className="h-5 w-5" />
  },
  {
    title: "Digital ID Verification",
    desc: "Every Tasker undergoes a multi-step identity verification process to ensure a safe and trusted environment.",
    icon: <BadgeCheck className="h-5 w-5" />
  },
  {
    title: "24/7 Support",
    desc: "Our dedicated support team is here to help you resolve any issues at any stage of your task journey.",
    icon: <Headset className="h-5 w-5" />
  }
];

export default function TrustSecurity() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="relative z-10">
            <img
              src={IMAGES.TRUST_PHOTO}
              alt="Secure community"
              className="h-[280px] w-full rounded-2xl object-cover shadow-2xl sm:h-[420px] sm:rounded-[28px] md:h-[520px] lg:h-[560px]"
            />
            {/* Overlay decoration */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-[#03113c]/30 to-transparent sm:rounded-[28px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute -bottom-4 right-2 z-20 flex items-center gap-3 rounded-2xl border border-outline-variant/70 bg-white/95 p-4 shadow-[0_28px_70px_-22px_rgba(0,0,0,0.25)] backdrop-blur-md sm:-bottom-7 sm:-right-6 sm:gap-4 sm:rounded-3xl sm:p-7"
          >
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary sm:rounded-2xl sm:p-3.5">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
            </div>
            <div>
              <p className={`${landingHeadlineSm} text-base leading-tight text-[#061257] sm:text-2xl`}>
                100% Verified
              </p>
              <p className="text-[11px] font-medium text-[#6a719a] mt-1">
                Trust & Safety first
              </p>
            </div>
          </motion.div>

          {/* Floating abstract element */}
          <div className="absolute -top-10 -left-10 w-56 h-56 bg-primary/10 rounded-full blur-3xl -z-10" />
        </motion.div>

        <div className="space-y-8 sm:space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-3 block">
              Trust & safety
            </span>
            <h2
              className={`${landingHeadline} text-2xl leading-[1.1] tracking-[-0.03em] text-balance sm:text-4xl md:text-[40px]`}
            >
              Trust and safety features <br className="hidden sm:block" />
              <span className="text-[#384179]">for your protection</span>
            </h2>
            <p className="mt-3 text-[13px] sm:text-sm leading-relaxed text-[#6a719a] max-w-xl">
              Payments are protected, profiles are verified, and support is always available—so you can post with confidence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4">
            {FEATURES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="group rounded-2xl border border-outline-variant/70 bg-white p-5 sm:p-6 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.25)] hover:shadow-[0_18px_44px_-26px_rgba(0,0,0,0.35)] transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 bg-primary/10 text-primary p-3 rounded-2xl shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`${landingHeadlineSm} text-lg sm:text-xl text-[#061257]`}>
                      {item.title}
                    </h4>
                    <p className="mt-1 text-[13px] sm:text-sm leading-relaxed text-[#6a719a] max-w-xl font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/cancellation-policy"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#061257] px-7 py-3 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-primary active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto sm:text-sm"
            >
              Learn about safety
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
