'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { ElementType, ReactNode } from 'react';

export type DashboardAccordionItemProps = {
  title: string;
  icon: ElementType;
  description: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
};

export default function DashboardAccordionItem({
  title,
  icon: Icon,
  description,
  children,
  isOpen,
  onToggle,
}: DashboardAccordionItemProps) {
  return (
    <div
      className={`mb-3 overflow-hidden rounded-xl transition-all duration-300 ${
        isOpen ? 'bg-white' : 'bg-neutral-50/50 hover:bg-white'
      }`}
    >
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between p-5 text-left outline-none sm:p-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className={`rounded-xl p-3 transition-colors ${
              isOpen ? 'bg-[#52C47F] text-white' : 'bg-neutral-100 text-neutral-400'
            }`}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 sm:text-lg">{title}</h3>
            <p className="text-sm text-neutral-500">{description}</p>
          </div>
        </div>
        <div
          className={`rounded-lg p-2 transition-transform duration-300 ${
            isOpen ? 'rotate-180 bg-emerald-50 text-[#52C47F]' : 'bg-neutral-50 text-neutral-400'
          }`}
        >
          <ChevronDown className="h-5 w-5" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-5 pt-0 sm:p-6 sm:pt-0">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
