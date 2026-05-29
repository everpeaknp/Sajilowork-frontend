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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
      <div className="grid lg:grid-cols-2 gap-14 xl:gap-20 items-center">
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
              className="rounded-[28px] shadow-2xl w-full h-[520px] sm:h-[560px] object-cover"
            />
            {/* Overlay decoration */}
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-t from-[#03113c]/30 to-transparent pointer-events-none" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute -bottom-6 -right-3 sm:-bottom-7 sm:-right-6 bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-3xl shadow-[0_28px_70px_-22px_rgba(0,0,0,0.25)] border border-outline-variant/70 flex items-center gap-4 z-20"
          >
            <div className="bg-primary/10 p-3.5 rounded-2xl text-primary">
              <CheckCircle className="h-8 w-8" strokeWidth={2.5} />
            </div>
            <div>
              <p className={`${landingHeadlineSm} text-xl sm:text-2xl text-[#061257] leading-tight`}>
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

        <div className="space-y-10 sm:space-y-12">
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
              className={`${landingHeadline} text-3xl sm:text-4xl md:text-[40px] leading-[1.1] tracking-[-0.03em]`}
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
              className="inline-flex items-center justify-center rounded-full bg-[#061257] px-7 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-primary transition-colors duration-200 cursor-pointer shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Learn about safety
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
