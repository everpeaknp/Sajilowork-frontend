'use client';

import { useEffect, useState } from 'react';
import { faqService } from '@/services/faq.service';

const FALLBACK_FAQ_ITEMS = [
  {
    q: 'How much does it cost to post a task?',
    a: 'Posting a task on Sajilowork is free. You only pay when you accept an offer and funds are held securely until the work is completed to your satisfaction.',
  },
  {
    q: 'How do I choose the right Tasker?',
    a: 'Compare offers by price, availability, and profile details. Read ratings and reviews from other customers before assigning someone to your task.',
  },
  {
    q: 'When is payment taken?',
    a: 'Payment is secured when you accept an offer. Funds are held in escrow and released to the Tasker after you approve the completed work, similar to trusted marketplace models.',
  },
  {
    q: 'What if I need to cancel a task?',
    a: 'Either party may cancel depending on task status. Fees may apply after an offer is accepted. See our cancellation policy for full details.',
  },
  {
    q: 'How do Taskers get paid?',
    a: 'After the poster approves completion, payment is released to the Tasker through the platform wallet and supported payout methods.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'We use verification, secure payments, and platform messaging to reduce risk. Read our Privacy Policy for how we handle your data.',
  },
  {
    q: 'Can I communicate off the platform?',
    a: 'We recommend keeping all task communication on Sajilowork so support can help if there is a dispute or payment issue.',
  },
  {
    q: 'How do I contact support?',
    a: 'Use the Contact Us page to email our team. Include your account email and task ID for faster help.',
  },
] as const;

type FaqContentProps = {
  sharpBlack?: boolean;
};

export default function FaqContent({ sharpBlack = false }: FaqContentProps) {
  const [items, setItems] = useState<{ q: string; a: string }[]>([...FALLBACK_FAQ_ITEMS]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void faqService
      .listGeneralFaq()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data?.results?.length) {
          setItems(
            res.data.results.map((item) => ({
              q: item.question,
              a: item.answer,
            })),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setItems([...FALLBACK_FAQ_ITEMS]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-neutral-500">Loading FAQ…</p>;
  }

  return (
    <div className="min-w-0 space-y-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-2xl border border-gray-100 bg-brand-light-bg open:bg-white open:shadow-sm"
        >
          <summary
            className={`cursor-pointer list-none px-5 py-4 text-sm marker:content-none sm:text-base [&::-webkit-details-marker]:hidden ${
              sharpBlack
                ? 'font-normal tracking-tight text-black'
                : 'font-bold text-brand-dark'
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              {item.q}
              <span
                className={`transition group-open:rotate-45 ${sharpBlack ? 'text-black' : 'text-brand-emerald'}`}
              >
                +
              </span>
            </span>
          </summary>
          <div
            className={`border-t border-gray-100 px-5 pb-4 pt-3 text-sm leading-relaxed sm:text-base ${
              sharpBlack ? 'text-neutral-900' : 'text-[#6a719a]'
            }`}
          >
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}
