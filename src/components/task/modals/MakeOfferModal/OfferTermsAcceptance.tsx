'use client';

import { offerInfoBanner } from './makeOfferModalStyles';

type OfferTermsAcceptanceProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  id?: string;
};

export default function OfferTermsAcceptance({
  checked,
  onChange,
  error,
  id = 'offer-terms-accepted',
}: OfferTermsAcceptanceProps) {
  return (
    <>
      <div className={offerInfoBanner}>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#d8e0ef] text-brand-emerald focus:ring-brand-emerald/30"
        />
        <div className="font-body text-sm text-brand-dark/85 leading-relaxed">
          <p className="font-formula mb-1 font-bold tracking-tight">Terms & conditions</p>
          <p>
            By submitting this offer, I agree to complete the task if accepted and to the
            platform&apos;s{' '}
            <a href="/terms" className="font-semibold text-brand-emerald hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-semibold text-brand-emerald hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
      {error ? <p className="font-body text-sm text-red-600">{error}</p> : null}
    </>
  );
}
