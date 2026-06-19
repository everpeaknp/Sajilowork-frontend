'use client';

import Link from 'next/link';

interface TaskCancellationPolicyProps {
  listingLabel?: 'task' | 'project';
}

export default function TaskCancellationPolicy({ listingLabel = 'task' }: TaskCancellationPolicyProps) {
  const label = listingLabel === 'project' ? 'project' : 'task';

  return (
    <section className="mt-12 border-t border-neutral-200 pt-10">
      <h2 className="mb-4 text-xl font-normal tracking-tight text-black sm:text-2xl">
        Cancellation policy
      </h2>
      <p className="max-w-3xl text-sm font-normal leading-relaxed text-neutral-600 sm:text-[15px]">
        If you are responsible for cancelling this {label}, a Cancellation Fee will be deducted from
        your next payment payout(s).
      </p>
      <Link
        href="/cancellation-policy"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-sm font-normal text-[#52C47F] transition-opacity hover:opacity-80 hover:underline sm:text-[15px]"
      >
        Learn more
      </Link>
    </section>
  );
}
