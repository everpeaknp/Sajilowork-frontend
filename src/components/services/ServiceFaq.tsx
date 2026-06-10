'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { getServiceFaq, type Service } from './serviceListData';

interface ServiceFaqProps {
  service: Service;
}

export default function ServiceFaq({ service }: ServiceFaqProps) {
  const items = getServiceFaq(service);
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="border-b border-neutral-200 pb-10 pt-10">
      <h2 className="text-2xl font-normal tracking-tight text-black sm:text-[28px]">
        Frequently Asked Questions
      </h2>

      <div className="mt-6 space-y-5">
        {items.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={item.question}>
              <div
                className={
                  isOpen
                    ? 'rounded-sm bg-[#EAF6F1] px-5 py-5 sm:px-6 sm:py-6'
                    : undefined
                }
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full cursor-pointer items-start justify-between gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-normal text-black sm:text-[15px]">
                    {item.question}
                  </span>
                  <span className="mt-0.5 shrink-0 text-black">
                    {isOpen ? (
                      <Minus className="h-4 w-4" strokeWidth={2} />
                    ) : (
                      <Plus className="h-4 w-4" strokeWidth={2} />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <p className="mt-4 max-w-3xl text-sm font-normal leading-[1.85] text-neutral-600 sm:text-[15px]">
                    {item.answer}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
