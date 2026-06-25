'use client';

import React from 'react';

/**
 * Decorative layers for idea-generator-style hero sections.
 * Uses sajilowork blue palette (not the template purple theme).
 */
export function IdeaGeneratorHeroDecor() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-400 via-[#0047ff] to-transparent opacity-25" />

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4">
          <svg
            width="800"
            height="600"
            viewBox="0 0 800 600"
            className="opacity-70 sm:opacity-80"
            aria-hidden
          >
            <defs>
              <radialGradient id="heroBlueGradient" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#0066ff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#03113c" stopOpacity="0.35" />
              </radialGradient>
              <filter id="heroBlueGlow">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M200 400 Q350 200 500 350 Q650 500 400 550 Q150 500 200 400"
              fill="url(#heroBlueGradient)"
              filter="url(#heroBlueGlow)"
              className="animate-pulse"
            />
          </svg>
        </div>

        <div className="absolute top-1/2 right-0 translate-x-1/4 -translate-y-1/2">
          <svg
            width="400"
            height="400"
            viewBox="0 0 400 400"
            className="opacity-35 sm:opacity-40"
            aria-hidden
          >
            <defs>
              <linearGradient id="heroLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#03113c" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path
              d="M50 200 Q200 50 350 200 Q200 350 50 200"
              stroke="url(#heroLineGradient)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
            />
            <circle
              cx="200"
              cy="100"
              r="3"
              fill="#38bdf8"
              className="animate-pulse"
              style={{ animationDelay: '2s' }}
            />
          </svg>
        </div>

        <div className="absolute top-1/4 left-0 -translate-x-1/2">
          <div
            className="h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-cyan-400/25 to-[#0066ff]/20 blur-3xl sm:h-64 sm:w-64"
            style={{ animationDelay: '3s' }}
          />
        </div>

        <div className="absolute bottom-1/4 right-1/4">
          <div
            className="h-28 w-28 animate-pulse rounded-full bg-gradient-to-br from-[#0047ff]/25 to-cyan-400/20 blur-2xl sm:h-32 sm:w-32"
            style={{ animationDelay: '4s' }}
          />
        </div>

        <div className="absolute top-1/4 right-0 hidden h-48 w-48 animate-pulse rounded-full bg-cyan-400 opacity-10 mix-blend-screen blur-3xl filter sm:block sm:h-64 sm:w-64" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-[#005fff] opacity-15 mix-blend-screen blur-3xl filter sm:h-72 sm:w-72" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
        aria-hidden
      />
    </>
  );
}
