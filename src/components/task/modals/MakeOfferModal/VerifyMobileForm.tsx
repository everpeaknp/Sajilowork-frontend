"use client";

import { ChevronLeft } from 'lucide-react';

interface VerifyMobileFormProps {
  phoneNumber: string;
  verificationCode: string;
  showVerificationInput: boolean;
  isLoading: boolean;
  onBack: () => void;
  onPhoneChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSendCode: () => void;
  onVerify: () => void;
}

export default function VerifyMobileForm({
  phoneNumber,
  verificationCode,
  showVerificationInput,
  isLoading,
  onBack,
  onPhoneChange,
  onCodeChange,
  onSendCode,
  onVerify
}: VerifyMobileFormProps) {
  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary font-bold mb-6 hover:underline"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <h3 className="text-2xl font-bold text-[#000d45] mb-2">
        Verify mobile <span className="text-lg text-on-surface-variant font-normal">(Optional)</span>
      </h3>
      <p className="text-sm text-on-surface-variant mb-6">
        Verifying your mobile helps build trust with clients. You can skip this step and add it later.
      </p>

      <div className="space-y-4">
        <div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="Mobile number"
            disabled={showVerificationInput}
            className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-all text-on-surface disabled:bg-surface-dim disabled:cursor-not-allowed"
          />
        </div>

        {!showVerificationInput ? (
          <>
            <button
              onClick={onSendCode}
              disabled={!phoneNumber || isLoading}
              className="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send verification code'}
            </button>
            
            <button
              onClick={onBack}
              className="w-full py-3 text-primary font-semibold hover:underline"
            >
              Skip for now
            </button>
          </>
        ) : (
          <>
            <div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => onCodeChange(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-all text-on-surface text-center text-2xl tracking-widest font-bold"
              />
            </div>

            <button
              onClick={onVerify}
              disabled={!verificationCode || verificationCode.length !== 6 || isLoading}
              className="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>

            <button
              onClick={onSendCode}
              disabled={isLoading}
              className="w-full text-primary font-semibold hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
          </>
        )}
      </div>
    </>
  );
}
