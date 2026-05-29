import Link from 'next/link';
import { Mail, Clock } from 'lucide-react';

export default function ContactContent() {
  return (
    <div className="min-w-0 space-y-8">
      <p className="text-sm leading-relaxed text-[#6a719a] sm:text-base">
        Our support team is here to help with account access, payments, disputes, and general
        questions about using tasknepal.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-[#f8faff] p-5 sm:p-6">
          <Mail className="mb-3 h-6 w-6 text-[#1161fe]" aria-hidden />
          <h2 className="text-base font-bold text-[#0b1442]">Email support</h2>
          <p className="mt-2 text-sm text-[#6a719a]">
            For the fastest response, email us with your account email and task ID (if applicable).
          </p>
          <a
            href="mailto:support@tasknepal.com"
            className="mt-4 inline-block text-sm font-semibold text-[#1161fe] hover:underline"
          >
            support@tasknepal.com
          </a>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-[#f8faff] p-5 sm:p-6">
          <Clock className="mb-3 h-6 w-6 text-[#1161fe]" aria-hidden />
          <h2 className="text-base font-bold text-[#0b1442]">Response times</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6a719a]">
            We aim to reply within one business day. Payment and safety issues are prioritised.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-100 p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#0b1442]">Before you write</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#384179] sm:text-base">
          <li>
            Check the{' '}
            <Link href="/faq" className="font-semibold text-[#1161fe] hover:underline">
              FAQ
            </Link>{' '}
            for quick answers.
          </li>
          <li>
            Review our{' '}
            <Link href="/trust-and-safety" className="font-semibold text-[#1161fe] hover:underline">
              Trust & Safety
            </Link>{' '}
            and{' '}
            <Link href="/cancellation-policy" className="font-semibold text-[#1161fe] hover:underline">
              cancellation policy
            </Link>
            .
          </li>
          <li>Do not share passwords or payment codes in your message.</li>
        </ul>
      </section>
    </div>
  );
}
