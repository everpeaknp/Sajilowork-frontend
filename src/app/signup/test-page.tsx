"use client";

import { useState } from 'react';

export default function TestSignUpPage() {
  const [mounted, setMounted] = useState(false);

  useState(() => {
    setMounted(true);
  });

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4">Test Signup Page</h1>
        <p className="text-gray-600 mb-4">
          If you can see this, the basic page routing works.
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="p-2 bg-green-50 border border-green-200 rounded">
            ✅ Page component loaded
          </div>
          <div className="p-2 bg-green-50 border border-green-200 rounded">
            ✅ Client-side rendering works
          </div>
          <div className="p-2 bg-green-50 border border-green-200 rounded">
            ✅ Tailwind CSS is working
          </div>
        </div>

        <div className="mt-6">
          <a 
            href="/signup" 
            className="text-blue-600 hover:underline"
          >
            Try the real signup page →
          </a>
        </div>
      </div>
    </div>
  );
}
