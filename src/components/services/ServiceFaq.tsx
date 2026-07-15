'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { faqService } from '@/services/faq.service';
import { DEFAULT_SERVICE_FAQ, type Service, type ServiceFaqItem } from './serviceListData';

interface ServiceFaqProps {
  service: Service;
}

export default function ServiceFaq({ service }: ServiceFaqProps) {
  const [items, setItems] = useState<ServiceFaqItem[]>(service.faq?.length ? service.faq : DEFAULT_SERVICE_FAQ);
  const [openIndex, setOpenIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (service.faq?.length) {
      setItems(service.faq);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void faqService
      .listServicesFaq()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data?.results?.length) {
          setItems(
            res.data.results.map((item) => ({
              question: item.question,
              answer: item.answer,
            })),
          );
        } else {
          setItems(DEFAULT_SERVICE_FAQ);
        }
      })
      .catch(() => {
        if (!cancelled) setItems(DEFAULT_SERVICE_FAQ);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [service.faq]);

  return (
    <section className="border-b border-neutral-200 pb-10 pt-10 dark:border-neutral-800">
      <h2 className="text-2xl font-normal tracking-tight text-black sm:text-[28px] dark:text-stone-100">
        Frequently Asked Questions
      </h2>

      {loading ? (
        <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">Loading questions…</p>
      ) : (
        <div className="mt-6 space-y-5">
          {items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={`${item.question}-${index}`}>
                <div
                  className={
                    isOpen
                      ? 'rounded-sm bg-[#EAF6F1] px-5 py-5 sm:px-6 sm:py-6 dark:bg-emerald-950/40'
                      : undefined
                  }
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full cursor-pointer items-start justify-between gap-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-normal text-black sm:text-[15px] dark:text-stone-100">
                      {item.question}
                    </span>
                    <span className="mt-0.5 shrink-0 text-black dark:text-stone-200">
                      {isOpen ? (
                        <Minus className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <Plus className="h-4 w-4" strokeWidth={2} />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <p className="mt-4 max-w-3xl text-sm font-normal leading-[1.85] text-neutral-600 sm:text-[15px] dark:text-neutral-400">
                      {item.answer}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
