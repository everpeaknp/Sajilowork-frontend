'use client';

import { useState, type FormEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ProjectSendProposalProps {
  onSubmit?: (payload: {
    hourlyPrice: string;
    estimatedHours: string;
    coverLetter: string;
  }) => void;
}

export default function ProjectSendProposal({ onSubmit }: ProjectSendProposalProps) {
  const [hourlyPrice, setHourlyPrice] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!hourlyPrice.trim() || !estimatedHours.trim()) return;

    setSubmitting(true);
    onSubmit?.({
      hourlyPrice: hourlyPrice.trim(),
      estimatedHours: estimatedHours.trim(),
      coverLetter: coverLetter.trim(),
    });

    setTimeout(() => setSubmitting(false), 800);
  };

  const inputClassName =
    'w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-normal text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-[#52C47F] focus:ring-1 focus:ring-[#52C47F]/20';

  return (
    <section className="border-t border-black pt-10">
      <h2 className="mb-6 text-xl font-normal tracking-tight text-black sm:text-2xl">
        Send Your Proposal
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="hourly-price" className="mb-2 block text-sm font-normal text-black">
              Your hourly price
            </label>
            <input
              id="hourly-price"
              type="text"
              inputMode="decimal"
              value={hourlyPrice}
              onChange={(e) => setHourlyPrice(e.target.value)}
              className={inputClassName}
              placeholder="99"
            />
          </div>

          <div>
            <label htmlFor="estimated-hours" className="mb-2 block text-sm font-normal text-black">
              Estimated Hours
            </label>
            <input
              id="estimated-hours"
              type="text"
              inputMode="numeric"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className={inputClassName}
              placeholder="4"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cover-letter" className="mb-2 block text-sm font-normal text-black">
            Cover Letter
          </label>
          <textarea
            id="cover-letter"
            rows={8}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Describe your experience and approach for this project..."
            className={`${inputClassName} min-h-[180px] resize-y`}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#52C47F] px-6 py-3.5 text-base font-normal text-white transition-colors hover:bg-[#49b071] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Submitting...' : 'Submit a Proposal'}
          <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
        </button>
      </form>
    </section>
  );
}
