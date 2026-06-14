'use client';

import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, Bell, ChevronLeft, Copy, Flag } from 'lucide-react';

interface TaskMoreOptionsProps {
  canRaiseDispute: boolean;
  onPostSimilar: () => void;
  onSetUpAlerts: () => void;
  onRaiseDispute: () => void;
  onReport: () => void;
  /** Sidebar layout — no top border / extra spacing */
  embedded?: boolean;
}

export default function TaskMoreOptions({
  canRaiseDispute,
  onPostSimilar,
  onSetUpAlerts,
  onRaiseDispute,
  onReport,
  embedded = false,
}: TaskMoreOptionsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className={embedded ? '' : 'mt-12 border-t border-neutral-200 pt-10'}>
      <div ref={containerRef} className="space-y-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/80 px-5 py-4 text-left transition-colors hover:bg-neutral-50"
        >
          <span className="text-sm font-normal text-black">More options</span>
          <ChevronLeft
            className={`h-4 w-4 text-neutral-500 transition-transform ${open ? '-rotate-90' : 'rotate-90'}`}
          />
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 rounded-xl border border-neutral-200 bg-white p-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onPostSimilar();
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-normal text-black transition-colors hover:bg-neutral-50"
                >
                  <Copy className="h-4 w-4 shrink-0 text-neutral-500" />
                  Post a similar task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSetUpAlerts();
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-normal text-black transition-colors hover:bg-neutral-50"
                >
                  <Bell className="h-4 w-4 shrink-0 text-neutral-500" />
                  Set up alerts
                </button>
                {canRaiseDispute ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onRaiseDispute();
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-normal text-black transition-colors hover:bg-neutral-50"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                    Raise a dispute
                  </button>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={onReport}
          className="flex w-full cursor-pointer items-center justify-center gap-2 py-2 text-sm font-normal text-neutral-500 transition-colors hover:text-red-600"
        >
          <Flag className="h-4 w-4" />
          Report this task
        </button>
      </div>
    </section>
  );
}
