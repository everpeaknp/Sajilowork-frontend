'use client';

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, X } from 'lucide-react';
import { formatNPR } from '@/lib/nepalLocale';
import {
  buildFreelancerAboutStats,
  FREELANCER_ABOUT_DESCRIPTION,
  type Freelancer,
} from './freelancerData';
import FreelancerEducation from './FreelancerEducation';
import FreelancerExperience from './FreelancerExperience';
import FreelancerAwards from './FreelancerAwards';
import FreelancerFeaturedServices from './FreelancerFeaturedServices';
import FreelancerReviews from './FreelancerReviews';
import FreelancerSkills from './FreelancerSkills';

interface FreelancerAboutProps {
  freelancer: Freelancer;
  onContact?: (name: string, message: string) => void;
}

interface MetricItem {
  label: string;
  value: string;
  icon: ReactNode;
}

function MetricIconWrap({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FAF0E3]">
      {children}
    </div>
  );
}

export default function FreelancerAbout({ freelancer, onContact }: FreelancerAboutProps) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const stats = useMemo(() => buildFreelancerAboutStats(freelancer), [freelancer]);
  const ringParts = freelancer.ringColor.split(' ');
  const languagesLabel = freelancer.languages.join(', ');

  const metrics: MetricItem[] = [
    {
      label: 'Job Success',
      value: `${freelancer.jobSuccess}%`,
      icon: (
        <svg
          className="h-6 w-6 text-[#1F5E3D]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5.5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <path d="M3 3l6.5 6.5" />
          <path d="M8.5 9.5 11 12l5-5" />
        </svg>
      ),
    },
    {
      label: 'Total Jobs',
      value: stats.totalJobs.toLocaleString(),
      icon: (
        <svg
          className="h-6 w-6 text-[#1F5E3D]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 20h16" />
          <path d="M7 20v-5" />
          <path d="M12 20V9" />
          <path d="M17 20V13" />
          <path d="M17 13V8l3 1.5-3 1.5" />
        </svg>
      ),
    },
    {
      label: 'Total Hours',
      value: stats.totalHours.toLocaleString(),
      icon: (
        <svg
          className="h-6 w-6 text-[#1F5E3D]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      ),
    },
    {
      label: 'In Queue Service',
      value: String(stats.inQueue),
      icon: (
        <svg
          className="h-6 w-6 text-[#1F5E3D]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <circle cx="8" cy="17" r="3" />
          <path d="M8 15.5v2.5h2" />
        </svg>
      ),
    },
  ];

  const handleMessageSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) {
      return;
    }

    onContact?.(freelancer.name, contactMessage.trim());
    setMessageSent(true);
    setTimeout(() => {
      setContactMessage('');
      setShowContactModal(false);
      setMessageSent(false);
    }, 2500);
  };

  return (
    <section className="select-none border-b border-neutral-100 bg-white px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col pt-2 lg:col-span-8">
            <div className="mb-8 grid grid-cols-2 gap-x-4 gap-y-8 border-b border-neutral-100 pb-10 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
              {metrics.map((metric) => (
                <div key={metric.label} className="flex min-w-0 items-center gap-3">
                  <MetricIconWrap>{metric.icon}</MetricIconWrap>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-xs font-normal leading-tight text-black sm:text-sm">
                      {metric.label}
                    </span>
                    <span className="mt-1 text-sm font-normal leading-tight text-black">
                      {metric.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="mb-5 text-lg font-normal leading-tight tracking-tight text-black sm:text-xl">
              Description
            </h3>

            <div className="space-y-6 text-xs font-normal leading-relaxed text-black sm:text-sm">
              {FREELANCER_ABOUT_DESCRIPTION.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <FreelancerEducation freelancer={freelancer} />
            <FreelancerExperience freelancer={freelancer} />
            <FreelancerAwards freelancer={freelancer} />
            <FreelancerFeaturedServices freelancer={freelancer} />
            <FreelancerReviews freelancer={freelancer} />
          </div>

          <div className="lg:col-span-4">
            <div className="w-full max-w-[21rem] sm:max-w-[22rem]">
            <div className="rounded-none border border-neutral-200/65 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-sm md:p-8">
              <div className="flex items-baseline border-b border-neutral-100 pb-6">
                <span className="text-3xl font-normal tracking-tight text-black sm:text-4xl">
                  {formatNPR(freelancer.rate)}
                </span>
                <span className="ml-1.5 text-sm font-normal lowercase text-neutral-500">/per hour</span>
              </div>

              <div className="flex flex-col divide-y divide-neutral-100 py-2.5 font-sans">
                <DetailRow
                  label="Location"
                  value={freelancer.location}
                  icon={
                    <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  }
                />
                <DetailRow
                  label="Member since"
                  value={stats.memberSinceShort}
                  icon={
                    <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <rect x="7" y="13" width="4" height="4" rx="0.5" fill="currentColor" className="text-neutral-400" />
                      <rect x="13" y="13" width="4" height="4" rx="0.5" fill="currentColor" className="text-neutral-400" />
                    </svg>
                  }
                />
                <DetailRow
                  label="Last Delivery"
                  value={stats.lastDelivery}
                  icon={
                    <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <path d="m9 16 2 2 4-4" />
                    </svg>
                  }
                />
                <DetailRow
                  label="Gender"
                  value={stats.gender}
                  icon={
                    <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="10" cy="14" r="5" />
                      <path d="m14 10 5-5" />
                      <path d="M14 5h5v5" />
                    </svg>
                  }
                />
                <DetailRow
                  label="Languages"
                  value={languagesLabel}
                  icon={
                    <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                      <path d="M2 12h20" />
                    </svg>
                  }
                />
                <DetailRow
                  label="English Level"
                  value={stats.englishLevel}
                  icon={
                    <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <line x1="4" y1="21" x2="4" y2="14" />
                      <line x1="4" y1="10" x2="4" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12" y2="3" />
                      <line x1="20" y1="21" x2="20" y2="16" />
                      <line x1="20" y1="12" x2="20" y2="3" />
                      <line x1="2" y1="14" x2="6" y2="14" />
                      <line x1="10" y1="8" x2="14" y2="8" />
                      <line x1="18" y1="16" x2="22" y2="16" />
                    </svg>
                  }
                />
              </div>

              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-none bg-[#52C47F] py-4 text-sm font-normal text-white shadow-sm transition-all hover:bg-[#43a86c] hover:shadow-md active:scale-[0.98]"
              >
                <span>Contact Me</span>
                <svg className="h-4 w-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </button>
            </div>

            <FreelancerSkills freelancer={freelancer} />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showContactModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-none border border-neutral-100 bg-white p-6 shadow-xl md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setShowContactModal(false);
                  setMessageSent(false);
                }}
                className="absolute right-5 top-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-none border border-neutral-200 bg-neutral-50 text-neutral-500 transition-colors hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>

              {messageSent ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none border border-emerald-100 bg-emerald-50 text-emerald-500">
                    <CheckCircle2 className="h-6 w-6 animate-bounce" />
                  </div>
                  <h4 className="text-lg font-normal text-black">Message sent successfully!</h4>
                  <p className="mx-auto mt-1 max-w-xs text-xs font-normal leading-relaxed text-neutral-400">
                    {freelancer.name} receives your message directly. Expect a response back inside your
                    Inbox tab shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleMessageSubmit} className="flex flex-col">
                  <div className="mb-5 flex items-center gap-3.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 overflow-hidden rounded-none border p-0.5 ${ringParts.join(' ')}`}
                    >
                      <img
                        src={freelancer.avatar}
                        alt={freelancer.name}
                        className="h-full w-full rounded-none object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-normal text-black">
                        Contact {freelancer.name}
                      </h4>
                      <p className="mt-0.5 text-[11px] font-normal text-neutral-400">
                        Average reply rate: {stats.replyMinutes} minutes
                      </p>
                    </div>
                  </div>

                  <label className="mb-2 block text-xs font-normal text-black">
                    Write your inquiry, project description or direct message:
                  </label>
                  <textarea
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your design specifications, web details or task scope..."
                    className="min-h-[120px] w-full resize-none rounded-none border border-neutral-200 bg-neutral-50/50 p-4 text-xs font-normal text-black outline-none transition-all focus:border-[#52C47F] focus:ring-1 focus:ring-[#52C47F]/40"
                  />

                  <div className="mt-5 flex items-center justify-end gap-3.5">
                    <button
                      type="button"
                      onClick={() => setShowContactModal(false)}
                      className="cursor-pointer rounded-none border border-neutral-200 px-4 py-2.5 text-xs font-normal text-neutral-500 transition-colors hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex cursor-pointer items-center gap-2 rounded-none bg-[#52C47F] px-5 py-2.5 text-xs font-normal text-white shadow-sm transition-all hover:bg-[#43a86c] active:scale-[0.97]"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Send inquiry</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-normal text-black">{label}</span>
      </div>
      <span className="text-sm font-normal text-black">{value}</span>
    </div>
  );
}
