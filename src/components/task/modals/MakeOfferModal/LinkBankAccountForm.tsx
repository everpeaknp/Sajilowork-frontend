"use client";

import { ChevronLeft, Info } from 'lucide-react';

interface LinkBankAccountFormProps {
  fullName: string;
  mobileNumber: string;
  isLoading: boolean;
  onBack: () => void;
  onFullNameChange: (value: string) => void;
  onMobileNumberChange: (value: string) => void;
  onSubmit: () => void;
}

export default function LinkBankAccountForm({
  fullName,
  mobileNumber,
  isLoading,
  onBack,
  onFullNameChange,
  onMobileNumberChange,
  onSubmit
}: LinkBankAccountFormProps) {
  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary font-bold mb-6 hover:underline"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <h3 className="text-2xl font-bold text-[#000d45] mb-2">Link eSewa Account</h3>
      <p className="text-sm text-on-surface-variant mb-6">
        Add your eSewa details to receive payments
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900">
          Your eSewa details are encrypted and secure. We use bank-level security to protect your information.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-all text-on-surface"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">
            eSewa Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={mobileNumber}
            onChange={(e) => onMobileNumberChange(e.target.value)}
            placeholder="98XXXXXXXX"
            maxLength={10}
            className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-all text-on-surface"
          />
          <p className="text-xs text-on-surface-variant mt-1">
            10-digit number starting with 97 or 98
          </p>
        </div>

        <button
          onClick={onSubmit}
          disabled={!fullName || !mobileNumber || isLoading}
          className="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Linking...' : 'Link eSewa Account'}
        </button>
      </div>
    </>
  );
}
