'use client';

import React from 'react';
import { landingHeadlineSm } from '@/components/LangingHome/landingTypography';

interface BottomCTAProps {
  onPostClick: () => void;
}

export default function BottomCTA({ onPostClick }: BottomCTAProps) {
  return (
    <section className="bg-gray-55 py-16 text-center w-full">
      <div className="mx-auto max-w-3xl px-4 space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-[#03113c]">Can't find what you need?</h3>
        <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed font-medium">
          Post dynamic custom specifications and attract qualified freelance workers for any
          task, big or small. Free to post!
        </p>
        <button
          type="button"
          onClick={onPostClick}
          className="rounded-full bg-[#005fff] px-7 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-[#0047ff] transition duration-200 cursor-pointer shadow-md inline-flex items-center space-x-2 active:scale-95"
        >
          <span>Post a task & get offers</span>
          <span>→</span>
        </button>
      </div>
    </section>
  );
}

