"use client";

import { ChevronLeft } from 'lucide-react';

interface DateOfBirthFormProps {
  dateOfBirth: string;
  isLoading: boolean;
  onBack: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function DateOfBirthForm({
  dateOfBirth,
  isLoading,
  onBack,
  onChange,
  onSubmit
}: DateOfBirthFormProps) {
  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-brand-emerald font-bold mb-6 hover:underline"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <h3 className="text-2xl font-bold text-brand-dark mb-2">Date of birth</h3>
      <p className="text-sm text-on-surface-variant mb-6">
        You must be 18 or older to use tasknepal
      </p>

      <div className="space-y-4">
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => onChange(e.target.value)}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
          className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:outline-none focus:border-brand-emerald transition-all text-on-surface"
        />

        <button
          onClick={onSubmit}
          disabled={!dateOfBirth || isLoading}
          className="w-full py-3 bg-brand-emerald text-white font-bold rounded-full hover:bg-brand-emerald/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </>
  );
}
