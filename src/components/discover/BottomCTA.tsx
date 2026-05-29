'use client';

import React from 'react';
import { landingHeadlineSm } from '@/components/LangingHome/landingTypography';

interface BottomCTAProps {
  onPostClick: () => void;
}

export default function BottomCTA({ onPostClick }: BottomCTAProps) {
  return (
    <section className="w-full bg-gray-50 py-10 text-center sm:py-16">
      <div className="mx-auto max-w-3xl space-y-4 px-4 sm:px-6">
        <h3 className="text-base font-bold text-[#03113c] text-balance sm:text-xl">
          Can&apos;t find what you need?
        </h3>
        <p className="mx-auto max-w-md text-xs leading-relaxed font-medium text-gray-500 sm:text-sm">
          Post dynamic custom specifications and attract qualified freelance workers for any
          task, big or small. Free to post!
        </p>
        <button
          type="button"
          onClick={onPostClick}
          className="inline-flex min-h-12 w-full max-w-sm cursor-pointer items-center justify-center space-x-2 rounded-full bg-[#005fff] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition duration-200 active:scale-95 hover:bg-[#0047ff] sm:w-auto sm:text-sm"
        >
          <span>Post a task & get offers</span>
          <span>→</span>
        </button>
      </div>
    </section>
  );
}

