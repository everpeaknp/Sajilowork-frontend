'use client';

import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EmployerHero from './EmployerHero';
import EmployerList from './EmployerList';

export default function EmployersContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchNonce, setSearchNonce] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSearchCommit = (e: FormEvent) => {
    e.preventDefault();
    triggerNotification(`Search applied: "${searchQuery}"`);
    setSearchNonce((n) => n + 1);
  };

  return (
    <div id="employer-page-container" className="relative animate-in fade-in text-neutral-800">
      <AnimatePresence>
        {notification ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-4 z-50 mx-auto flex max-w-xl items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              <span>{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="cursor-pointer rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <EmployerHero
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchSubmit={handleSearchCommit}
      />

      <EmployerList
        searchQuery={searchQuery}
        searchNonce={searchNonce}
        onNotify={triggerNotification}
        onClearSearch={() => {
          setSearchQuery('');
          setSearchNonce((n) => n + 1);
        }}
      />
    </div>
  );
}
