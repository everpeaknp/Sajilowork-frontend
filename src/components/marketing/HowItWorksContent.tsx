import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import MarketingCta from './MarketingCta';
import { POST_TASK_PATH } from '@/lib/postTaskPath';

const STEPS = [
  {
    step: '1',
    title: 'Describe what you need done',
    body: 'Post your task for free in a few words. Add your location, timing, and budget so Taskers know what you need.',
  },
  {
    step: '2',
    title: 'Set your budget & receive offers',
    body: 'Local Taskers send offers with their price and availability. Compare profiles, ratings, and reviews before you choose.',
  },
  {
    step: '3',
    title: 'Pick the best person & get it done',
    body: 'Assign your Tasker, chat on-platform, and release payment only when you are happy with the work.',
  },
] as const;

const FOR_TASKERS = [
  'Browse open tasks in your area and submit offers that fit your skills.',
  'Build your reputation with verified reviews after each completed job.',
  'Get paid securely through sajilowork when the poster approves the work.',
] as const;

export default function HowItWorksContent() {
  return (
    <div className="min-w-0">
      <p className="mb-8 text-sm leading-relaxed text-[#6a719a] sm:mb-10 sm:text-base">
        Post any task. Pick the best person. Get it done — the same simple flow trusted on marketplaces
        .
      </p>

      <ol className="space-y-6">
        {STEPS.map((item) => (
          <li
            key={item.step}
            className="flex gap-4 rounded-2xl border border-gray-100 bg-brand-light-bg p-5 sm:gap-5 sm:p-6"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-emerald text-sm font-bold text-white">
              {item.step}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-brand-dark sm:text-lg">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6a719a] sm:text-base">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <MarketingCta
        primaryHref={POST_TASK_PATH}
        primaryLabel="Post your task for free"
        secondaryHref="/task"
        secondaryLabel="Browse open tasks"
      />

      <section className="mt-12 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:mt-16 sm:p-8">
        <h2 className="text-lg font-bold text-brand-dark sm:text-xl">Earn money as a Tasker</h2>
        <p className="mt-2 text-sm text-[#6a719a] sm:text-base">
          Whether you are handy around the home or offer professional services, find your next job on
          sajilowork.
        </p>
        <ul className="mt-4 space-y-3">
          {FOR_TASKERS.map((line) => (
            <li key={line} className="flex items-start gap-3 text-sm text-[#384179] sm:text-base">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-emerald" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
        <Link
          href="/signup?role=tasker"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-brand-emerald px-6 py-2.5 text-sm font-semibold text-brand-dark transition hover:bg-brand-light-bg"
        >
          Become a Tasker
        </Link>
      </section>
    </div>
  );
}
