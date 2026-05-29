'use client';

import React from 'react';

interface TypingIndicatorProps {
  userName: string;
}

export default function TypingIndicator({ userName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-gray-500">{userName} is typing...</span>
    </div>
  );
}
